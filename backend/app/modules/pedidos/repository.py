from datetime import datetime, timezone
from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def __init__(self, session: Session):
        super().__init__(model_or_session=Pedido, session=session)

    def get_by_id(self, id: int) -> Pedido | None:
        statement = (
            select(Pedido)
            .where(Pedido.id == id)
            .options(selectinload(Pedido.items))
        )
        return self.session.exec(statement).first()

    def filtrar_paginado(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Pedido]]:
        count_query = select(func.count(Pedido.id))
        data_query = (
            select(Pedido)
            .options(selectinload(Pedido.items))
        )

        if usuario_id is not None:
            count_query = count_query.where(Pedido.usuario_id == usuario_id)
            data_query = data_query.where(Pedido.usuario_id == usuario_id)

        if estado is not None:
            estado_clean = estado.strip().upper()
            count_query = count_query.where(Pedido.estado == estado_clean)
            data_query = data_query.where(Pedido.estado == estado_clean)

        total = self.session.exec(count_query).one()
        data_query = data_query.order_by(Pedido.id.desc()).offset(skip).limit(limit)
        items = list(self.session.exec(data_query).all())

        return total, items

    def get_resumen(self) -> dict:
        now_date = datetime.now(timezone.utc).date()

        pendientes = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "PENDIENTE")
        ).one()
        en_preparacion = self.session.exec(
            select(func.count(Pedido.id)).where(
                Pedido.estado == "EN_PREPARACION"
            )
        ).one()
        entregados = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "ENTREGADO")
        ).one()
        cancelados = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "CANCELADO")
        ).one()

        pedidos_hoy = self.session.exec(
            select(func.count(Pedido.id)).where(
                func.date(Pedido.created_at) == now_date
            )
        ).one()

        suma_entregados = self.session.exec(
            select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
        ).one()
        ingresos_entregados = float(suma_entregados or 0.0)

        return {
            "pendientes": pendientes,
            "en_preparacion": en_preparacion,
            "entregados": entregados,
            "cancelados": cancelados,
            "pedidos_hoy": pedidos_hoy,
            "ingresos_entregados": ingresos_entregados,
        }
