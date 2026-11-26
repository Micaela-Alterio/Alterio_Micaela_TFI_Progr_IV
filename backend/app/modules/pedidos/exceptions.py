class PedidoNoEncontrado(Exception):
    def __init__(self, message: str = "Pedido no encontrado"):
        super().__init__(message)
        self.message = message


class PedidoAjeno(Exception):
    def __init__(self, message: str = "No tiene permisos para acceder a este pedido"):
        super().__init__(message)
        self.message = message


class StockInsuficiente(Exception):
    def __init__(self, message: str = "Stock insuficiente"):
        super().__init__(message)
        self.message = message


class ProductoNoDisponible(Exception):
    def __init__(self, message: str = "Producto no disponible"):
        super().__init__(message)
        self.message = message


class ProductoRepetido(Exception):
    def __init__(self, message: str = "Producto repetido en el pedido"):
        super().__init__(message)
        self.message = message


class TransicionInvalida(Exception):
    def __init__(self, message: str = "Transición de estado inválida"):
        super().__init__(message)
        self.message = message
