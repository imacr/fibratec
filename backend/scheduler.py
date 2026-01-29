import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

from main import app
from main import (
    enviar_alertas_verificacion,
    enviar_alertas_semanales,
    enviar_alertas_refrendo_tenencia,
    enviar_alertas_garantias,
    enviar_alertas_mantenimientos
)

# --------------------------------------------------
# LOGGING
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SCHEDULER] %(levelname)s: %(message)s"
)

# --------------------------------------------------
# JOBSTORE (SQLite absoluta)
# --------------------------------------------------
jobstores = {
    "default": SQLAlchemyJobStore(
        url="sqlite:////var/www/control_vehicular/fibratec/backend/jobs.sqlite"
    )
}

scheduler = BlockingScheduler(
    jobstores=jobstores,
    timezone="America/Mexico_City"
)

# --------------------------------------------------
# FUNCION AUXILIAR PARA EJECUTAR JOBS
# --------------------------------------------------
def ejecutar_job(fn, nombre):
    with app.app_context():
        logging.info(f"🚀 Ejecutando job: {nombre}")
        try:
            fn()
            logging.info(f"✅ Job {nombre} ejecutado correctamente")
        except Exception as e:
            logging.error(f"❌ Error en job {nombre}: {e}")

# --------------------------------------------------
# JOBS CADA 7 DÍAS, ESCALONADOS 1 MINUTO ENTRE ELLOS
# --------------------------------------------------
ahora = datetime.now()

scheduler.add_job(
    lambda: ejecutar_job(enviar_alertas_verificacion, "Verificación"),
    trigger="interval",
    days=7,
    start_date=ahora + timedelta(minutes=1),
    id="verificacion",
    max_instances=1,
    coalesce=True,
    replace_existing=True
)

scheduler.add_job(
    lambda: ejecutar_job(enviar_alertas_semanales, "Semanales"),
    trigger="interval",
    days=7,
    start_date=ahora + timedelta(minutes=2),
    id="semanales",
    max_instances=1,
    coalesce=True,
    replace_existing=True
)

scheduler.add_job(
    lambda: ejecutar_job(enviar_alertas_refrendo_tenencia, "Refrendo/Tenencia"),
    trigger="interval",
    days=7,
    start_date=ahora + timedelta(minutes=3),
    id="refrendo",
    max_instances=1,
    coalesce=True,
    replace_existing=True
)

scheduler.add_job(
    lambda: ejecutar_job(enviar_alertas_garantias, "Garantías"),
    trigger="interval",
    days=7,
    start_date=ahora + timedelta(minutes=4),
    id="garantias",
    max_instances=1,
    coalesce=True,
    replace_existing=True
)

scheduler.add_job(
    lambda: ejecutar_job(enviar_alertas_mantenimientos, "Mantenimientos"),
    trigger="interval",
    days=7,
    start_date=ahora + timedelta(minutes=5),
    id="mantenimientos",
    max_instances=1,
    coalesce=True,
    replace_existing=True
)

# --------------------------------------------------
# ARRANQUE
# --------------------------------------------------
if __name__ == "__main__":
    logging.info("🟢 Scheduler en producción iniciado")
    scheduler.start()
