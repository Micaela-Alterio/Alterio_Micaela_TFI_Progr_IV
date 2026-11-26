from fastapi import APIRouter, Depends, status
from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import CategoriaService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


@router.get("", response_model=list[CategoriaRead], status_code=status.HTTP_200_OK)
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    return service.listar_activas()


@router.get(
    "/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK
)
def obtener_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    return service.obtener_por_id(id)


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> CategoriaRead:
    return service.crear(data)


@router.put(
    "/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK
)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> CategoriaRead:
    return service.actualizar(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> None:
    service.eliminar(id)
