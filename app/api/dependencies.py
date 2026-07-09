from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database.storage import Armazenamento
from app.services.controller import Controlador

db = Armazenamento()
controlador = Controlador(db)

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
