from datetime import date as date_type, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import extract
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..time_utils import now_ist, today_ist

router = APIRouter(prefix="/home", tags=["home"])


def _slot_for(db: Session, user_id: str, d: date_type, meal_type: models.MealType) -> schemas.HomeMealSlot:
    order = (
        db.query(models.MealOrder)
        .filter(
            models.MealOrder.user_id == user_id,
            models.MealOrder.date == d,
            models.MealOrder.meal_type == meal_type,
        )
        .first()
    )
    if order:
        return schemas.HomeMealSlot(
            meal_type=meal_type,
            order_id=order.id,
            dish_name=order.dish_name,
            status=order.status,
            slot_window=order.slot_window,
            note=order.note,
            price=float(order.price),
        )

    menu_rows = (
        db.query(models.DailyMenu)
        .filter(
            models.DailyMenu.date == d,
            models.DailyMenu.meal_type == meal_type,
            models.DailyMenu.sold_out == False,  # noqa: E712
        )
        .limit(2)
        .all()
    )
    return schemas.HomeMealSlot(
        meal_type=meal_type,
        preview_dishes=[m.dish.name for m in menu_rows],
    )


@router.get("", response_model=schemas.HomeOut)
def home(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = today_ist()
    tomorrow = today + timedelta(days=1)
    now = now_ist()
    booking_closes_at = "23:00"
    skip_closes_at = "23:59"

    today_slots = [
        _slot_for(db, current_user.id, today, models.MealType.breakfast),
        _slot_for(db, current_user.id, today, models.MealType.lunch),
    ]
    tomorrow_slots = [
        _slot_for(db, current_user.id, tomorrow, models.MealType.breakfast),
        _slot_for(db, current_user.id, tomorrow, models.MealType.lunch),
    ]

    tomorrow_menu_exists = (
        db.query(models.DailyMenu).filter(models.DailyMenu.date == tomorrow).first()
        is not None
    )

    subscription = (
        db.query(models.UserSubscription)
        .filter(models.UserSubscription.user_id == current_user.id, models.UserSubscription.active == True)  # noqa: E712
        .first()
    )

    spent = (
        db.query(models.MealOrder)
        .filter(
            models.MealOrder.user_id == current_user.id,
            models.MealOrder.status != models.OrderStatus.skipped,
            extract("month", models.MealOrder.date) == today.month,
            extract("year", models.MealOrder.date) == today.year,
        )
        .all()
    )
    today_meals_count = sum(1 for slot in today_slots if slot.status and slot.status != models.OrderStatus.skipped)
    tomorrow_booked_count = sum(1 for slot in tomorrow_slots if slot.status == models.OrderStatus.booked)
    route_confirmed_meals = 0
    if current_user.delivery_point_id:
        route_confirmed_meals = (
            db.query(models.MealOrder)
            .join(models.User, models.MealOrder.user_id == models.User.id)
            .filter(
                models.User.delivery_point_id == current_user.delivery_point_id,
                models.MealOrder.date == tomorrow,
                models.MealOrder.status != models.OrderStatus.skipped,
            )
            .count()
        )

    return schemas.HomeOut(
        today_date=today,
        tomorrow_date=tomorrow,
        delivering_to=current_user.delivery_point.name if current_user.delivery_point else None,
        today=today_slots,
        tomorrow=tomorrow_slots,
        booking_closes_at=booking_closes_at,
        skip_closes_at=skip_closes_at,
        current_time=now.strftime("%H:%M"),
        booking_open=now.time() < time.fromisoformat(booking_closes_at),
        skip_open=now.time() < time.fromisoformat(skip_closes_at),
        today_meals_count=today_meals_count,
        tomorrow_booked_count=tomorrow_booked_count,
        route_confirmed_meals=route_confirmed_meals,
        menu_live=tomorrow_menu_exists,
        subscription=subscription,
        spent_this_month=sum(float(o.price) for o in spent),
        wallet_balance=float(current_user.wallet_balance),
    )
