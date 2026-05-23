from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Qawam API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ubiquitous-waffle-69pwgpjw56762557q-5173.app.github.dev",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def health_check():
    return {"status": "ok", "app": "Qawam"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
