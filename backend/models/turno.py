from sqlalchemy import Integer, String, Column, Enum, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class Turno(Base):
    __tablename__ = "Turno"

    id_turno = Column(Integer, primary_key=True, autoincrement=True, index=True)
    id_usuario = Column(String(20), ForeignKey("Usuario.id_usuario"))
    fecha_turno_inicio = Column(DateTime, default=datetime.now)
    fecha_turno_fin = Column(DateTime, nullable=True)
    egresos_turno = Column(Numeric(10,2), default=0)
    ingresos_turno = Column(Numeric(10,2), default=0)
    base_turno = Column(Numeric(10,2), nullable=False)
    estado_turno = Column(Enum('iniciado','terminado', name='estados_turno'), nullable=False)

    usuario = relationship("Usuario", back_populates="turno")
    pedido = relationship("Pedido", back_populates="turno")