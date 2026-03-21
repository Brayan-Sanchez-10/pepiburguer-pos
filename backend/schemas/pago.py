from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class Pago_tipo(str, Enum):
    efectivo = "efectivo"
    transferencia = "transferencia"

class Pago_create(BaseModel):
    id_pedido: int
    tipo_pago: Pago_tipo
    monto_recibido: float
    fecha_pago: datetime = datetime.now()

class Pago_update(BaseModel):
    tipo_pago: Optional[Pago_tipo] = None
    monto_recibido: Optional[float] = None

class Pago_response(Pago_create):
    id_pago: int
    cambio: float

    class Config:
        from_attributes = True
