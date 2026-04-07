from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.usuario import Usuario
from schemas.usuario import Usuario_create, Usuario_response, Usuario_update
from passlib.context import CryptContext
from middleware.auth import verificar_token, verificar_admin

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
    dependencies=[Depends(verificar_admin)]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/", response_model=list[Usuario_response], status_code=status.HTTP_200_OK)
def obtener_usuarios(db: Session = Depends(get_db)):
    
    usuarios = db.query(Usuario).all()

    if not usuarios:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay usuarios registrados"
        )
    
    return usuarios

@router.get("/{id}", response_model=Usuario_response, status_code=status.HTTP_200_OK)
def obtener_usuario(id: str, db: Session = Depends(get_db)):
    
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe usuario con ese id: {id}"
        )
    
    return usuario

@router.post("/", response_model=Usuario_response, status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: Usuario_create, db: Session = Depends(get_db)):
    
    existe = db.query(Usuario).filter(
        Usuario.id_usuario == usuario.id_usuario
    ).first()

    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario con la cedula: {usuario.id_usuario} ya existe"
        )
    
    contrasena_hasheada = pwd_context.hash(usuario.contrasena_usuario)

    nuevo_usuario = Usuario(
        id_usuario=usuario.id_usuario,
        nombre_usuario=usuario.nombre_usuario,
        celular_usuario=usuario.celular_usuario,
        contrasena_usuario=contrasena_hasheada,
        rol_usuario=usuario.rol_usuario
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario

@router.put("/{id}", response_model=Usuario_response, status_code=status.HTTP_200_OK)
def editar_usuario(id: str, usuario: Usuario_update, db: Session = Depends(get_db)):
    
    existe = db.query(Usuario).filter(
        Usuario.id_usuario == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El usuario con la cedula: {id} no existe"
        )
    
    if usuario.nombre_usuario:
        existe.nombre_usuario = usuario.nombre_usuario
    if usuario.celular_usuario:
        existe.celular_usuario = usuario.celular_usuario
    if usuario.rol_usuario:
        existe.rol_usuario = usuario.rol_usuario

    db.commit()
    db.refresh(existe)

    return existe

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def eliminar_usuario(id: str, db: Session = Depends(get_db)):
    
    existe = db.query(Usuario).filter(
        Usuario.id_usuario == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El usuario con cedula: {id} no existe"
        )
    
    db.delete(existe)
    db.commit()

    return {"mensaje": f"Usuario con cedula {id} eliminado correctamente"}