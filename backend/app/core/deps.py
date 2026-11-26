from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(
    request: Request,
    session: Session = Depends(get_session),
) -> Usuario:
    """
    Lee la cookie HttpOnly 'access_token' (con fallback a encabezado Authorization Bearer).
    Lanza 401 si falta o es inválida.
    """
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    sub = payload.get("sub")
    user_id = payload.get("id")

    if not sub and user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = None
    if user_id is not None:
        user = session.get(Usuario, user_id)
    if not user and sub:
        statement = select(Usuario).where(
            (Usuario.username == sub) | (Usuario.email == sub)
        )
        user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Valida que el usuario autenticado no esté desactivado."""
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(allowed_roles: str | list[str]):
    """Dependencia para verificar que el usuario posea uno de los roles solicitados."""
    roles = [allowed_roles] if isinstance(allowed_roles, str) else allowed_roles

    def role_checker(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes",
            )
        return current_user

    return role_checker
