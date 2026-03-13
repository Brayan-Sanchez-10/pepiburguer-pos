from fastapi import FastAPI

app = FastAPI(title= "Pepiburguer POS")

@app.get("/")
def root():
    return "Bienvenido a Pepiburguer POS"