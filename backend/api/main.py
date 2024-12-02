from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import os
import logging
from dotenv import load_dotenv
from telegram import Bot
from sqlalchemy import func

from ..bot.database import SessionLocal
from ..bot.models import User, SpecializationType, DoctorSpecialization, OtherSpecialization

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Admin Panel API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Защита API ключом
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header != os.getenv("ADMIN_API_KEY"):
        raise HTTPException(status_code=403, detail="Could not validate API key")
    return api_key_header

# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Модели Pydantic для API
class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    telegram_id: int
    full_name: str
    age: int
    height: int
    weight: int
    has_foreign_passport: bool
    specialization_type: SpecializationType
    doctor_specialization: Optional[DoctorSpecialization] = None
    other_specialization: Optional[OtherSpecialization] = None
    contact_info: str
    resume: str
    registration_attempts: int
    created_at: datetime

class MessageSchema(BaseModel):
    text: str
    user_ids: Optional[List[int]] = None

# API эндпоинты
@app.get("/users/", response_model=List[UserBase])
async def get_all_users(
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Получить список всех пользователей"""
    return db.query(User).all()

@app.get("/users/{telegram_id}", response_model=List[UserBase])
async def get_user_forms(
    telegram_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Получить все анкеты конкретного пользователя"""
    forms = db.query(User).filter(User.telegram_id == telegram_id).order_by(User.created_at.desc()).all()
    if not forms:
        raise HTTPException(status_code=404, detail="User not found")
    return forms

@app.get("/users/latest/{telegram_id}", response_model=UserBase)
async def get_latest_user_form(
    telegram_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Получить последнюю анкету пользователя"""
    form = db.query(User).filter(User.telegram_id == telegram_id).order_by(User.created_at.desc()).first()
    if not form:
        raise HTTPException(status_code=404, detail="User not found")
    return form

@app.post("/send-message/")
async def send_message(
    message: MessageSchema,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Отправить сообщение пользователям"""
    bot = Bot(token=os.getenv("BOT_TOKEN"))
    
    if message.user_ids:
        # Отправка конкретным пользователям
        for user_id in message.user_ids:
            try:
                await bot.send_message(chat_id=user_id, text=message.text)
            except Exception as e:
                # Логируем ошибку, но продолжаем отправку остальным
                print(f"Error sending message to {user_id}: {e}")
    else:
        # Отправка всем пользователям
        users = db.query(User.telegram_id).distinct().all()
        for user in users:
            try:
                await bot.send_message(chat_id=user.telegram_id, text=message.text)
            except Exception as e:
                print(f"Error sending message to {user.telegram_id}: {e}")

    await bot.close()
    return {"status": "success", "message": "Messages sent"}

@app.get("/statistics/")
async def get_statistics(
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Получить статистику по пользователм"""
    total_users = db.query(User.telegram_id).distinct().count()
    total_forms = db.query(User).count()
    specializations = db.query(User.specialization, db.func.count(User.specialization))\
        .group_by(User.specialization).all()
    
    return {
        "total_unique_users": total_users,
        "total_forms_submitted": total_forms,
        "specializations_distribution": dict(specializations)
    }

@app.get("/users/by-specialization/{spec_type}")
async def get_users_by_specialization(
    spec_type: SpecializationType,
    has_foreign_passport: Optional[bool] = None,
    doctor_spec: Optional[DoctorSpecialization] = None,
    other_spec: Optional[OtherSpecialization] = None,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Получить список пользователей по специализации с фильтрами"""
    query = db.query(User).filter(User.specialization_type == spec_type)
    
    if has_foreign_passport is not None:
        query = query.filter(User.has_foreign_passport == has_foreign_passport)
    
    if spec_type == SpecializationType.DOCTOR and doctor_spec:
        query = query.filter(User.doctor_specialization == doctor_spec)
    elif spec_type == SpecializationType.OTHER and other_spec:
        query = query.filter(User.other_specialization == other_spec)
    
    return query.all()

@app.get("/statistics/extended/")
async def get_extended_statistics(
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """Получить расширенную статистику по пользователям"""
    try:
        # Общая статистика
        total_users = db.query(User.telegram_id).distinct().count()
        total_forms = db.query(User).count()
        
        # Статистика по типам специализации
        spec_stats = (
            db.query(
                User.specialization_type,
                func.count(User.specialization_type).label('count')
            )
            .group_by(User.specialization_type)
            .all()
        )
        
        spec_stats_dict = {}
        for spec_type, count in spec_stats:
            if spec_type:
                spec_stats_dict[spec_type.value] = count
        
        # Статистика по загранпаспортам
        passport_stats = (
            db.query(
                User.has_foreign_passport,
                func.count(User.has_foreign_passport).label('count')
            )
            .group_by(User.has_foreign_passport)
            .all()
        )
        
        passport_stats_dict = {
            'true': 0,
            'false': 0
        }
        for has_passport, count in passport_stats:
            key = str(has_passport).lower()
            passport_stats_dict[key] = count
        
        # Статистика по врачебным специализациям
        doctor_specs = (
            db.query(
                User.doctor_specialization,
                func.count(User.doctor_specialization).label('count')
            )
            .filter(User.specialization_type == SpecializationType.DOCTOR)
            .filter(User.doctor_specialization.isnot(None))
            .group_by(User.doctor_specialization)
            .all()
        )
        
        doctor_specs_dict = {}
        for spec, count in doctor_specs:
            if spec:
                doctor_specs_dict[spec.value] = count
        
        return {
            "total_unique_users": total_users,
            "total_forms_submitted": total_forms,
            "specialization_types": spec_stats_dict,
            "foreign_passport_distribution": passport_stats_dict,
            "doctor_specializations": doctor_specs_dict
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting statistics: {str(e)}"
        ) 