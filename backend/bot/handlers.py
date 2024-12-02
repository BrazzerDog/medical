from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ContextTypes, ConversationHandler
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import User, SpecializationType, DoctorSpecialization, OtherSpecialization
from datetime import datetime

# Добавляем новые состояния для выбора специализации и загранпаспорта
(FULL_NAME, AGE, HEIGHT, WEIGHT, CHRONIC_DISEASES, CHRONIC_DISEASES_INFO,
 TRAVEL_RESTRICTIONS, SPEC_TYPE, DOCTOR_SPEC, OTHER_SPEC, 
 FOREIGN_PASSPORT, CONTACT_INFO, RESUME) = range(13)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Проверяем общее количество попыток регистрации
    with SessionLocal() as session:
        attempts_count = session.query(User).filter(
            User.telegram_id == update.effective_user.id,
            User.registration_complete == True  # Учитываем только завершенные регистрации
        ).count()
        
        if attempts_count >= 2:
            await update.message.reply_text(
                "❌ К сожалению, вы уже использовали максимальное количество попыток регистрации."
            )
            return ConversationHandler.END

    await update.message.reply_text(
        "👋 Привет! Добро пожаловать в бот регистрации медицинских специалистов! 🏥\n\n"
        "❗️ Важно: убедитесь, что ваш профиль Telegram открыт для поиска, "
        "так как связь будет осуществляться только через Telegram!\n\n"
        "🙂 Давайте начнем! Пожалуйста, введите ваше ФИО:"
    )
    return FULL_NAME

async def process_full_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['full_name'] = update.message.text
    await update.message.reply_text("📅 Отлично! Теперь введите ваш возраст:")
    return AGE

