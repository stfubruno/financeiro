import json
import random
import os
from datetime import datetime, timedelta

def gerar_dados_ficticios():
    DATA_INICIO  = datetime(2020, 1, 1, 10, 0, 0)
    DATA_LIMITE  = datetime(2026, 5, 28, 23, 59, 0)

    TRANSACOES_POR_MES = 6
    SALDO_INICIAL      = 50000.0
    META               = 1_500_000.0
    APORTE             = 1_539.52
    lista_razoes_remove = [
        'Netflix', 'Amazon', 'Aluguel', 'Supermercado', 'Combustível',
        'Spotify', 'Energia', 'Internet', 'Restaurante', 'Farmácia',
        'Academia', 'Seguro Auto', 'IPTU', 'Plano de Saúde', 'Roupas',
    ]

    lista_razoes_add = [
        'Salário', 'Investimentos', 'Presente', 'Venda', 'Freelance',
        'Décimo Terceiro', 'Dividendos', 'Aluguel Recebido', 'Bônus',
    ]

    total_dias = (DATA_LIMITE - DATA_INICIO).days
    intervalo_medio = 30 / TRANSACOES_POR_MES

    historico = []
    saldo = SALDO_INICIAL
    data_atual = DATA_INICIO

    historico.append({
        "acao":       "start",
        "quantidade": SALDO_INICIAL,
        "data":       data_atual.strftime("%d/%m/%Y %H:%M:%S"),
    })

    while True:
        dias_avanco  = max(1, int(random.gauss(intervalo_medio, intervalo_medio * 0.4)))
        horas_avanco = random.randint(0, 23)
        mins_avanco  = random.randint(0, 59)
        data_atual  += timedelta(days=dias_avanco, hours=horas_avanco, minutes=mins_avanco)

        if data_atual > DATA_LIMITE:
            break

        acao = random.choices(['add', 'remove'], weights=[0.55, 0.45])[0]

        if acao == 'add':
            anos_decorridos = (data_atual - DATA_INICIO).days / 365.25
            fator_crescimento = 1 + anos_decorridos * 0.03   # +3% ao ano
            quantidade = round(random.uniform(200.0, 3500.0) * fator_crescimento, 2)
            saldo += quantidade
            razao = random.choice(lista_razoes_add)
        else:
            anos_decorridos = (data_atual - DATA_INICIO).days / 365.25
            fator_crescimento = 1 + anos_decorridos * 0.025
            quantidade = round(random.uniform(80.0, 1800.0) * fator_crescimento, 2)
            saldo -= quantidade
            razao = random.choice(lista_razoes_remove)

        historico.append({
            "acao":       acao,
            "quantidade": quantidade,
            "data":       data_atual.strftime("%d/%m/%Y %H:%M:%S"),
            "razao":      razao,
        })

    dados_completos = {
        "saldo_inicial": SALDO_INICIAL,
        "saldo":         round(saldo, 2),
        "meta":          META,
        "aporte":        APORTE,
        "historico":     historico,
    }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'db', 'database.json')

    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(dados_completos, f, indent=4, ensure_ascii=False)

    saldo_final = saldo
    print(f"Gerados {len(historico)} registros no {db_path}.")
    print(f"Período: {DATA_INICIO.strftime('%d/%m/%Y')} → {DATA_LIMITE.strftime('%d/%m/%Y')}")
    print(f"Saldo Final: R$ {saldo_final:,.2f}")

if __name__ == "__main__":
    gerar_dados_ficticios()
