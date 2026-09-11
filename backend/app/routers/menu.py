from datetime import date as date_type

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/menu", tags=["menu"])

DISH_META = {
    "Poha with sev": {"cuisine": "Maharashtrian", "spice": "Mild", "tags": ["Popular", "Light"], "rating": 4.4},
    "Jain poha": {"cuisine": "Jain", "spice": "Mild", "tags": ["No onion/garlic", "Light"], "rating": 4.2},
    "Upma": {"cuisine": "South Indian", "spice": "Mild", "tags": ["Light"], "rating": 4.1},
    "Idli with sambhar": {"cuisine": "South Indian", "spice": "Mild", "tags": ["Popular"], "rating": 4.5},
    "Masala dosa tiffin": {"cuisine": "South Indian", "spice": "Medium", "tags": ["Popular"], "rating": 4.6},
    "Thepla with curd": {"cuisine": "Gujarati", "spice": "Mild", "tags": ["Travel friendly"], "rating": 4.3},
    "Paneer paratha": {"cuisine": "Punjabi", "spice": "Medium", "tags": ["High protein"], "rating": 4.5},
    "Sprouts bowl": {"cuisine": "Healthy", "spice": "Mild", "tags": ["Protein"], "rating": 4.0},
    "Sabudana khichdi": {"cuisine": "Maharashtrian", "spice": "Mild", "tags": ["Fasting"], "rating": 4.1},
    "Misal pav": {"cuisine": "Maharashtrian", "spice": "Spicy", "tags": ["Popular"], "rating": 4.4},
    "Rajma chawal": {"cuisine": "Punjabi", "spice": "Medium", "tags": ["Comfort"], "rating": 4.5},
    "Chole chawal": {"cuisine": "Punjabi", "spice": "Medium", "tags": ["Popular"], "rating": 4.4},
    "Jain mini thali": {"cuisine": "Jain", "spice": "Mild", "tags": ["No onion/garlic"], "rating": 4.3},
    "Gujarati mini thali": {"cuisine": "Gujarati", "spice": "Mild", "tags": ["Balanced"], "rating": 4.4},
    "Khichdi kadhi": {"cuisine": "Gujarati", "spice": "Mild", "tags": ["Light"], "rating": 4.2},
    "Dal dhokli": {"cuisine": "Gujarati", "spice": "Medium", "tags": ["Homestyle"], "rating": 4.3},
    "Dal makhani rice": {"cuisine": "Punjabi", "spice": "Medium", "tags": ["Rich"], "rating": 4.4},
    "Curd rice": {"cuisine": "South Indian", "spice": "Mild", "tags": ["Light"], "rating": 4.2},
    "Lemon rice": {"cuisine": "South Indian", "spice": "Mild", "tags": ["Light"], "rating": 4.1},
    "Millet khichdi": {"cuisine": "Healthy", "spice": "Mild", "tags": ["Millet"], "rating": 4.2},
    "Varan bhaat": {"cuisine": "Maharashtrian", "spice": "Mild", "tags": ["Comfort"], "rating": 4.3},
}


def _dish_out(dish: models.Dish) -> schemas.DishOut:
    meta = DISH_META.get(dish.name, {})
    return schemas.DishOut(
        id=dish.id,
        name=dish.name,
        description=dish.description,
        kcal=dish.kcal,
        image_url=dish.image_url,
        veg=dish.veg,
        cuisine=meta.get("cuisine", "Homestyle"),
        spice=meta.get("spice", "Medium"),
        tags=meta.get("tags", []),
        rating=meta.get("rating", 4.3),
    )


@router.get("", response_model=list[schemas.DailyMenuOut])
def get_menu(
    date: date_type = Query(...),
    meal_type: models.MealType | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.DailyMenu).filter(models.DailyMenu.date == date)
    if meal_type:
        q = q.filter(models.DailyMenu.meal_type == meal_type)
    return [
        schemas.DailyMenuOut(
            id=row.id,
            date=row.date,
            meal_type=row.meal_type,
            price=float(row.price),
            sold_out=row.sold_out,
            booking_closes_at=row.booking_closes_at,
            dish=_dish_out(row.dish),
        )
        for row in q.all()
    ]
