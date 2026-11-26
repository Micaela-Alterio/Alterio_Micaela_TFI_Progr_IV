from collections.abc import Callable
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    """
    Clase base UnitOfWork que abre la sesión en __enter__ y ejecuta commit
    (si no hubo excepción), rollback (si hubo excepción) y close en __exit__.
    """

    def __init__(
        self,
        session_factory_func: Callable[[], Session] | None = None,
        session: Session | None = None,
    ):
        self._custom_session = session
        self._session_factory = session_factory_func or session_factory
        self.session: Session | None = session

    def __enter__(self):
        if self._custom_session is not None:
            self.session = self._custom_session
        else:
            self.session = self._session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session is not None:
            try:
                if exc_type is not None:
                    self.session.rollback()
                else:
                    self.session.commit()
            finally:
                self.session.close()
                if self._custom_session is None:
                    self.session = None


BaseUnitOfWork = UnitOfWork
