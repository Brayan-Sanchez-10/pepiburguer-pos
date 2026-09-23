from pydantic import BaseModel, UUID4
from typing import Optional


class Pedido_producto_create(BaseModel):
    id_pedido : int
    id_producto : int
    cantidad : int
    nota_especial : Optional[str] = None

class Pedido_producto_update(BaseModel):
    id_producto : Optional[int] = None
    cantidad : Optional[int] = None
    nota_especial : Optional[str] = None

class Pedido_producto_response(Pedido_producto_create):
    id_pe_pro : int

    class Config:
        from_attributes = True