from sqlalchemy import Integer, DateTime, Column, Enum, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Pedido(Base):
    __tablename__ = "Pedido"

    id_pedido = Column(Integer, primary_key=True, autoincrement=True)
    fecha_pedido = Column(DateTime, default=datetime.now)
    valor_total = Column(Numeric(10,2), default=0)
    tipo_pedido = Column(Enum('mesa','para_llevar','domicilio', name='tipos_pedido'), nullable=False)
    estado_pedido = Column(Enum('no_cancelado','cancelado', name='estados_pedido'), nullable=False)
    id_turno = Column(Integer, ForeignKey("Turno.id_turno"))
    id_mesa = Column(Integer, ForeignKey("Mesa.id_mesa"), nullable=True)

    turno = relationship("Turno", back_populates="pedido")
    mesa = relationship("Mesa", back_populates="pedido")
    pedido_productos = relationship("Pedido_producto", back_populates="pedido")
    domicilio = relationship("Domicilio", back_populates="pedido")
    pago = relationship("Pago", back_populates="pedido")