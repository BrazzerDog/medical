from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class SpecializationType(enum.Enum):
    DOCTOR = "ВРАЧ"
    PARAMEDIC = "ФЕЛЬДШЕР"
    OTHER = "ИНОЕ"

class DoctorSpecialization(enum.Enum):
    THERAPIST = "Врач терапевт"
    TRAUMATOLOGIST = "Врач Травмотолог"
    SURGEON = "Врач Хирург"
    ANESTHESIOLOGIST = "Врач Анестезиолог-Реаниматолог"
    INFECTIONIST = "Врач инфекционист"
    EMERGENCY = "Врач СМП"
    OPHTHALMOLOGIST = "Врач офтальмолог"
    DENTIST = "Врач стоматолог"
    PEDIATRICIAN = "Врач педиатр"
    GYNECOLOGIST = "Врач гинеколог"
    UROLOGIST = "Врач уролог"

class OtherSpecialization(enum.Enum):
    NURSE = "Медбрат"
    LAB_TECHNICIAN = "Лаборант"
    PHARMACIST = "Провизор"

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    telegram_id = Column(Integer)
    full_name = Column(String(100))
    age = Column(Integer)
    height = Column(Integer)
    weight = Column(Integer)
    has_chronic_diseases = Column(Boolean, default=False)
    chronic_diseases_info = Column(String(500), nullable=True)
    has_travel_restrictions = Column(Boolean, default=False)
    has_foreign_passport = Column(Boolean, default=False)
    specialization_type = Column(Enum(SpecializationType))
    doctor_specialization = Column(Enum(DoctorSpecialization), nullable=True)
    other_specialization = Column(Enum(OtherSpecialization), nullable=True)
    contact_info = Column(String(100))
    resume = Column(String(2000))
    registration_complete = Column(Boolean, default=False)
    registration_attempts = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now) 