from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models import Workflow
from models.response import Http
from models.schema import ResponseModel
from uuid import UUID
from tasks import process_webhook_task  # celery task

async def webhook_start(db: AsyncSession, workflow_id: UUID, data: dict) -> ResponseModel:
    print(f"Webhook received for workflow {workflow_id}, data: {data}")

    try:
        result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
        workflow = result.scalar_one_or_none()

        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="Workflow not found"
            )

        user_id = str(workflow.user_id)

        process_webhook_task.apply_async(
            args=[user_id, str(workflow_id), data],
            queue="webhooks"
        )

        workflow.status = "running"
        await db.commit()

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow queued successfully",
            data={"workflow_id": str(workflow.id)}
        )

    except Exception as e:
        await db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=str(e)
        )
