from pydantic import BaseModel
from typing import Optional

class Producto_create(BaseModel):
    id_categoria : int
    nombre_producto : str
    valor_producto : float
    disponible : bool = True
class Producto_update(BaseModel):
    id_categoria: Optional[int] = None 
    nombre_producto: Optional[str] = None
    valor_producto: Optional[float] = None
    disponible: Optional[bool] = None
class Producto_response(Producto_create):
    id_producto : int
    class Config:
        from_attributes = True