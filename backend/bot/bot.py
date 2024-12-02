import os
import logging
from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ConversationHandler
from .handlers import (
    start_command, cancel_command, restart_command,
    process_full_name, process_age, process_height, process_weight,
    process_chronic_diseases, process_chronic_diseases_info,
    process_travel_restrictions, process_spec_type, 
    process_doctor_spec, process_other_spec,
    process_foreign_passport, process_contact_info, process_resume,
    FULL_NAME, AGE, HEIGHT, WEIGHT, CHRONIC_DISEASES, CHRONIC_DISEASES_INFO,
    TRAVEL_RESTRICTIONS, SPEC_TYPE, DOCTOR_SPEC, OTHER_SPEC,
    FOREIGN_PASSPORT, CONTACT_INFO, RESUME
)

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

def create_bot():
    try:
        application = Application.builder().token(os.getenv('BOT_TOKEN')).build()
        logger.info("Бот успешно инициализирован")
        
        conv_handler = ConversationHandler(
            entry_points=[
                CommandHandler("start", start_command),
                MessageHandler(filters.Regex("^Заполнить анкету заново$"), restart_command)
            ],
            states={
                FULL_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_full_name)],
                AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_age)],
                HEIGHT: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_height)],
                WEIGHT: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_weight)],
                CHRONIC_DISEASES: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_chronic_diseases)],
                CHRONIC_DISEASES_INFO: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_chronic_diseases_info)],
                TRAVEL_RESTRICTIONS: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_travel_restrictions)],
                SPEC_TYPE: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_spec_type)],
                DOCTOR_SPEC: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_doctor_spec)],
                OTHER_SPEC: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_other_spec)],
                FOREIGN_PASSPORT: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_foreign_passport)],
                CONTACT_INFO: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_contact_info)],
                RESUME: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_resume)],
            },
            fallbacks=[
                CommandHandler("cancel", cancel_command),
                MessageHandler(filters.Regex("^Заполнить анкету заново$"), restart_command)
            ],
        )
        application.add_handler(conv_handler)
        return application
    except Exception as e:
        logger.error(f"Ошибка при создании бота: {e}")
        raise

def main():
    try:
        app = create_bot()
        logger.info("Бот запущен и готов к работе")
        app.run_polling()
    except Exception as e:
        logger.error(f"Критическая ошибка в работе бота: {e}")
        raise

if __name__ == '__main__':
    main() 