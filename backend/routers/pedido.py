from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.pedido import  Pedido
from schemas.pedido import Pedido_create,  Pedido_response,  Pedido_update
from database import get_db

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.get("/", response_model= list[Pedido_response], status_code= status.HTTP_200_OK)
def obtener_pedidos(db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).all()

    if not pedidos:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail=f"No hay pedidos registrados"
        )
    
    return pedidos

@router.get("/{id}", response_model= Pedido_response, status_code= status.HTTP_200_OK)
def obtener_pedido(id: int, db: Session=Depends(get_db)):
    existe =  db.query(Pedido).filter(
        Pedido.id_pedido == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"No existe pedido con el id: {id}"
        )
    
    return existe

@router.post("/", response_model= Pedido_response, status_code= status.HTTP_201_CREATED)
def crear_pedido(pedido: Pedido_create, db: Session = Depends(get_db)):
    nuevo_pedido = Pedido(
        valor_total = pedido.valor_total,
        fecha_pedido = pedido.fecha_pedido,
        id_turno = pedido.id_turno,
        id_mesa = pedido.id_mesa,
        tipo_pedido = pedido.tipo_pedido,
        estado_pedido = pedido.estado_pedido
    )

    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)

    return nuevo_pedido

@router.put("/{id}", response_model= Pedido_response, status_code= status.HTTP_200_OK)
def editar_pedido(id: int, pedido : Pedido_update, db: Session = Depends(get_db)):
    existe = db.query(Pedido).filter(
        Pedido.id_pedido == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail=f"No existe el pedido con id: {id}"
        )
    
    if pedido.valor_total:
        existe.valor_total = pedido.valor_total
    if pedido.tipo_pedido:
        existe.tipo_pedido = pedido.tipo_pedido
    if pedido.estado_pedido:
        existe.estado_pedido = pedido.estado_pedido
    if pedido.id_mesa:
        existe.id_mesa = pedido.id_mesa
    
    db.commit()
    db.refresh(existe)

    return existe

@router.delete("/{id}", status_code= status.HTTP_200_OK)
def eliminar_pedido(id:int, db: Session = Depends(get_db)):
    existe = db.query(Pedido).filter(
        Pedido.id_pedido == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= f"No existe Pedido con id: {id}"
        )
    
    db.delete(existe)
    db.commit()

    return {"mensaje": f"El pedido con id: {id} eliminado correctamente"} 