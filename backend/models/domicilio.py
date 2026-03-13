from sqlalchemy import String, Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Domicilio(Base):
    __tablename__ = "Domicilio"

    id_domicilio = Column(Integer, primary_key=True, autoincrement=True)
    nombre_cliente = Column(String(100), nullable=False)
    direccion_cliente = Column(String(200), nullable=False)
    barrio_cliente = Column(String(100), nullable=False)
    celular_cliente = Column(String(20), nullable=False)
    id_pedido = Column(Integer, ForeignKey("Pedido.id_pedido"), unique=True)

    pedido = relationship("Pedido", back_populates="domicilio")