from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.middleware.auth import get_current_user, require_dietitian
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "dietitian":
        appts = db.query(Appointment).filter(Appointment.dietitian_id == current_user.id).order_by(Appointment.date_time).all()
    else:
        appts = db.query(Appointment).filter(Appointment.client_id == current_user.id).order_by(Appointment.date_time).all()
    return appts


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.id not in (appt.dietitian_id, appt.client_id):
        raise HTTPException(status_code=403, detail="Access denied")
    return appt


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appt_data: AppointmentCreate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    appt = Appointment(
        dietitian_id=current_user.id,
        client_id=appt_data.client_id,
        title=appt_data.title,
        date_time=appt_data.date_time,
        duration_minutes=appt_data.duration_minutes,
        notes=appt_data.notes,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: UUID,
    appt_data: AppointmentUpdate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.dietitian_id == current_user.id
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_data = appt_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(appt, key, value)

    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: UUID, current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.dietitian_id == current_user.id
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
    return {"message": "Appointment deleted"}
