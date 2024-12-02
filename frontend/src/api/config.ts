import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY || 'secure_shell_pass';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
    }
});

export enum SpecializationType {
    DOCTOR = "ВРАЧ",
    PARAMEDIC = "ФЕЛЬДШЕР",
    OTHER = "ИНОЕ"
}

export enum DoctorSpecialization {
    THERAPIST = "Врач терапевт",
    TRAUMATOLOGIST = "Врач Травмотолог",
    SURGEON = "Врач Хирург",
    ANESTHESIOLOGIST = "Врач Анестезиолог-Реаниматолог",
    INFECTIONIST = "Врач инфекционист",
    EMERGENCY = "Врач СМП",
    OPHTHALMOLOGIST = "Врач офтальмолог",
    DENTIST = "Врач стоматолог",
    PEDIATRICIAN = "Врач педиатр",
    GYNECOLOGIST = "Врач гинеколог",
    UROLOGIST = "Врач уролог"
}

export enum OtherSpecialization {
    NURSE = "Медбрат",
    LAB_TECHNICIAN = "Лаборант",
    PHARMACIST = "Провизор"
}

export interface User {
    telegram_id: number;
    full_name: string;
    age: number;
    height: number;
    weight: number;
    has_chronic_diseases: boolean;
    chronic_diseases_info?: string;
    has_travel_restrictions: boolean;
    has_foreign_passport: boolean;
    specialization_type: SpecializationType;
    doctor_specialization?: DoctorSpecialization;
    other_specialization?: OtherSpecialization;
    contact_info: string;
    resume: string;
    registration_attempts: number;
    created_at: string;
}

export interface Statistics {
    total_unique_users: number;
    total_forms_submitted: number;
    specialization_types: Record<string, number>;
    foreign_passport_distribution: Record<string, number>;
    doctor_specializations: Record<string, number>;
} 