from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.producto import Producto
from schemas.producto import Producto_response, Producto_create, Producto_update
from database import get_db
from middleware.auth import verificar_token, verificar_admin

router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
    dependencies= [Depends(verificar_admin)]
)

@router.get("/", response_model= list[Producto_response], status_code= status.HTTP_200_OK)
def obtener_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).all()

    if not productos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hay productos registrados"
        )
    
    return productos

@router.get("/{id}", response_model=Producto_response, status_code=status.HTTP_200_OK)
def obtener_producto(id: int, db: Session =Depends(get_db)):
    existe = db.query(Producto).filter(
        Producto.id_producto == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= f"No existe el producto con id: {id}"
        )
    
    return existe

@router.post("/", response_model= Producto_response, status_code= status.HTTP_201_CREATED)
def crear_producto(producto: Producto_create, db: Session= Depends(get_db)):
    nuevo_producto  = Producto(
        id_categoria =producto.id_categoria,
        nombre_producto = producto.nombre_producto,
        valor_producto =producto.valor_producto,
        disponible = producto.disponible
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto

@router.put("/{id}", response_model= Producto_response, status_code= status.HTTP_200_OK)
def editar_producto(id: int, producto: Producto_update, db: Session= Depends(get_db)):
    existe = db.query(Producto).filter(
        Producto.id_producto == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail=f"No existe producto con el id: {id}"
        )
    
    if producto.id_categoria:
        existe.id_categoria = producto.id_categoria
    if producto.nombre_producto:
        existe.nombre_producto = producto.nombre_producto
    if producto.valor_producto:
        existe.valor_producto = producto.valor_producto
    if producto.disponible is not None:
        existe.disponible = producto.disponible
    
    db.commit()
    db.refresh(existe)

    return existe

@router.delete("/{id}", status_code= status.HTTP_200_OK)
def eliminar_producto(id: int, db: Session =  Depends(get_db)):
    existe = db.query(Producto).filter(
        Producto.id_producto == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail=f"No existe el producto con id: {id}"
        )
    
    db.delete(existe)
    db.commit()

    return {"mesaje": f"Producto con id: {id} eliminado correctamente"}