from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Producto(Base):
    __tablename__ = "Producto"

    id_producto = Column(Integer, primary_key=True, autoincrement=True)
    nombre_producto = Column(String(100), nullable=False, index=True)
    valor_producto = Column(Numeric(10,2), nullable=False)
    id_categoria = Column(Integer, ForeignKey("Categoria.id_categoria"))
    disponible = Column(Boolean, default=True, nullable=False)

    categoria = relationship("Categoria", back_populates="producto")
    venta_productos = relationship("Pedido_producto", back_populates="producto")