"""
gunicorn.conf.py — Configuração de produção para a API Financeiro

Uso:
    gunicorn -c gunicorn.conf.py app.main:app

Documentação oficial:
    https://docs.gunicorn.org/en/stable/settings.html
"""

import multiprocessing
import os

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

workers = int(os.getenv("WEB_CONCURRENCY", (2 * multiprocessing.cpu_count()) + 1))

worker_class = "uvicorn.workers.UvicornWorker"

threads = int(os.getenv("WORKER_THREADS", "1"))

timeout = int(os.getenv("WORKER_TIMEOUT", "30"))

graceful_timeout = 20

keepalive = 5

max_requests = 1000

max_requests_jitter = 100

loglevel = os.getenv("LOG_LEVEL", "info")

accesslog = "-"
errorlog = "-"

access_log_format = (
    '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s '
    '"%(f)s" "%(a)s" %(D)sµs'
)

backlog = 2048


def on_starting(server):
    server.log.info("Gunicorn iniciando — %d worker(s) × %s", workers, worker_class)

def on_exit(server):
    server.log.info("Gunicorn encerrando gracefully")

def worker_int(worker):
    worker.log.info("Worker %s recebeu SIGINT", worker.pid)

def worker_abort(worker):
    worker.log.warning("Worker %s abortado (timeout?)", worker.pid)
