from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.database.storage import Armazenamento
from itertools import islice

class Controlador:

    def __init__(self, armazenamento: Armazenamento):
        self.db = armazenamento
        self.dados = self.db.carregar()

        if "adicionado_total" not in self.dados:
            self.dados["adicionado_total"] = sum(
                x['quantidade'] for x in self.dados.get("historico", []) if x['acao'] == 'add'
            )
            self.db.salvar(self.dados)
        if "removido_total" not in self.dados:
            self.dados["removido_total"] = sum(
                x['quantidade'] for x in self.dados.get("historico", []) if x['acao'] == 'remove'
            )
            self.db.salvar(self.dados)

    def _recarregar(self) -> None:
        self.dados = self.db.carregar()


    @property
    def saldo_inicial(self) -> float:
        return self.dados.get("saldo_inicial", 0.0)

    @property
    def saldo(self) -> float:
        return self.dados.get("saldo", 0.0)

    @property
    def meta(self) -> float:
        return self.dados.get("meta", 0.0)

    @property
    def historico(self) -> List[Dict[str, Any]]:
        return self.dados.get("historico", [])

    @property
    def adicionado(self) -> float:
        return self.dados.get("adicionado_total", 0.0)

    @property
    def removido(self) -> float:
        return self.dados.get("removido_total", 0.0)


    def _registrar_movimentacao(self, acao: str, quantidade: float, razao: str = "") -> None:
        registro = {
            "acao": acao,
            "quantidade": quantidade,
            "data": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        }
        if razao:
            registro["razao"] = razao
        self.dados["historico"].append(registro)
        self.db.salvar(self.dados)

    def _cortar_por_periodo(self, historico: list, start_str: str, end_str: str):
        if not start_str and not end_str:
            return 0.0, historico

        start_dt = None
        end_dt = None
        if start_str:
            start_dt = datetime.strptime(start_str, "%Y-%m-%d")
        if end_str:
            end_dt = datetime.strptime(end_str, "%Y-%m-%d").replace(hour=23, minute=59, second=59)

        saldo_base = 0.0
        filtrado = []

        for item in historico:
            try:
                dt = datetime.strptime(item['data'], "%d/%m/%Y %H:%M:%S")
            except (ValueError, KeyError):
                filtrado.append(item)
                continue

            if start_dt and dt < start_dt:
                if item['acao'] in ('start', 'add'):
                    saldo_base += item['quantidade']
                elif item['acao'] == 'remove':
                    saldo_base -= item['quantidade']
            elif end_dt and dt > end_dt:
                continue
            else:
                filtrado.append(item)

        return saldo_base, filtrado


    def iniciar(self, valor: float) -> bool:
        if valor <= 0:
            return False
        self._recarregar()
        self.dados["saldo_inicial"] += valor
        self._registrar_movimentacao("start", valor)
        return True

    def adicionar(self, valor: float, razao: str = "") -> bool:
        if valor <= 0:
            return False
        self._recarregar()
        self.dados["saldo"] += valor
        self.dados["adicionado_total"] += valor
        self._registrar_movimentacao("add", valor, razao)
        return True

    def remover(self, valor: float, razao: str = "") -> bool:
        if valor <= 0:
            return False
        self._recarregar()
        self.dados["saldo"] -= valor
        self.dados["removido_total"] += valor
        self._registrar_movimentacao("remove", valor, razao)
        return True

    def definir_meta(self, valor: float) -> bool:
        if valor <= 0:
            return False
        self._recarregar()
        self.dados["meta"] = valor
        self.db.salvar(self.dados)
        return True


    def info_dashboard(self, saldo_base: float, historico_filtrado: list) -> Dict[str, Any]:
        acc = saldo_base
        grafico_evolucao = []
        fluxo_mensal: Dict[str, Any] = {}
        month_names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

        for item in historico_filtrado:
            if item['acao'] in ('start', 'add'):
                acc += item['quantidade']
            elif item['acao'] == 'remove':
                acc -= item['quantidade']

            day_date = item['data'].split(' ')[0][:5]
            if grafico_evolucao and grafico_evolucao[-1]['name'] == day_date:
                grafico_evolucao[-1]['Saldo'] = acc
            else:
                grafico_evolucao.append({
                    'name': day_date,
                    'fullDate': item['data'],
                    'Saldo': acc,
                    'tipo': item['acao'],
                })

            if item['acao'] != 'start':
                try:
                    parts = item['data'].split(' ')[0].split('/')
                    if len(parts) == 3:
                        _, mes, ano = parts
                        month_label = f"{month_names[int(mes) - 1]}/{ano[2:]}"
                        sort_key = f"{ano}{mes}"
                        if month_label not in fluxo_mensal:
                            fluxo_mensal[month_label] = {
                                'name': month_label, 'sortKey': sort_key,
                                'add': 0, 'remove': 0,
                            }
                        if item['acao'] == 'add':
                            fluxo_mensal[month_label]['add'] += item['quantidade']
                        elif item['acao'] == 'remove':
                            fluxo_mensal[month_label]['remove'] += item['quantidade']
                except Exception:
                    pass

        fluxo_list = sorted(fluxo_mensal.values(), key=lambda x: x['sortKey'])

        if len(grafico_evolucao) > 150:
            step = len(grafico_evolucao) / 150.0
            grafico_evolucao = [grafico_evolucao[int(i * step)] for i in range(150)]

        return {"grafico_evolucao": grafico_evolucao, "fluxo_mensal": fluxo_list}

    def buscar_historico(self, historico_filtrado: list, termo: str) -> list:
        if not termo:
            return list(reversed(historico_filtrado))[:500]

        termo_lower = termo.lower()

        gerador_filtrado = (
            tx for tx in reversed(historico_filtrado)
            if termo_lower in tx.get("razao", "").lower()
            or termo_lower in str(tx.get("quantidade", ""))
            or termo_lower in tx.get("data", "")
        )

        return list(islice(gerador_filtrado, 500))

    def deletar_movimentacao(self, data: str, acao: str, quantidade: float, razao: str = "") -> bool:
        self._recarregar()
        historico = self.dados.get("historico", [])
        for idx, item in enumerate(historico):
            if (item['data'] == data and item['acao'] == acao
                    and item['quantidade'] == quantidade
                    and item.get('razao', "") == razao):
                if acao == 'add':
                    self.dados['saldo'] -= quantidade
                    self.dados['adicionado_total'] -= quantidade
                elif acao == 'remove':
                    self.dados['saldo'] += quantidade
                    self.dados['removido_total'] -= quantidade
                elif acao == 'start':
                    self.dados['saldo_inicial'] -= quantidade
                del historico[idx]
                self.db.salvar(self.dados)
                return True
        return False
