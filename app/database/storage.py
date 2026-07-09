import json
import os
import tempfile
import fcntl
from typing import Dict, Any

class Armazenamento:

    def __init__(self, nome_arquivo: str = 'database.json'):
        db_path_env = os.getenv('DB_PATH')
        if db_path_env:
            self.caminho_arquivo = db_path_env
            self.diretorio = os.path.dirname(db_path_env)
        else:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.diretorio = os.path.join(base_dir, 'db')
            self.caminho_arquivo = os.path.join(self.diretorio, nome_arquivo)

        self._lock_path = self.caminho_arquivo + '.lock'
        os.makedirs(self.diretorio, exist_ok=True)


    def _adquirir_lock(self, modo: int):
        fd = open(self._lock_path, 'w')
        fcntl.flock(fd, modo)
        return fd

    def _liberar_lock(self, fd) -> None:
        fcntl.flock(fd, fcntl.LOCK_UN)
        fd.close()


    def carregar(self) -> Dict[str, Any]:
        fd = self._adquirir_lock(fcntl.LOCK_SH)
        try:
            if os.path.exists(self.caminho_arquivo):
                with open(self.caminho_arquivo, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {"saldo_inicial": 0.0, "saldo": 0.0, "meta": 0.0, "historico": []}
        finally:
            self._liberar_lock(fd)

    def salvar(self, dados: Dict[str, Any]) -> None:
        fd = self._adquirir_lock(fcntl.LOCK_EX)
        try:
            tmp_fd, tmp_path = tempfile.mkstemp(dir=self.diretorio, suffix='.tmp')
            try:
                with os.fdopen(tmp_fd, 'w', encoding='utf-8') as f:
                    json.dump(dados, f, indent=4, ensure_ascii=False)
                os.replace(tmp_path, self.caminho_arquivo)
            except Exception:
                os.unlink(tmp_path)
                raise
        finally:
            self._liberar_lock(fd)
