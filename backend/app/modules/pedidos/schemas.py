from datetime import datetime
from typing import Literal
from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class DetallePedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    forma_pago: Literal["EFECTIVO", "TRANSFERENCIA"]
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None
    items: list[DetallePedidoCreate] = Field(min_length=1)


class DetallePedidoRead(SQLModel):
    id: int
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []

    model_config = ConfigDict(from_attributes=True)


class PedidoEstadoUpdate(SQLModel):
    estado: str


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
