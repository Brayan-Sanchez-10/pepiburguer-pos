from fastapi import HTTPException, APIRouter, Depends, status
from sqlalchemy.orm import Session
from models.domicilio import Domicilio
from schemas.domicilio import Domicilio_create, Domicilio_response, Domicilio_update
from database import get_db
from middleware.auth import verificar_token

router = APIRouter(
    prefix= "/domicilios",
    tags= ["Domicilios"],
    dependencies = [Depends(verificar_token)]
)

@router.get("/", response_model = list[Domicilio_response], status_code= status.HTTP_200_OK)
def obtener_domicilios(db: Session  =  Depends(get_db)):
    domicilios = db.query(Domicilio).all()

    if not domicilios:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"No hay domicilios registrados"
        )
    
    return domicilios

@router.get("/{id}", response_model= Domicilio_response, status_code= status.HTTP_200_OK)
def obtener_domcilio(id: int, db: Session= Depends(get_db)):
    existe = db.query(Domicilio).filter(
        Domicilio.id_domicilio == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"No existe domicilio con id: {id}"
        )
    
    return existe

@router.post("/", response_model= Domicilio_response, status_code= status.HTTP_201_CREATED)
def crear_domicilio(domicilio : Domicilio_create, db: Session= Depends(get_db)):
    nuevo_domicilio = Domicilio(
        nombre_cliente = domicilio.nombre_cliente,
        direccion_cliente = domicilio.direccion_cliente,
        barrio_cliente = domicilio.barrio_cliente,
        celular_cliente = domicilio.celular_cliente,
        id_pedido = domicilio.id_pedido
    )

    db.add(nuevo_domicilio)
    db.commit()
    db.refresh(nuevo_domicilio)

    return nuevo_domicilio

@router.put("/{id}", response_model= Domicilio_response, status_code=status.HTTP_200_OK)
def editar_domicilio(id: int, domicilio : Domicilio_update, db: Session = Depends(get_db)):
    existe =  db.query(Domicilio).filter(
        Domicilio.id_domicilio == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail=f"No existe domicilio con id: {id}"
        )
    
    if domicilio.nombre_cliente: 
        existe.nombre_cliente = domicilio.nombre_cliente
    if domicilio.direccion_cliente:
        existe.direccion_cliente = domicilio.direccion_cliente
    if domicilio.barrio_cliente:
        existe.barrio_cliente = domicilio.barrio_cliente
    if domicilio.celular_cliente:
        existe.celular_cliente = domicilio.celular_cliente

    db.commit()
    db.refresh(existe)
    
    return existe

@router.delete("/{id}", status_code= status.HTTP_200_OK)
def eliminar_domicilio(id: int, db: Session= Depends(get_db)):
    existe = db.query(Domicilio).filter(
        Domicilio.id_domicilio==id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail=f"No existe domicilio con el id: {id}"
        )
    
    db.delete(existe)
    db.commit()

    return {"mensaje": f"El domicilio con id: {id} se elimino correctamente"}