from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models.turno import Turno
from schemas.turno import Turno_create, Turno_update, Turno_response, Turno_close
from middleware.auth import verificar_token, verificar_admin

router = APIRouter(
    prefix="/turnos",
    tags=["Turnos"],
    dependencies=[Depends(verificar_admin)]
)

@router.get("/", response_model=list[Turno_response], status_code=status.HTTP_200_OK)
def obtener_turnos(db: Session = Depends(get_db)):
    turnos = db.query(Turno).all()

    if not turnos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay turnos registrados"
        )
    
    return turnos

@router.get("/{id}", response_model=Turno_response, status_code=status.HTTP_200_OK)
def obtener_turno(id: int, db: Session = Depends(get_db)):
    existe = db.query(Turno).filter(
        Turno.id_turno == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe turno con el id: {id}"
        )
    
    return existe

@router.post("/", response_model=Turno_response, status_code=status.HTTP_201_CREATED)
def crear_turno(turno: Turno_create, db: Session = Depends(get_db)):
    
    nuevo_turno = Turno(
        id_usuario=turno.id_usuario,
        base_turno=turno.base_turno,
        estado_turno=turno.estado_turno
    )

    db.add(nuevo_turno)
    db.commit()
    db.refresh(nuevo_turno)

    return nuevo_turno

@router.put("/{id}", response_model=Turno_response, status_code=status.HTTP_200_OK)
def editar_turno(id: int, turno: Turno_update, db: Session = Depends(get_db)):
    existe = db.query(Turno).filter(
        Turno.id_turno == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El turno con el id: {id} no existe"
        )
    
    if turno.base_turno:
        existe.base_turno = turno.base_turno
    if turno.egresos_turno:
        existe.egresos_turno = turno.egresos_turno
    if turno.ingresos_turno:
        existe.ingresos_turno = turno.ingresos_turno
    
    db.commit()
    db.refresh(existe)

    return existe

@router.patch("/{id}/cerrar", response_model=Turno_response, status_code=status.HTTP_200_OK)
def cerrar_turno(id: int, turno: Turno_close, db: Session = Depends(get_db)):
    existe = db.query(Turno).filter(
        Turno.id_turno == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El turno con el id: {id} no existe"
        )

    existe.fecha_turno_fin = datetime.now()
    existe.estado_turno = turno.estado_turno

    db.commit()
    db.refresh(existe)

    return existe

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def eliminar_turno(id: int, db: Session = Depends(get_db)):
    existe = db.query(Turno).filter(
        Turno.id_turno == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El turno con el id: {id} no existe"
        )
    
    db.delete(existe)
    db.commit()

    return {"mensaje": f"Turno con id {id} eliminado correctamente"}