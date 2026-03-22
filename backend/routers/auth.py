from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.usuario import Usuario
from middleware.auth import crear_token
from passlib.context import CryptContext

router = APIRouter(
    prefix="/auth",
    tags=["Autenticacion"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == form_data.username
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    if not pwd_context.verify(form_data.password, usuario.contrasena_usuario):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    token = crear_token(data={"sub": usuario.id_usuario, "rol": usuario.rol_usuario})

    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": usuario.rol_usuario,
        "nombre": usuario.nombre_usuario
    }