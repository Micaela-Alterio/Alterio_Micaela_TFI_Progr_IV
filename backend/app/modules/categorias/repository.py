from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def __init__(self, session: Session):
        super().__init__(model_or_session=Categoria, session=session)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_all_activas(self) -> list[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo == True)
            .order_by(Categoria.id)
        )
        return list(self.session.exec(statement).all())
