from sqlalchemy import Integer, Text, Column, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Pedido_producto(Base):
    __tablename__ = "Pedido_producto"

    id_pe_pro = Column(Integer, primary_key=True, autoincrement=True)
    id_pedido = Column(Integer, ForeignKey("Pedido.id_pedido"))
    id_producto = Column(Integer, ForeignKey("Producto.id_producto"))
    cantidad = Column(Integer, nullable=False, default=1)
    nota_especial = Column(Text, nullable=True)

    pedido = relationship("Pedido", back_populates="pedido_productos")
    producto = relationship("Producto", back_populates="venta_productos")