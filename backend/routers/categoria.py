from fastapi import HTTPException, APIRouter, Depends, status
from sqlalchemy.orm import Session
from models.categoria import Categoria
from schemas.categoria import Categoria_create, Categoria_response, Categoria_update
from database import get_db
from middleware.auth import verificar_token, verificar_admin
router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"],
    dependencies= [Depends(verificar_token)]
)

@router.get("/", response_model=list[Categoria_response], status_code=status.HTTP_200_OK)
def obtener_categorias(db: Session = Depends(get_db)):
    categorias = db.query(Categoria).all()

    if not categorias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay categorias registradas"
        )
    
    return categorias

@router.get("/{id}", response_model= Categoria_response, status_code=status.HTTP_200_OK)
def obtener_categoria(id:int, db: Session=Depends(get_db)):
    existe = db.query(Categoria).filter(
        Categoria.id_categoria == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"No existe la categoria con el id: {id}"
        )
    
    return existe


@router.post("/", response_model= Categoria_response, status_code= status.HTTP_201_CREATED)
def crear_categoria(categoria : Categoria_create, db: Session= Depends(get_db)):
    nueva_categoria = Categoria(
        nombre_categoria = categoria.nombre_categoria
    )

    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)

    return nueva_categoria

@router.put("/{id}", response_model= Categoria_response, status_code= status.HTTP_200_OK)
def editar_categoria(id : int, nombre : Categoria_update, db: Session = Depends(get_db)):
    existe = db.query(Categoria).filter(
        Categoria.id_categoria == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"No existe ctageoria con el id: {id}"
        )
    
    if nombre.nombre_categoria:
        existe.nombre_categoria = nombre.nombre_categoria
    
    db.commit()
    db.refresh(existe)

    return existe

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def eliminar_categoria(id: int, db: Session=Depends(get_db)):
    existe = db.query(Categoria).filter(
        Categoria.id_categoria == id
    ).first()

    if not existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe categoria con el id: {id}"
        )

    from models.producto import Producto
    from models.pedido_producto import Pedido_producto

    # 1. Obtener productos de esta categoría
    productos = db.query(Producto).filter(
        Producto.id_categoria == id
    ).all()

    # 2. Eliminar pedido_producto de cada producto
    for producto in productos:
        db.query(Pedido_producto).filter(
            Pedido_producto.id_producto == producto.id_producto
        ).delete()

    # 3. Eliminar productos
    db.query(Producto).filter(
        Producto.id_categoria == id
    ).delete()

    # 4. Eliminar categoría
    db.delete(existe)
    db.commit()

    return {"mensaje": f"Categoria con id {id} eliminada correctamente"}