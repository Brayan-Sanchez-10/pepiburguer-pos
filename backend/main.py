from fastapi import FastAPI
from database import engine, Base
from routers import usuario, turno, mesa, categoria, producto, pedido, pedido_producto, domicilio, pago, auth

app = FastAPI(title= "Pepiburguer POS")


Base.metadata.create_all(bind=engine)


app.include_router(usuario.router)
app.include_router(turno.router)
app.include_router(mesa.router)
app.include_router(categoria.router)
app.include_router(producto.router)
app.include_router(pedido.router)
app.include_router(pedido_producto.router)
app.include_router(domicilio.router)
app.include_router(pago.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return "Bienvenido a Pepiburguer POS"