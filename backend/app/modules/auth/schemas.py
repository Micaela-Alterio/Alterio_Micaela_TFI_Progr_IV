from pydantic import BaseModel
from app.modules.usuarios.schemas import UserCreate, UserPublic


class MessageResponse(BaseModel):
    message: str


__all__ = ["UserCreate", "UserPublic", "MessageResponse"]
