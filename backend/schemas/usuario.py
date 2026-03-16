from pydantic import BaseModel
from typing import Optional
from enum import Enum

class Rol_usuario(str, Enum):
    administrador = "administrador"
    mesero = "mesero"

class Usuario_create(BaseModel):
    id_usuario: str
    nombre_usuario: str
    celular_usuario: str
    contrasena_usuario: str
    rol_usuario: Rol_usuario

class Usuario_update(BaseModel):
    nombre_usuario: Optional[str] = None
    celular_usuario: Optional[str] = None
    rol_usuario: Optional[Rol_usuario] = None

class Usuario_response(BaseModel):
    id_usuario: str
    nombre_usuario: str
    celular_usuario: str
    rol_usuario: str

    class Config:
        from_attributes = True