async def process_age(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        age = int(update.message.text)
        if age < 18 or age > 100:
            raise ValueError
        context.user_data['age'] = age
        await update.message.reply_text("📏 Введите ваш рост (в см):")
        return HEIGHT
    except ValueError:
        await update.message.reply_text("⚠️ Пожалуйста, введите корректный возраст (18-100):")
        return AGE

async def process_height(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        height = int(update.message.text)
        if height < 140 or height > 250:
            raise ValueError
        context.user_data['height'] = height
        await update.message.reply_text("⚖️ Введите ваш вес (в кг):")
        return WEIGHT
    except ValueError:
        await update.message.reply_text("⚠️ Пожалуйста, введите корректный рост (140-250 см):")
        return HEIGHT

async def process_weight(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        weight = int(update.message.text)
        if weight < 40 or weight > 200:
            raise ValueError
        context.user_data['weight'] = weight
        
        keyboard = [
            [KeyboardButton("Да")],
            [KeyboardButton("Нет")]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        await update.message.reply_text(
            "🏥 Есть ли у вас хронические заболевания?",
            reply_markup=reply_markup
        )
        return CHRONIC_DISEASES
    except ValueError:
        await update.message.reply_text("⚠️ Пожалуйста, введите корректный вес (40-200 кг):")
        return WEIGHT

async def process_chronic_diseases(update: Update, context: ContextTypes.DEFAULT_TYPE):
    answer = update.message.text.lower()
    if answer not in ["да", "нет"]:
        await update.message.reply_text("⚠️ Пожалуйста, выберите 'Да' или 'Нет'")
        return CHRONIC_DISEASES
    
    context.user_data['has_chronic_diseases'] = (answer == "да")
    
    if answer == "да":
        await update.message.reply_text(
            "📝 Пожалуйста, опишите ваши хронические заболевания:"
        )
        return CHRONIC_DISEASES_INFO
    else:
        context.user_data['chronic_diseases_info'] = None
        keyboard = [
            [KeyboardButton("Да")],
            [KeyboardButton("Нет")]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        await update.message.reply_text(
            "🚫 Есть ли у вас ограничения на выезд из РФ?",
            reply_markup=reply_markup
        )
        return TRAVEL_RESTRICTIONS

async def process_chronic_diseases_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    info = update.message.text
    if len(info) > 500:
        await update.message.reply_text(
            "⚠️ Описание слишком длинное! Пожалуйста, сократите его до 500 символов."
        )
        return CHRONIC_DISEASES_INFO
    
    context.user_data['chronic_diseases_info'] = info
    
    keyboard = [
        [KeyboardButton("Да")],
        [KeyboardButton("Нет")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        "🚫 Есть ли у вас ограничения на выезд из РФ?",
        reply_markup=reply_markup
    )
    return TRAVEL_RESTRICTIONS

async def process_travel_restrictions(update: Update, context: ContextTypes.DEFAULT_TYPE):
    answer = update.message.text.lower()
    if answer not in ["да", "нет"]:
        await update.message.reply_text("⚠️ Пожалуйста, выберите 'Да' или 'Нет'")
        return TRAVEL_RESTRICTIONS
    
    context.user_data['has_travel_restrictions'] = (answer == "да")
    
    # Создаем клавиатуру для выбора типа специализации
    keyboard = [[KeyboardButton(spec.value)] for spec in SpecializationType]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    await update.message.reply_text(
        "👨‍⚕️ Выберите тип вашей специализации:",
        reply_markup=reply_markup
    )
    return SPEC_TYPE

async def process_spec_type(update: Update, context: ContextTypes.DEFAULT_TYPE):
    spec_type = update.message.text
    try:
        spec_type_enum = next(st for st in SpecializationType if st.value == spec_type)
        context.user_data['specialization_type'] = spec_type_enum
        
        if spec_type_enum == SpecializationType.DOCTOR:
            # Создаем клавиатуру для выбора врачебной специализации
            keyboard = [[KeyboardButton(spec.value)] for spec in DoctorSpecialization]
            reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
            await update.message.reply_text(
                "🏥 Выберите вашу врачебную специализацию:",
                reply_markup=reply_markup
            )
            return DOCTOR_SPEC
        elif spec_type_enum == SpecializationType.OTHER:
            # Создаем клавиатуру для выбора другой специализации
            keyboard = [[KeyboardButton(spec.value)] for spec in OtherSpecialization]
            reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
            await update.message.reply_text(
                "🏥 Выберите вашу специализацию:",
                reply_markup=reply_markup
            )
            return OTHER_SPEC
        else:
            # Для фельдшеров сразу переходим к вопросу о загранпаспорте
            return await ask_foreign_passport(update, context)
            
    except StopIteration:
        await update.message.reply_text("⚠️ Пожалуйста, выберите тип специализации из предложенных вариантов")
        return SPEC_TYPE

async def process_doctor_spec(update: Update, context: ContextTypes.DEFAULT_TYPE):
    spec = update.message.text
    try:
        spec_enum = next(ds for ds in DoctorSpecialization if ds.value == spec)
        context.user_data['doctor_specialization'] = spec_enum
        return await ask_foreign_passport(update, context)
    except StopIteration:
        await update.message.reply_text("⚠️ Пожалуйста, выберите специализацию из предложенных вариантов")
        return DOCTOR_SPEC

async def process_other_spec(update: Update, context: ContextTypes.DEFAULT_TYPE):
    spec = update.message.text
    try:
        spec_enum = next(os for os in OtherSpecialization if os.value == spec)
        context.user_data['other_specialization'] = spec_enum
        return await ask_foreign_passport(update, context)
    except StopIteration:
        await update.message.reply_text("⚠️ Пожалуйста, выберите специализацию из предложенных вариантов")
        return OTHER_SPEC

async def ask_foreign_passport(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton("Да")],
        [KeyboardButton("Нет")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        "🛂 У вас есть загранпаспорт?",
        reply_markup=reply_markup
    )
    return FOREIGN_PASSPORT

async def process_foreign_passport(update: Update, context: ContextTypes.DEFAULT_TYPE):
    answer = update.message.text.lower()
    if answer not in ["да", "нет"]:
        await update.message.reply_text("⚠️ Пожалуйста, выберите 'Да' или 'Нет'")
        return FOREIGN_PASSPORT
    
    context.user_data['has_foreign_passport'] = (answer == "да")
    await update.message.reply_text(
        "📱 Укажите ваш контактный номер или никнейм в Telegram\n"
        "❗️ Убедитесь, что ваш профиль открыт для поиска!"
    )
    return CONTACT_INFO

async def process_contact_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['contact_info'] = update.message.text
    await update.message.reply_text(
        "📚 Расскажите о вашем опыте!\n"
        "Введите информацию о местах обучения и работы (максимум 2000 символов):"
    )
    return RESUME

async def process_resume(update: Update, context: ContextTypes.DEFAULT_TYPE):
    resume_text = update.message.text
    if len(resume_text) > 2000:
        await update.message.reply_text(
            "⚠️ Текст резюме слишком длинный! Пожалуйста, сократите его до 2000 символов."
        )
        return RESUME
    
    context.user_data['resume'] = resume_text
    
    with SessionLocal() as session:
        try:
            # Проверяем количество попыток еще раз перед сохранением
            attempts_count = session.query(User).filter(
                User.telegram_id == update.effective_user.id,
                User.registration_complete == True
            ).count()
            
            if attempts_count >= 2:
                await update.message.reply_text(
                    "❌ К сожалению, вы уже использовали максимальное количество попыток регистрации."
                )
                return ConversationHandler.END

            new_user = User(
                telegram_id=update.effective_user.id,
                full_name=context.user_data['full_name'],
                age=context.user_data['age'],
                height=context.user_data['height'],
                weight=context.user_data['weight'],
                has_chronic_diseases=context.user_data['has_chronic_diseases'],
                chronic_diseases_info=context.user_data.get('chronic_diseases_info'),
                has_travel_restrictions=context.user_data['has_travel_restrictions'],
                specialization_type=context.user_data['specialization_type'],
                doctor_specialization=context.user_data.get('doctor_specialization'),
                other_specialization=context.user_data.get('other_specialization'),
                has_foreign_passport=context.user_data['has_foreign_passport'],
                contact_info=context.user_data['contact_info'],
                resume=context.user_data['resume'],
                registration_complete=True,
                registration_attempts=attempts_count + 1,
                created_at=datetime.now()
            )
            
            session.add(new_user)
            session.commit()
            
            keyboard = [[KeyboardButton("Заполнить анкету заново")]]
            reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
            
            remaining_attempts = 2 - (attempts_count + 1)
            await update.message.reply_text(
                f"✅ Спасибо! Регистрация успешно завершена!\n\n"
                f"У вас осталось попыток: {remaining_attempts}\n"
                "Если вы хотите изменить данные, нажмите кнопку 'Заполнить анкету заново'",
                reply_markup=reply_markup
            )
            return ConversationHandler.END
            
        except Exception as e:
            session.rollback()
            print(f"Error saving user data: {e}")
            await update.message.reply_text(
                "❌ Произошла ошибка при сохранении данных. Пожалуйста, попробуйте позже."
            )
            return ConversationHandler.END

async def restart_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Проверяем общее количество попыток регистрации
    with SessionLocal() as session:
        attempts_count = session.query(User).filter(
            User.telegram_id == update.effective_user.id,
            User.registration_complete == True  # Учитываем только завершенные регистрации
        ).count()
        
        if attempts_count >= 2:
            await update.message.reply_text(
                "❌ К сожалению, вы уже использовали максимальное количество попыток регистрации."
            )
            return ConversationHandler.END
    
    await update.message.reply_text(
        "🔄 Хорошо, давайте заполним анкету заново!\n"
        "Пожалуйста, введите ваше ФИО:"
    )
    return FULL_NAME

async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "❌ Регистрация отменена.",
        reply_markup=ReplyKeyboardMarkup([[KeyboardButton("Заполнить анкету заново")]], 
                                       resize_keyboard=True)
    )
    return ConversationHandler.END 