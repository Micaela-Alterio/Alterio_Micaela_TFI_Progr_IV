from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables

# Import all models so SQLModel registers tables in metadata
from app.modules.usuarios.models import Usuario  # noqa: F401
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401

# Import routers
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categoria_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as producto_router
from app.modules.usuarios.router import router as admin_usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST completa para el Trabajo Práctico Integrador Veggie Food Store",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS habilitado para FRONTEND_ORIGIN con credenciales
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers montados bajo /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_usuarios_router, prefix="/api/v1")
app.include_router(categoria_router, prefix="/api/v1")
app.include_router(producto_router, prefix="/api/v1")
app.include_router(pedidos_router, prefix="/api/v1")


@app.get("/", tags=["root"])
def root():
    return {
        "message": "Bienvenido a la API REST de Veggie Food Store",
        "docs": "/docs",
    }
