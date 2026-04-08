from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from models.pago import Pago
from models.pedido import Pedido
from schemas.pago import Pago_create, Pago_response, Pago_update
from database import get_db
from middleware.auth import verificar_token

router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"],
    dependencies= [Depends(verificar_token)]
)

@router.get("/", response_model=list[Pago_response], status_code=status.HTTP_200_OK)
def obtener_pagos(db: Session = Depends(get_db)):
    pagos = db.query(Pago).all()

    if not pagos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay pagos registrados"
        )
    
    return pagos

@router.get("/{id}", response_model=Pago_response, status_code=status.HTTP_200_OK)
def obtener_pago(id: int, db: Session = Depends(get_db)):
    existe = db.query(Pago).filter(
        Pago.id_pago == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe pago con id: {id}"
        )
    
    return existe

@router.post("/", response_model=Pago_response, status_code=status.HTTP_201_CREATED)
def crear_pago(pago: Pago_create, db: Session = Depends(get_db)):

    pedido = db.query(Pedido).filter(
        Pedido.id_pedido == pago.id_pedido
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe pedido con id: {pago.id_pedido}"
        )

    if pago.tipo_pago == "efectivo":
        cambio = pago.monto_recibido - float(pedido.valor_total)
    else:
        cambio = 0

    nuevo_pago = Pago(
        id_pedido=pago.id_pedido,
        tipo_pago=pago.tipo_pago,
        monto_recibido=pago.monto_recibido,
        cambio=cambio,
        fecha_pago=pago.fecha_pago
    )

    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)

    db.add(nuevo_pago)

# Actualizar estado del pedido
    pedido.estado_pedido = "cancelado"
    db.commit()


    return nuevo_pago

@router.put("/{id}", response_model=Pago_response, status_code=status.HTTP_200_OK)
def editar_pago(id: int, pago: Pago_update, db: Session = Depends(get_db)):
    existe = db.query(Pago).filter(
        Pago.id_pago == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe pago con id: {id}"
        )
    
    if pago.tipo_pago:
        existe.tipo_pago = pago.tipo_pago
    if pago.monto_recibido:
        existe.monto_recibido = pago.monto_recibido

    db.commit()
    db.refresh(existe)
    
    return existe

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def eliminar_pago(id: int, db: Session = Depends(get_db)):
    existe = db.query(Pago).filter(
        Pago.id_pago == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontro pago con id: {id}"
        )
    
    db.delete(existe)
    db.commit()

    return {"mensaje": f"El pago con id: {id} fue eliminado correctamente"}