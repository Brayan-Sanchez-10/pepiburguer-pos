from sqlalchemy import String, Column, Enum
from sqlalchemy.orm import relationship
from database import Base

class Usuario(Base):
    __tablename__ = "Usuario"

    id_usuario = Column(String(20), primary_key= True, index=True)
    nombre_usuario= Column(String(30), index=True )
    rol_usuario = Column(Enum('administrador','mesero',name='roles de usuario'), nullable= False )
    celular_usuario= Column(String(30), index=True)
    contrasena_usuario = Column(String(255), nullable=False)

    turno = relationship("Turno", back_populates="usuario") 