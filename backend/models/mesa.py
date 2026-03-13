from sqlalchemy import Integer, ForeignKey, Enum, Column
from sqlalchemy.orm import relationship
from database import Base

class Mesa(Base):
    __tablename__ = "Mesa"

    id_mesa = Column(Integer, primary_key=True, autoincrement=True)
    numero_mesa = Column(Integer, nullable=False)
    estado = Column(Enum('ocupada','vacia', name='estados_mesa'), nullable=False)

    pedido = relationship("Pedido", back_populates="mesa")