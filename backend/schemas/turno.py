from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class Turno_estado(str, Enum):
    iniciado = "iniciado"
    terminado = "terminado"

class Turno_create(BaseModel):
    id_usuario: str
    base_turno: float
    estado_turno: Turno_estado = Turno_estado.iniciado

class Turno_update(BaseModel):
    base_turno: Optional[float] = None
    egresos_turno: Optional[float] = None
    ingresos_turno: Optional[float] = None

class Turno_close(BaseModel):
    fecha_turno_fin: Optional[datetime] = None
    estado_turno: Turno_estado = Turno_estado.terminado

class Turno_response(BaseModel):
    id_turno: int
    id_usuario: str
    base_turno: float
    egresos_turno: float
    ingresos_turno: float
    fecha_turno_inicio: datetime
    fecha_turno_fin: Optional[datetime] = None
    estado_turno: Turno_estado

    class Config:
        from_attributes = True
