import uuid

from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MealItem(Base):
    __tablename__ = "meal_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meal_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("meals.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[str | None] = mapped_column(String(100), nullable=True)
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    meal = relationship("Meal", back_populates="items")
