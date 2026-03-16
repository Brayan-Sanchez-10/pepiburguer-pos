from pydantic import BaseModel
from typing import Optional
from enum import Enum

class Mesa_estado(str, Enum):
    vacia = "vacia"
    ocupada = "ocupada"

class Mesa_create(BaseModel):
    numero_mesa : int
    estado : Mesa_estado = Mesa_estado.vacia

class Mesa_update(BaseModel):
    numero_mesa : Optional[int] = None

class Mesa_ocupada(BaseModel):
    estado : Mesa_estado = Mesa_estado.ocupada

class Mesa_response(BaseModel):
    id_mesa : int
    numero_mesa : int
    estado : Mesa_estado

    class Config:
        from_attributes = True