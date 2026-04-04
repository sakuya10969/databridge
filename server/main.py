from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.presentation.error_handlers import register_error_handlers
from app.presentation.router import api_router

app = FastAPI(title="DataBridge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(api_router)
