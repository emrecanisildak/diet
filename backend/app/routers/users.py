from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.middleware.auth import get_current_user, require_dietitian
from app.models.user import User, DietitianClient
from app.models.diet_plan import DietPlan
from app.models.meal import Meal
from app.models.meal_item import MealItem
from app.models.appointment import Appointment
from app.schemas.user import UserResponse, UserUpdate, ClientWithStatus
from app.schemas.diet_plan import DietPlanResponse
from app.schemas.appointment import AppointmentResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(user_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/clients", response_model=list[ClientWithStatus])
def get_my_clients(current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)):
    relations = (
        db.query(DietitianClient)
        .filter(DietitianClient.dietitian_id == current_user.id)
        .all()
    )
    result = []
    for rel in relations:
        client = db.query(User).filter(User.id == rel.client_id).first()
        if client:
            client_data = ClientWithStatus.model_validate(client)
            client_data.status = rel.status
            result.append(client_data)
    return result


@router.post("/clients/{client_id}", status_code=status.HTTP_201_CREATED)
def add_client(client_id: UUID, current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)):
    client = db.query(User).filter(User.id == client_id, User.role == "client").first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    existing = (
        db.query(DietitianClient)
        .filter(DietitianClient.dietitian_id == current_user.id, DietitianClient.client_id == client_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Client already added")

    relation = DietitianClient(dietitian_id=current_user.id, client_id=client_id)
    db.add(relation)
    db.commit()
    return {"message": "Client added successfully"}


@router.delete("/clients/{client_id}")
def remove_client(client_id: UUID, current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)):
    relation = (
        db.query(DietitianClient)
        .filter(DietitianClient.dietitian_id == current_user.id, DietitianClient.client_id == client_id)
        .first()
    )
    if not relation:
        raise HTTPException(status_code=404, detail="Client relation not found")

    relation.status = "inactive"
    db.commit()
    return {"message": "Client removed"}


@router.get("/clients/{client_id}", response_model=ClientWithStatus)
def get_client(client_id: UUID, current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)):
    relation = (
        db.query(DietitianClient)
        .filter(DietitianClient.dietitian_id == current_user.id, DietitianClient.client_id == client_id)
        .first()
    )
    if not relation:
        raise HTTPException(status_code=404, detail="Client not found")
    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client_data = ClientWithStatus.model_validate(client)
    client_data.status = relation.status
    return client_data


@router.get("/clients/{client_id}/diet-plans", response_model=list[DietPlanResponse])
def get_client_diet_plans(
    client_id: UUID,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plans = (
        db.query(DietPlan)
        .options(joinedload(DietPlan.meals).joinedload(Meal.items))
        .filter(DietPlan.client_id == client_id, DietPlan.dietitian_id == current_user.id)
        .order_by(DietPlan.created_at.desc())
        .all()
    )
    return plans


@router.get("/clients/{client_id}/appointments", response_model=list[AppointmentResponse])
def get_client_appointments(
    client_id: UUID,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    appts = (
        db.query(Appointment)
        .filter(Appointment.client_id == client_id, Appointment.dietitian_id == current_user.id)
        .order_by(Appointment.date_time.desc())
        .all()
    )
    return appts
