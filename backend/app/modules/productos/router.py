from fastapi import APIRouter, Depends, Query, status
from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


@router.get(
    "", response_model=ProductosPaginados, status_code=status.HTTP_200_OK
)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categoria_id: int | None = Query(None),
    disponible: bool | None = Query(None),
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar_paginado(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK
)
def obtener_producto(
    id: int,
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    return service.obtener_por_id(id)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> ProductoRead:
    return service.crear(data)


@router.put("/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_producto(
    id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> ProductoRead:
    return service.actualizar(id, data)


@router.patch(
    "/{id}/stock", response_model=ProductoRead, status_code=status.HTTP_200_OK
)
def actualizar_stock_producto(
    id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> ProductoRead:
    return service.actualizar_stock(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    id: int,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> None:
    service.eliminar(id)
