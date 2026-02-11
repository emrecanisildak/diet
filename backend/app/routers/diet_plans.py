from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.middleware.auth import get_current_user, require_dietitian
from app.models.user import User
from app.models.diet_plan import DietPlan
from app.models.meal import Meal
from app.models.meal_item import MealItem
from app.schemas.diet_plan import (
    DietPlanCreate,
    DietPlanUpdate,
    DietPlanResponse,
    MealCreate,
    MealUpdate,
    MealResponse,
    MealItemCreate,
    MealItemUpdate,
    MealItemResponse,
)

router = APIRouter(prefix="/diet-plans", tags=["diet-plans"])


@router.get("", response_model=list[DietPlanResponse])
def list_diet_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(DietPlan).options(
        joinedload(DietPlan.meals).joinedload(Meal.items)
    )
    if current_user.role == "dietitian":
        plans = query.filter(DietPlan.dietitian_id == current_user.id).all()
    else:
        plans = query.filter(DietPlan.client_id == current_user.id).all()
    return plans


@router.get("/{plan_id}", response_model=DietPlanResponse)
def get_diet_plan(plan_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = (
        db.query(DietPlan)
        .options(joinedload(DietPlan.meals).joinedload(Meal.items))
        .filter(DietPlan.id == plan_id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")
    if current_user.role == "client" and plan.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "dietitian" and plan.dietitian_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return plan


@router.post("", response_model=DietPlanResponse, status_code=status.HTTP_201_CREATED)
def create_diet_plan(
    plan_data: DietPlanCreate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plan = DietPlan(
        dietitian_id=current_user.id,
        client_id=plan_data.client_id,
        title=plan_data.title,
        description=plan_data.description,
        start_date=plan_data.start_date,
        end_date=plan_data.end_date,
        is_active=plan_data.is_active,
    )
    db.add(plan)
    db.flush()

    if plan_data.meals:
        for meal_data in plan_data.meals:
            meal_dict = meal_data.model_dump(exclude={"items"})
            meal = Meal(diet_plan_id=plan.id, **meal_dict)
            db.add(meal)
            db.flush()
            if meal_data.items:
                for item_data in meal_data.items:
                    item = MealItem(meal_id=meal.id, **item_data.model_dump())
                    db.add(item)

    db.commit()
    db.refresh(plan)
    return plan


@router.put("/{plan_id}", response_model=DietPlanResponse)
def update_diet_plan(
    plan_id: UUID,
    plan_data: DietPlanUpdate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plan = db.query(DietPlan).filter(DietPlan.id == plan_id, DietPlan.dietitian_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    update_data = plan_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}")
def delete_diet_plan(plan_id: UUID, current_user: User = Depends(require_dietitian), db: Session = Depends(get_db)):
    plan = db.query(DietPlan).filter(DietPlan.id == plan_id, DietPlan.dietitian_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Diet plan deleted"}


# Meal endpoints
@router.post("/{plan_id}/meals", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def add_meal(
    plan_id: UUID,
    meal_data: MealCreate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plan = db.query(DietPlan).filter(DietPlan.id == plan_id, DietPlan.dietitian_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    meal_dict = meal_data.model_dump(exclude={"items"})
    meal = Meal(diet_plan_id=plan_id, **meal_dict)
    db.add(meal)
    db.flush()

    if meal_data.items:
        for item_data in meal_data.items:
            item = MealItem(meal_id=meal.id, **item_data.model_dump())
            db.add(item)

    db.commit()
    db.refresh(meal)
    return meal


@router.put("/{plan_id}/meals/{meal_id}", response_model=MealResponse)
def update_meal(
    plan_id: UUID,
    meal_id: UUID,
    meal_data: MealUpdate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.diet_plan_id == plan_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    update_data = meal_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(meal, key, value)

    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/{plan_id}/meals/{meal_id}")
def delete_meal(
    plan_id: UUID,
    meal_id: UUID,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.diet_plan_id == plan_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"message": "Meal deleted"}


# Meal Item endpoints
@router.post("/{plan_id}/meals/{meal_id}/items", response_model=MealItemResponse, status_code=status.HTTP_201_CREATED)
def add_meal_item(
    plan_id: UUID,
    meal_id: UUID,
    item_data: MealItemCreate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plan = db.query(DietPlan).filter(DietPlan.id == plan_id, DietPlan.dietitian_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=403, detail="Access denied")

    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.diet_plan_id == plan_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    item = MealItem(meal_id=meal_id, **item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{plan_id}/meals/{meal_id}/items/{item_id}", response_model=MealItemResponse)
def update_meal_item(
    plan_id: UUID,
    meal_id: UUID,
    item_id: UUID,
    item_data: MealItemUpdate,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plan = db.query(DietPlan).filter(DietPlan.id == plan_id, DietPlan.dietitian_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=403, detail="Access denied")

    item = db.query(MealItem).filter(MealItem.id == item_id, MealItem.meal_id == meal_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Meal item not found")

    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{plan_id}/meals/{meal_id}/items/{item_id}")
def delete_meal_item(
    plan_id: UUID,
    meal_id: UUID,
    item_id: UUID,
    current_user: User = Depends(require_dietitian),
    db: Session = Depends(get_db),
):
    plan = db.query(DietPlan).filter(DietPlan.id == plan_id, DietPlan.dietitian_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=403, detail="Access denied")

    item = db.query(MealItem).filter(MealItem.id == item_id, MealItem.meal_id == meal_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Meal item not found")

    db.delete(item)
    db.commit()
    return {"message": "Meal item deleted"}
