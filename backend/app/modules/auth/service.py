from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork | None = None):
        self.uow = uow or UsuarioUnitOfWork()

    def register(self, user_create: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(user_create.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya se encuentra registrado",
                )
            if uow.usuarios.get_by_email(user_create.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya se encuentra registrado",
                )

            hashed = hash_password(user_create.password)
            nuevo_usuario = Usuario(
                username=user_create.username,
                full_name=user_create.full_name,
                email=user_create.email,
                hashed_password=hashed,
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(nuevo_usuario)

    def authenticate(self, identifier: str, password: str) -> Usuario:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username_or_email(identifier.strip())
            if not usuario or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            uow.session.expunge(usuario)
            return usuario
