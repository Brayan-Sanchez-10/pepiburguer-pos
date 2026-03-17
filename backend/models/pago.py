from sqlalchemy import Integer, Column, ForeignKey, Numeric, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Pago(Base):
    __tablename__ = "Pago"

    id_pago = Column(Integer, primary_key=True, autoincrement=True)
    id_pedido = Column(Integer, ForeignKey("Pedido.id_pedido"), unique=True)
    tipo_pago = Column(SAEnum('efectivo','transferencia', name='tipos_pago'), nullable=False)
    monto_recibido = Column(Numeric(10,2), nullable=False)
    cambio = Column(Numeric(10,2), default=0)
    fecha_pago = Column(DateTime, default=datetime.now)

    pedido = relationship("Pedido", back_populates="pago")