from sqlalchemy import Integer, String, Enum, Column
from sqlalchemy.orm import relationship
from database import Base

class Categoria(Base):
    __tablename__ = "Categoria"

    id_categoria = Column(Integer, primary_key=True, autoincrement=True)
    nombre_categoria = Column(String(30), index=True)

    producto = relationship("Producto", back_populates="categoria")