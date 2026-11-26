from typing import Any, Generic, TypeVar
from sqlmodel import Session, select

T = TypeVar("T")


class BaseRepository(Generic[T]):
    model: type[T]

    def __init__(
        self,
        model_or_session: type[T] | Session | None = None,
        session: Session | None = None,
    ):
        if isinstance(model_or_session, Session):
            self.session = model_or_session
        elif model_or_session is not None:
            self.model = model_or_session
            self.session = session
        else:
            self.session = session

    def get_by_id(self, id: Any) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self) -> list[T]:
        statement = select(self.model)
        return list(self.session.exec(statement).all())

    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        return obj

    def create(self, obj: T) -> T:
        """Alias de add para compatibilidad."""
        return self.add(obj)

    def update(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        return obj

    def delete(self, obj_or_id: T | Any) -> None:
        if isinstance(obj_or_id, self.model):
            obj = obj_or_id
        else:
            obj = self.get_by_id(obj_or_id)
        if obj is not None:
            self.session.delete(obj)
            self.session.flush()
