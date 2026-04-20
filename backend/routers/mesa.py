from fastapi import Depends, APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from models.mesa import Mesa
from schemas.mesa import Mesa_create, Mesa_ocupada, Mesa_response, Mesa_update
from database import get_db
from middleware.auth import verificar_token, verificar_admin

router = APIRouter(
    prefix="/mesas",
    tags=["Mesas"],
    dependencies = [Depends(verificar_admin)]
)

@router.get("/", response_model = list[Mesa_response], status_code=status.HTTP_200_OK)
def obtener_mesas(db: Session= Depends(get_db)):
    mesas = db.query(Mesa).all()

    if not mesas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "No hay mesas registradas"
        )
    
    return mesas

@router.get("/{id}", response_model= Mesa_response, status_code=status.HTTP_200_OK)
def obtener_mesa(id: int, db: Session = Depends(get_db)):
    existe = db.query(Mesa).filter(
        Mesa.id_mesa == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe mesa con el id: {id}"
        )
    
    return existe

@router.post("/", response_model=Mesa_response, status_code=status.HTTP_201_CREATED)
def crear_mesa(mesa : Mesa_create, db: Session=Depends(get_db)):
    nueva_mesa = Mesa(
        numero_mesa = mesa.numero_mesa,
        estado = mesa.estado
    )

    db.add(nueva_mesa)
    db.commit()
    db.refresh(nueva_mesa)

    return nueva_mesa

@router.put("/{id}", response_model=Mesa_response, status_code=status.HTTP_200_OK)
def editar_mesa(id: int, mesa: Mesa_update, db: Session = Depends(get_db)):
    existe = db.query(Mesa).filter(
        Mesa.id_mesa == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe mesa con el id: {id}"
        )
    
    if mesa.numero_mesa:
        existe.numero_mesa = mesa.numero_mesa
    
    db.commit()
    db.refresh(existe)

    return existe

@router.patch("/{id}/ocupar", response_model= Mesa_response, status_code=status.HTTP_200_OK)
def ocupar_mesa(id: int, estado : Mesa_ocupada, db : Session = Depends(get_db)):
    existe = db.query(Mesa).filter(
        Mesa.id_mesa == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe mesa con el id: {id}"
        )
    
    if estado.estado:
        existe.estado = estado.estado
    
    db.commit()
    db.refresh(existe)

    return existe

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def eliminar_mesa(id: int, db: Session = Depends(get_db)):
    existe = db.query(Mesa).filter(
        Mesa.id_mesa == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe mesa con el id: {id}"
        )
    
    db.delete(existe)
    db.commit()
    return {"mensaje": f"Mesa con id {id} eliminada correctamente"}