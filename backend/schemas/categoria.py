from pydantic import BaseModel
from typing import Optional


class Categoria_create(BaseModel):
    nombre_categoria: str
class Categoria_update (BaseModel):
    nombre_categoria: Optional[str] = None

class Categoria_response(BaseModel):
    id_categoria : int
    nombre_categoria : str

    class Config:
        from_attributes = True