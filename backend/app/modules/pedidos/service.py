from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.modules.pedidos.exceptions import (
    PedidoAjeno,
    PedidoNoEncontrado,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork | None = None):
        self.uow = uow or PedidoUnitOfWork()

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        if not data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El pedido debe contener al menos un producto",
            )

        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido(
                "No se permiten productos repetidos en el pedido"
            )

        with self.uow as uow:
            detalles: list[DetallePedido] = []
            total = 0.0

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Producto con id {item.producto_id} no encontrado o inactivo",
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no se encuentra disponible"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}'. Stock disponible: {producto.stock}, solicitado: {item.cantidad}"
                    )

                # Descuenta stock
                producto.stock -= item.cantidad
                uow.productos.update(producto)

                subtotal = round(item.cantidad * producto.precio_base, 2)
                total += subtotal

                detalle = DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                detalles.append(detalle)

            now = datetime.now(timezone.utc)
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=round(total, 2),
                created_at=now,
                updated_at=now,
                items=detalles,
            )
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        current_user: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        usuario_id = None if current_user.role == "admin" else current_user.id
        with self.uow as uow:
            total, items = uow.pedidos.filtrar_paginado(
                usuario_id=usuario_id,
                estado=estado,
                skip=skip,
                limit=limit,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items],
            )

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            resumen_dict = uow.pedidos.get_resumen()
            return ResumenPedidos(**resumen_dict)

    def obtener_por_id(
        self, pedido_id: int, current_user: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(
                    f"Pedido con id {pedido_id} no encontrado"
                )

            if (
                current_user.role != "admin"
                and pedido.usuario_id != current_user.id
            ):
                raise PedidoAjeno("No tiene permisos para ver este pedido")

            return PedidoRead.model_validate(pedido)

    def actualizar_estado(
        self, pedido_id: int, nuevo_estado: str
    ) -> PedidoRead:
        nuevo_estado = nuevo_estado.strip().upper()
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(
                    f"Pedido con id {pedido_id} no encontrado"
                )

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if nuevo_estado not in permitidos:
                raise TransicionInvalida(
                    f"Transición inválida de {pedido.estado} a {nuevo_estado}"
                )

            # Restituye stock si pasa a CANCELADO (RN-03)
            if nuevo_estado == "CANCELADO":
                for item in pedido.items:
                    prod = uow.productos.get_by_id(item.producto_id)
                    if prod:
                        prod.stock += item.cantidad
                        uow.productos.update(prod)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.update(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, current_user: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(
                    f"Pedido con id {pedido_id} no encontrado"
                )

            if pedido.usuario_id != current_user.id:
                raise PedidoAjeno("No tiene permisos para cancelar este pedido")

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    f"Solo se pueden cancelar pedidos en estado PENDIENTE. Estado actual: {pedido.estado}"
                )

            # Restituye stock (RN-03)
            for item in pedido.items:
                prod = uow.productos.get_by_id(item.producto_id)
                if prod:
                    prod.stock += item.cantidad
                    uow.productos.update(prod)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.update(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)
