from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def __init__(self, session: Session):
        super().__init__(model_or_session=Producto, session=session)

    def get_by_id_activo(self, id: int) -> Producto | None:
        statement = (
            select(Producto)
            .where(Producto.id == id, Producto.activo == True)
            .options(selectinload(Producto.categoria))
        )
        return self.session.exec(statement).first()

    def get_by_id(self, id: int) -> Producto | None:
        statement = (
            select(Producto)
            .where(Producto.id == id)
            .options(selectinload(Producto.categoria))
        )
        return self.session.exec(statement).first()

    def filtrar_paginado(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        # Consulta base filtrando siempre activo == True
        count_query = select(func.count(Producto.id)).where(
            Producto.activo == True
        )
        data_query = (
            select(Producto)
            .where(Producto.activo == True)
            .options(selectinload(Producto.categoria))
        )

        if search:
            search_filter = Producto.nombre.ilike(f"%{search.strip()}%")
            count_query = count_query.where(search_filter)
            data_query = data_query.where(search_filter)

        if categoria_id is not None:
            count_query = count_query.where(
                Producto.categoria_id == categoria_id
            )
            data_query = data_query.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            count_query = count_query.where(Producto.disponible == disponible)
            data_query = data_query.where(Producto.disponible == disponible)

        total = self.session.exec(count_query).one()
        data_query = data_query.order_by(Producto.id).offset(skip).limit(limit)
        items = list(self.session.exec(data_query).all())

        return total, items
