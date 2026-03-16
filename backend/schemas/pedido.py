from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class Pedido_tipo(str, Enum):
    mesa = "mesa"
    para_llevar = "para_llevar"
    domicilio = "domicilio"

class Pedido_estado(str, Enum):
    no_cancelado = "no_cancelado"
    cancelado = "cancelado"

class Pedido_create(BaseModel):
    valor_total: float = 0
    fecha_pedido: datetime = datetime.now()
    id_turno: int
    id_mesa: Optional[int] = None
    tipo_pedido: Pedido_tipo
    estado_pedido: Pedido_estado = Pedido_estado.no_cancelado

class Pedido_update(BaseModel):
    valor_total: Optional[float] = None
    tipo_pedido: Optional[Pedido_tipo] = None
    estado_pedido: Optional[Pedido_estado] = None
    id_mesa: Optional[int] = None

class Pedido_response(Pedido_create):
    id_pedido: int

    class Config:
        from_attributes = True
