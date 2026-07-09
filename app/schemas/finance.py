from pydantic import BaseModel, Field

class MetaModel(BaseModel):
    valor: float = Field(..., gt=0, description="Valor deve ser maior que zero")

class TransacaoModel(BaseModel):
    valor: float = Field(..., gt=0, description="Valor deve ser positivo")
    razao: str = Field(..., min_length=1, description="Razão é obrigatória")

class DeleteTransacaoModel(BaseModel):
    data: str
    acao: str
    quantidade: float
    razao: str = ""
