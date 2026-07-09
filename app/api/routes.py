from fastapi import APIRouter, Query, Request, HTTPException
from app.api.dependencies import controlador, limiter
from app.schemas.finance import MetaModel, TransacaoModel, DeleteTransacaoModel

router = APIRouter()

@router.get("/health", tags=["Infra"])
def health_check():
    return {"status": "ok", "service": "financeiro-api", "version": "2.0.0"}


@router.get("/dados/resumo", tags=["Dashboard"])
@limiter.limit("200/minute")
def obter_resumo(
    request: Request,
    start: str = Query("", description="Data inicial YYYY-MM-DD"),
    end: str = Query("", description="Data final YYYY-MM-DD"),
):
    controlador._recarregar()
    historico_completo = controlador.historico
    saldo_base, _ = controlador._cortar_por_periodo(historico_completo, start, end)
    
    return {
        "saldo_inicial": controlador.saldo_inicial,
        "saldo": controlador.saldo,
        "saldo_total": controlador.saldo_inicial + controlador.saldo,
        "meta": controlador.meta,
        "adicionado": controlador.adicionado,
        "removido": controlador.removido,
    }


@router.get("/dados/graficos", tags=["Dashboard"])
@limiter.limit("200/minute")
def obter_graficos(
    request: Request,
    start: str = Query("", description="Data inicial YYYY-MM-DD"),
    end: str = Query("", description="Data final YYYY-MM-DD"),
):
    controlador._recarregar()
    historico_completo = controlador.historico
    saldo_base, historico_filtrado = controlador._cortar_por_periodo(
        historico_completo, start, end
    )
    dash = controlador.info_dashboard(saldo_base, historico_filtrado)

    return {
        "grafico_evolucao": dash["grafico_evolucao"],
        "fluxo_mensal": dash["fluxo_mensal"],
    }


@router.get("/dados/historico", tags=["Dashboard"])
@limiter.limit("200/minute")
def obter_historico(
    request: Request,
    q: str = Query("", description="Termo de pesquisa opcional"),
    start: str = Query("", description="Data inicial YYYY-MM-DD"),
    end: str = Query("", description="Data final YYYY-MM-DD"),
):
    controlador._recarregar()
    historico_completo = controlador.historico
    _, historico_filtrado = controlador._cortar_por_periodo(
        historico_completo, start, end
    )

    return {
        "historico": controlador.buscar_historico(historico_filtrado, q.strip()),
    }


@router.post("/iniciar", tags=["Transações"])
@limiter.limit("60/minute")
def iniciar(request: Request, dados: MetaModel):
    sucesso = controlador.iniciar(dados.valor)
    if not sucesso:
        raise HTTPException(status_code=422, detail="Valor inválido para iniciar saldo")
    return {"sucesso": sucesso}


@router.post("/adicionar", tags=["Transações"])
@limiter.limit("60/minute")
def adicionar_valor(request: Request, dados: TransacaoModel):
    sucesso = controlador.adicionar(dados.valor, dados.razao.strip())
    if not sucesso:
        raise HTTPException(status_code=422, detail="Falha ao adicionar valor")
    return {"sucesso": sucesso}


@router.post("/remover", tags=["Transações"])
@limiter.limit("60/minute")
def remover_valor(request: Request, dados: TransacaoModel):
    sucesso = controlador.remover(dados.valor, dados.razao.strip())
    if not sucesso:
        raise HTTPException(status_code=422, detail="Falha ao remover valor")
    return {"sucesso": sucesso}


@router.post("/meta", tags=["Metas"])
@limiter.limit("30/minute")
def definir_meta(request: Request, dados: MetaModel):
    sucesso = controlador.definir_meta(dados.valor)
    if not sucesso:
        raise HTTPException(status_code=422, detail="Valor de meta inválido")
    return {"sucesso": sucesso}


@router.delete("/deletar", tags=["Transações"])
@limiter.limit("60/minute")
def deletar_transacao(request: Request, dados: DeleteTransacaoModel):
    sucesso = controlador.deletar_movimentacao(
        dados.data, dados.acao, dados.quantidade, dados.razao
    )
    if not sucesso:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return {"sucesso": True}
