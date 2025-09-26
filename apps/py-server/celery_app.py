from celery import Celery
import os

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery = Celery(
    "workflow_executor",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)

# Modern way to configure Celery settings
celery.conf.update(
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "tasks.poll_inbox_task": {"queue": "emails"},
        "tasks.process_webhook_task": {"queue": "webhooks"}
    },
    beat_schedule={
        "poll-inbox-every-1-min": {
            "task": "tasks.poll_inbox_task",
            "schedule": 30.0, 
        },
    }
)

# Import tasks so Celery discovers them
import tasks

#celery -A celery_app.celery worker --loglevel=info -Q webhooks

"""

# Terminal 1
celery -A celery_app worker -Q webhooks -c 5 --loglevel=info

# Terminal 2
celery -A celery_app worker -Q webhooks -c 5 --loglevel=info

-c 1 → one task at a time per worker

-c 5 → 5 tasks at a time per worker

"""