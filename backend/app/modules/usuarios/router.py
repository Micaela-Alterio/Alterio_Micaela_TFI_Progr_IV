from fastapi import APIRouter, Depends, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["admin-usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get("", response_model=list[UserPublic], status_code=status.HTTP_200_OK)
def listar_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> list[UserPublic]:
    return service.listar_usuarios()


@router.post(
    "/{id}/activar", response_model=UserPublic, status_code=status.HTTP_200_OK
)
def activar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> UserPublic:
    return service.activar_usuario(usuario_id=id)


@router.post(
    "/{id}/desactivar", response_model=UserPublic, status_code=status.HTTP_200_OK
)
def desactivar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> UserPublic:
    return service.desactivar_usuario(
        usuario_id=id, current_user_id=current_user.id
    )
