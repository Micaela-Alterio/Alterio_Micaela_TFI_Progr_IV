from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def __init__(self, session: Session):
        super().__init__(model_or_session=Usuario, session=session)

    def get_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.email == email)
        return self.session.exec(statement).first()

    def get_by_username_or_email(self, identifier: str) -> Usuario | None:
        statement = select(Usuario).where(
            (Usuario.username == identifier) | (Usuario.email == identifier)
        )
        return self.session.exec(statement).first()
