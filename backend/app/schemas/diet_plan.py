from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


# Meal Item schemas
class MealItemBase(BaseModel):
    name: str
    amount: str | None = None
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    sort_order: int = 0


class MealItemCreate(MealItemBase):
    pass


class MealItemUpdate(BaseModel):
    name: str | None = None
    amount: str | None = None
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    sort_order: int | None = None


class MealItemResponse(MealItemBase):
    id: UUID
    meal_id: UUID

    model_config = {"from_attributes": True}


# Meal schemas
class MealBase(BaseModel):
    meal_type: str
    day_of_week: int
    name: str
    description: str | None = None
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None


class MealCreate(MealBase):
    items: list[MealItemCreate] | None = None


class MealUpdate(BaseModel):
    meal_type: str | None = None
    day_of_week: int | None = None
    name: str | None = None
    description: str | None = None
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None


class MealResponse(MealBase):
    id: UUID
    diet_plan_id: UUID
    items: list[MealItemResponse] = []

    model_config = {"from_attributes": True}


# Diet Plan schemas
class DietPlanBase(BaseModel):
    title: str
    description: str | None = None
    start_date: date
    end_date: date
    is_active: bool = True


class DietPlanCreate(DietPlanBase):
    client_id: UUID
    meals: list[MealCreate] | None = None


class DietPlanUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None


class DietPlanResponse(DietPlanBase):
    id: UUID
    dietitian_id: UUID
    client_id: UUID
    created_at: datetime
    meals: list[MealResponse] = []

    model_config = {"from_attributes": True}
