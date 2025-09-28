from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.exc import SQLAlchemyError
from db.models import User, Credentials
from models.schema import ResponseModel, CredentialsBase, CredentialResponse
from models.response import Http
from uuid import UUID
from typing import List

async def create_credentials(db: AsyncSession, credentials_data: CredentialsBase) -> ResponseModel:
    if not credentials_data.user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        new_credentials = Credentials(
            name=credentials_data.name,
            type=credentials_data.type,
            data=credentials_data.data,
            user_id=credentials_data.user_id,
        )
        db.add(new_credentials)
        await db.commit()
        await db.refresh(new_credentials)

        credential_response = CredentialResponse.model_validate(new_credentials)
        return ResponseModel(
            status=Http.StatusOk,
            message="Credentials created successfully",
            data=credential_response
        )

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        await db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred: {str(e)}",
            data=None
        )


async def get_credentials(db: AsyncSession, user_id: str) -> ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="User not found",
                data=None
            )

        result = await db.execute(select(Credentials).where(Credentials.user_id == user_id))
        from typing import Sequence
        creds: Sequence[Credentials] = result.scalars().all()

        response_data = [CredentialResponse.model_validate(c) for c in creds]
        return ResponseModel(
            status=Http.StatusOk,
            message="Credentials fetched successfully",
            data=response_data
        )
    except SQLAlchemyError as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred: {str(e)}",
            data=None
        )


async def delete_credentials(db: AsyncSession, credential_id: UUID, user_id: str) -> ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="User not found",
                data=None
            )

        result = await db.execute(
            select(Credentials).where(Credentials.id == credential_id, Credentials.user_id == user_id)
        )
        credential = result.scalar_one_or_none()
        if not credential:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="Credentials not found",
                data=None
            )

        await db.delete(credential)
        await db.commit()

        return ResponseModel(
            status=Http.StatusOk,
            message="Credential deleted successfully",
            data=None
        )

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        await db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred: {str(e)}",
            data=None
        )
