import sys
from datetime import datetime, timezone
from sqlmodel import Session, select, text
from app.core.database import create_all_tables, engine
from app.core.security import hash_password

# Importar todas las entidades para registrar los mappers
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import DetallePedido, Pedido

CATEGORIAS_INICIALES = [
    {"nombre": "Burritos", "descripcion": "Burritos tradicionales"},
    {"nombre": "Chilaquiles", "descripcion": "Chilaquiles Sinaloenses"},
    {"nombre": "Gorditas", "descripcion": "Gorditas estilo CDMX"},
    {"nombre": "Tacos", "descripcion": "Tacos tradicionales vegetarianos"},
    {"nombre": "Tamales", "descripcion": "Tamales dulces y salados"},
    {"nombre": "Quesadillas", "descripcion": "Quesadillas tradicionales Mexicanas"},
]

PRODUCTOS_INICIALES = [
    {
        "nombre": "Burrito Tex",
        "categoria_nombre": "Burritos",
        "precio_base": 6000.0,
        "descripcion": "Burrito estilo TexMex de maíz, arroz, frijoles y cilantro",
        "imagen_url": "/assets/img/burrito1.jpg",
        "stock": 20,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Raw Burrito",
        "categoria_nombre": "Burritos",
        "precio_base": 6000.0,
        "descripcion": "Burrito de vegetales frescos con aguacate, tomate, lechuga, cebolla morada y cilantro",
        "imagen_url": "/assets/img/burrito2.jpg",
        "stock": 15,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Not Chicken Burrito",
        "categoria_nombre": "Burritos",
        "precio_base": 6800.0,
        "descripcion": "Burrito de not pollo, vegetales, arroz, frijoles y queso",
        "imagen_url": "/assets/img/burrito3.jpg",
        "stock": 25,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Chilaquiles Verdes",
        "categoria_nombre": "Chilaquiles",
        "precio_base": 15000.0,
        "descripcion": "Totopos de maíz con salsa verde, cebolla, crema, quesillo y cilantro",
        "imagen_url": "/assets/img/chilaquiles1.jpg",
        "stock": 18,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Chilaquiles Rojos",
        "categoria_nombre": "Chilaquiles",
        "precio_base": 15000.0,
        "descripcion": "Totopos de maíz con salsa roja, cebolla, crema, quesillo y cilantro",
        "imagen_url": "/assets/img/chilaquiles2.jpg",
        "stock": 20,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Gorditas Puebla",
        "categoria_nombre": "Gorditas",
        "precio_base": 10000.0,
        "descripcion": "Masa de maíz rellena con frijoles, lechuga, queso Oaxaca y pico de gallo",
        "imagen_url": "/assets/img/gorditas1.jpg",
        "stock": 12,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Gorditas Guanajuato",
        "categoria_nombre": "Gorditas",
        "precio_base": 10000.0,
        "descripcion": "Masa de maíz rellena con frijoles, queso panela, queso manchego y chile habanero",
        "imagen_url": "/assets/img/gorditas2.jpg",
        "stock": 15,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Gorditas Tepoztlán",
        "categoria_nombre": "Gorditas",
        "precio_base": 12000.0,
        "descripcion": "Masa de maíz rellena con tomate, not carne, aguacate y cebolla morada",
        "imagen_url": "/assets/img/gorditas3.jpg",
        "stock": 10,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Tacos Yucatan",
        "categoria_nombre": "Tacos",
        "precio_base": 12000.0,
        "descripcion": "Tortilla de maíz relleno de coliflor asado, rabanitos, pepinillos, pico de gallo, salsa verde y cilantro",
        "imagen_url": "/assets/img/tacos1.jpg",
        "stock": 22,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Tacos Regionales",
        "categoria_nombre": "Tacos",
        "precio_base": 12000.0,
        "descripcion": "Tortilla de maíz relleno de frijoles refritos, choclo, lechuga, tomate y chile serrano",
        "imagen_url": "/assets/img/tacos2.jpg",
        "stock": 20,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Tacos Veracruz",
        "categoria_nombre": "Tacos",
        "precio_base": 12000.0,
        "descripcion": "Tortilla de maíz relleno de queso panela asado, piña, mango y cilantro",
        "imagen_url": "/assets/img/tacos3.jpg",
        "stock": 16,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Tamales Vallarta",
        "categoria_nombre": "Tamales",
        "precio_base": 8000.0,
        "descripcion": "Masa de maíz suave endulzada con piloncillo, rellenos de fruta y nueces",
        "imagen_url": "/assets/img/tamales1.jpg",
        "stock": 14,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Tamales Akumal",
        "categoria_nombre": "Tamales",
        "precio_base": 8000.0,
        "descripcion": "Masa de maíz suave saborizada con arándanos, endulzada con piloncillo, rellenos de pasas",
        "imagen_url": "/assets/img/tamales2.jpg",
        "stock": 18,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Tamales Potosí",
        "categoria_nombre": "Tamales",
        "precio_base": 8000.0,
        "descripcion": "Masa de maíz suave rellena de setas y tofu asado",
        "imagen_url": "/assets/img/tamales3.jpg",
        "stock": 15,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Quesadillas Norteñas",
        "categoria_nombre": "Quesadillas",
        "precio_base": 7000.0,
        "descripcion": "Tortilla de trigo rellena de frijoles, tomate, queso cheddar, queso manchego y cilantro",
        "imagen_url": "/assets/img/quesadillas1.jpg",
        "stock": 24,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Quesadillas Chiapanecas",
        "categoria_nombre": "Quesadillas",
        "precio_base": 7000.0,
        "descripcion": "Tortilla de maíz rellena de choclo, tomate, zucchini, queso Oaxaca y cilantro",
        "imagen_url": "/assets/img/quesadillas2.jpg",
        "stock": 20,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Quesadillas sincronizadas",
        "categoria_nombre": "Quesadillas",
        "precio_base": 7000.0,
        "descripcion": "Tortilla de maíz rellena de queso y jamón de seitán",
        "imagen_url": "/assets/img/quesadillas3.jpg",
        "stock": 22,
        "disponible": True,
        "activo": True,
    },
    {
        "nombre": "Quesadillas costeñas",
        "categoria_nombre": "Quesadillas",
        "precio_base": 7500.0,
        "descripcion": "Tortilla de maíz azul rellena de queso Oaxaca, cebolla, tomate y queso azul",
        "imagen_url": "/assets/img/quesadillas4.jpg",
        "stock": 18,
        "disponible": True,
        "activo": True,
    },
]

