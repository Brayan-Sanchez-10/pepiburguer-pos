from pydantic import BaseModel
from typing import Optional



class Domicilio_create(BaseModel):
    nombre_cliente : str
    direccion_cliente : str
    barrio_cliente : str
    celular_cliente : str
    id_pedido : int

class Domicilio_update(BaseModel):
    nombre_cliente : Optional[str] = None
    direccion_cliente : Optional[str] = None
    barrio_cliente : Optional[str] = None
    celular_cliente : Optional[str] = None

class Domicilio_response(Domicilio_create):
    id_domicilio : int
    class Config:
        from_attributes = True