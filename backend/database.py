from sqlalchemy import create_engine #permite crear una conexion entre python y la base de datos
from sqlalchemy.orm import sessionmaker, declarative_base #sessionmaker sirve para crear sesiones de base de datos, lo que permite consultar, insertar, actualizar y eliminar datos; declarative_base sirve para crear una clase base de a que heredaran todos los modelos 
from dotenv import load_dotenv # importa la funcion que permite leer variables de entorno desde un archivo .env
import os # importamos el modulo de python para trabajar con el sistema operativo

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()