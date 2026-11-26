from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.exceptions import (
    PedidoAjeno,
    PedidoNoEncontrado,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoEstadoUpdate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import PedidoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.crear(data=data, usuario_id=current_user.id)
    except ProductoRepetido as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except ProductoNoDisponible as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except StockInsuficiente as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )


@router.get("", response_model=PedidosPaginados, status_code=status.HTTP_200_OK)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: str | None = Query(None),
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidosPaginados:
    return service.listar(
        current_user=current_user,
        skip=skip,
        limit=limit,
        estado=estado,
    )


# Declarado ANTES de /{id} para que no sea interceptado
@router.get(
    "/resumen", response_model=ResumenPedidos, status_code=status.HTTP_200_OK
)
def obtener_resumen_pedidos(
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> ResumenPedidos:
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def obtener_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.obtener_por_id(pedido_id=id, current_user=current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=exc.message
        )


@router.patch(
    "/{id}/estado", response_model=PedidoRead, status_code=status.HTTP_200_OK
)
def actualizar_estado_pedido(
    id: int,
    data: PedidoEstadoUpdate,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(require_role("admin")),
) -> PedidoRead:
    try:
        return service.actualizar_estado(pedido_id=id, nuevo_estado=data.estado)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )


@router.patch(
    "/{id}/cancelar", response_model=PedidoRead, status_code=status.HTTP_200_OK
)
def cancelar_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id=id, current_user=current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        )
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=exc.message
        )
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
