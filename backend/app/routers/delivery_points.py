from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..time_utils import today_ist

router = APIRouter(prefix="/delivery-points", tags=["delivery-points"])


@router.get("", response_model=list[schemas.DeliveryPointOut])
def list_delivery_points(db: Session = Depends(get_db)):
    points = (
        db.query(models.DeliveryPoint)
        .order_by(models.DeliveryPoint.sort_order)
        .all()
    )
    tomorrow = today_ist() + timedelta(days=1)
    rows = []
    for point in points:
        confirmed = (
            db.query(models.MealOrder)
            .join(models.User, models.MealOrder.user_id == models.User.id)
            .filter(
                models.User.delivery_point_id == point.id,
                models.MealOrder.date == tomorrow,
                models.MealOrder.status != models.OrderStatus.skipped,
            )
            .count()
        )
        service_target = 15
        discount_target = 25
        target = discount_target if confirmed >= service_target or point.featured else service_target
        percent = min(round((confirmed / target) * 100), 100) if target else 0
        next_label = "₹5 off per meal at 25 meals" if confirmed >= service_target or point.featured else "Service unlocks at 15 meals"
        rows.append(
            schemas.DeliveryPointOut(
                id=point.id,
                name=point.name,
                area=point.area,
                distance_label=point.distance_label,
                handover_type=point.handover_type,
                breakfast_available=point.breakfast_available,
                lunch_available=point.lunch_available,
                breakfast_window=point.breakfast_window,
                lunch_window=point.lunch_window,
                featured=point.featured,
                route_confirmed_meals=confirmed,
                route_discount_target=target,
                route_score_percent=percent,
                next_unlock_label=next_label,
                queue_percent=percent,
            )
        )
    return rows
