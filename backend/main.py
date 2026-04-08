from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import usuario, turno, mesa, categoria, producto, pedido, pedido_producto, domicilio, pago, auth

app = FastAPI(title="Pepiburguer POS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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