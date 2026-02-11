import uuid

from sqlalchemy import String, Text, Integer, Float, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diet_plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("diet_plans.id"), nullable=False)
    meal_type: Mapped[str] = mapped_column(
        SAEnum("breakfast", "lunch", "dinner", "snack", name="meal_type"), nullable=False
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-7
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat: Mapped[float | None] = mapped_column(Float, nullable=True)

    diet_plan = relationship("DietPlan", back_populates="meals")
    items = relationship("MealItem", back_populates="meal", cascade="all, delete-orphan")