USUARIOS_INICIALES = [
    {
        "username": "admin",
        "full_name": "Administrador VeggieFood",
        "email": "admin@veggiefood.com",
        "password": "Admin1234!",
        "role": "admin",
        "disabled": False,
    },
    {
        "username": "user",
        "full_name": "Cliente Demo",
        "email": "user@veggiefood.com",
        "password": "User1234!",
        "role": "user",
        "disabled": False,
    },
    {
        "username": "cliente",
        "full_name": "Cliente Demo Alternativo",
        "email": "cliente@veggiefood.com",
        "password": "User1234!",
        "role": "user",
        "disabled": False,
    },
]


def seed():
    print("1. Creando tablas si no existen...")
    create_all_tables()

    with Session(engine) as session:
        now = datetime.now(timezone.utc)

        print("2. Cargando / actualizando usuarios iniciales...")
        for u_data in USUARIOS_INICIALES:
            usuario = session.exec(
                select(Usuario).where(
                    (Usuario.username == u_data["username"])
                    | (Usuario.email == u_data["email"])
                )
            ).first()

            if usuario:
                usuario.username = u_data["username"]
                usuario.full_name = u_data["full_name"]
                usuario.email = u_data["email"]
                usuario.hashed_password = hash_password(u_data["password"])
                usuario.role = u_data["role"]
                usuario.disabled = u_data["disabled"]
                session.add(usuario)
                print(f" -> Usuario actualizado: {usuario.username} ({usuario.role})")
            else:
                usuario = Usuario(
                    username=u_data["username"],
                    full_name=u_data["full_name"],
                    email=u_data["email"],
                    hashed_password=hash_password(u_data["password"]),
                    role=u_data["role"],
                    disabled=u_data["disabled"],
                    created_at=now,
                )
                session.add(usuario)
                print(f" -> Usuario creado: {usuario.username} ({usuario.role})")
        session.commit()

        print("3. Cargando / actualizando categorías...")
        cat_map: dict[str, Categoria] = {}
        for c_data in CATEGORIAS_INICIALES:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == c_data["nombre"])
            ).first()
            if cat:
                cat.descripcion = c_data["descripcion"]
                cat.activo = True
                session.add(cat)
                print(f" -> Categoría actualizada: {cat.nombre}")
            else:
                cat = Categoria(
                    nombre=c_data["nombre"],
                    descripcion=c_data["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
                print(f" -> Categoría creada: {cat.nombre}")
            cat_map[cat.nombre] = cat
        session.commit()

        print("4. Cargando / actualizando productos...")
        for p_data in PRODUCTOS_INICIALES:
            categoria = cat_map[p_data["categoria_nombre"]]
            prod = session.exec(
                select(Producto).where(Producto.nombre == p_data["nombre"])
            ).first()
            if prod:
                prod.categoria_id = categoria.id
                prod.descripcion = p_data["descripcion"]
                prod.precio_base = p_data["precio_base"]
                prod.stock = p_data["stock"]
                prod.disponible = p_data["disponible"]
                prod.imagen_url = p_data["imagen_url"]
                prod.activo = True
                session.add(prod)
                print(f" -> Producto actualizado: {prod.nombre}")
            else:
                prod = Producto(
                    categoria_id=categoria.id,
                    nombre=p_data["nombre"],
                    descripcion=p_data["descripcion"],
                    precio_base=p_data["precio_base"],
                    stock=p_data["stock"],
                    disponible=p_data["disponible"],
                    imagen_url=p_data["imagen_url"],
                    activo=True,
                )
                session.add(prod)
                print(f" -> Producto creado: {prod.nombre}")
        session.commit()

        # Ajuste de secuencias para PostgreSQL si existen
        for table, seq in [
            ("usuario", "usuario_id_seq"),
            ("categoria", "categoria_id_seq"),
            ("producto", "producto_id_seq"),
            ("pedido", "pedido_id_seq"),
            ("detalle_pedido", "detalle_pedido_id_seq"),
        ]:
            try:
                session.exec(
                    text(
                        f"SELECT setval('{seq}', COALESCE((SELECT MAX(id) FROM {table}), 1));"
                    )
                )
                session.commit()
            except Exception:
                session.rollback()

    print("¡Seed ejecutado exitosamente de manera idempotente con el catálogo original!")


if __name__ == "__main__":
    seed()
