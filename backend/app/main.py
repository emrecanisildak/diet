import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, users, diet_plans, weight_logs, messages, appointments, notifications
from app.services.scheduler import notification_scheduler

app = FastAPI(title="DietApp API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(diet_plans.router, prefix="/api")
app.include_router(weight_logs.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(uploads_dir, "messages"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.on_event("startup")
def startup_event():
    notification_scheduler.start()


@app.on_event("shutdown")
def shutdown_event():
    notification_scheduler.shutdown()


@app.get("/")
def root():
    return {"message": "DietApp API is running"}
