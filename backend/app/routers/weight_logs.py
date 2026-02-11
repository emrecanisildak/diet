from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user, require_dietitian
from app.models.user import User
from app.models.weight_log import WeightLog
from app.schemas.weight_log import WeightLogCreate, WeightLogResponse

router = APIRouter(prefix="/weight-logs", tags=["weight-logs"])


@router.get("", response_model=list[WeightLogResponse])
def list_my_weight_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can view their weight logs")
    logs = db.query(WeightLog).filter(WeightLog.client_id == current_user.id).order_by(WeightLog.logged_at.desc()).all()
    return logs


@router.get("/client/{client_id}", response_model=list[WeightLogResponse])
def get_client_weight_logs(
    client_id: UUID, current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)
):
    logs = db.query(WeightLog).filter(WeightLog.client_id == client_id).order_by(WeightLog.logged_at.desc()).all()
    return logs


@router.post("", response_model=WeightLogResponse, status_code=201)
def create_weight_log(log_data: WeightLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can log weight")
    log = WeightLog(client_id=current_user.id, weight=log_data.weight, note=log_data.note)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}")
def delete_weight_log(log_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(WeightLog).filter(WeightLog.id == log_id, WeightLog.client_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Weight log not found")
    db.delete(log)
    db.commit()
    return {"message": "Weight log deleted"}
