from fastapi import HTTPException, APIRouter, status, Depends
from sqlalchemy.orm import Session
from models.pedido_producto import Pedido_producto
from models.pedido import Pedido
from models.producto import Producto
from schemas.pedido_producto import Pedido_producto_create, Pedido_producto_response, Pedido_producto_update
from database import get_db
from middleware.auth import verificar_token

router = APIRouter(
    prefix="/pedidos_productos",
    tags=["Pedidos_productos"],
    dependencies=[Depends(verificar_token)]
)

def actualizar_valor_total(id_pedido: int, db: Session):
    productos_pedido = db.query(Pedido_producto).filter(
        Pedido_producto.id_pedido == id_pedido
    ).all()
    
    total = 0
    for pp in productos_pedido:
        producto = db.query(Producto).filter(
            Producto.id_producto == pp.id_producto
        ).first()
        if producto:
            total += producto.valor_producto * pp.cantidad
    
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if pedido:
        pedido.valor_total = total
        db.commit()

@router.get("/", response_model=list[Pedido_producto_response], status_code=status.HTTP_200_OK)
def obtener_pedidos_productos(db: Session = Depends(get_db)):
    pedidos_productos = db.query(Pedido_producto).all()

    if not pedidos_productos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay pedidos productos registrados"
        )
    
    return pedidos_productos

@router.get("/{id}", response_model=Pedido_producto_response, status_code=status.HTTP_200_OK)
def obtener_pedido_producto(id: int, db: Session = Depends(get_db)):
    existe = db.query(Pedido_producto).filter(
        Pedido_producto.id_pe_pro == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe pedido producto con id: {id}"
        )
    
    return existe

@router.post("/", response_model=Pedido_producto_response, status_code=status.HTTP_201_CREATED)
def crear_pedido_producto(pedido_producto: Pedido_producto_create, db: Session = Depends(get_db)):
    nuevo_pedido_producto = Pedido_producto(
        id_pedido=pedido_producto.id_pedido,
        id_producto=pedido_producto.id_producto,
        cantidad=pedido_producto.cantidad,
        nota_especial=pedido_producto.nota_especial
    )

    db.add(nuevo_pedido_producto)
    db.commit()
    db.refresh(nuevo_pedido_producto)

    actualizar_valor_total(pedido_producto.id_pedido, db)

    return nuevo_pedido_producto

@router.put("/{id}", response_model=Pedido_producto_response, status_code=status.HTTP_200_OK)
def editar_pedido_producto(id: int, pedido_producto: Pedido_producto_update, db: Session = Depends(get_db)):
    existe = db.query(Pedido_producto).filter(
        Pedido_producto.id_pe_pro == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe pedido producto con id: {id}"
        )
    
    if pedido_producto.id_producto:
        existe.id_producto = pedido_producto.id_producto
    if pedido_producto.cantidad:
        existe.cantidad = pedido_producto.cantidad
    if pedido_producto.nota_especial:
        existe.nota_especial = pedido_producto.nota_especial
    
    db.commit()
    db.refresh(existe)

    actualizar_valor_total(existe.id_pedido, db)
    
    return existe

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def eliminar_pedido_producto(id: int, db: Session = Depends(get_db)):
    existe = db.query(Pedido_producto).filter(
        Pedido_producto.id_pe_pro == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe pedido producto con id: {id}"
        )
    
    id_pedido = existe.id_pedido
    db.delete(existe)
    db.commit()

    actualizar_valor_total(id_pedido, db)

    return {"mensaje": f"pedido producto con id: {id} eliminado correctamente"}