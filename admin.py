import asyncio
import uvicorn
import multiprocessing
import logging
from backend.bot.bot import main as bot_main
import os
import sys
import signal
from dotenv import load_dotenv

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('admin.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

def run_bot():
    """Функция для запуска бота"""
    try:
        logger.info("🤖 Запуск телеграм бота...")
        bot_main()
    except Exception as e:
        logger.error(f"Ошибка в работе бота: {e}")
        raise

def run_api():
    """Функция для запуска FastAPI сервера"""
    try:
        logger.info("🚀 Запуск API сервера...")
        uvicorn.run(
            "backend.api.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=["backend"]
        )
    except Exception as e:
        logger.error(f"Ошибка в работе API сервера: {e}")
        raise

def check_environment():
    """Проверка наличия необходимых переменных окружения"""
    required_vars = ['BOT_TOKEN', 'ADMIN_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error("Отсутствуют необходимые переменные окружения:")
        for var in missing_vars:
            logger.error(f"   - {var}")
        sys.exit(1)

def main():
    try:
        logger.info("🔍 Проверка конфигурации...")
        check_environment()
        
        logger.info("🚀 Запуск админ-панели...")
        
        bot_process = multiprocessing.Process(target=run_bot)
        api_process = multiprocessing.Process(target=run_api)
        
        bot_process.start()
        api_process.start()
        
        bot_process.join()
        api_process.join()
        
    except KeyboardInterrupt:
        logger.info("\n⏹️ Получен сигнал остановки. Завершение работы...")
        if bot_process.is_alive():
            bot_process.terminate()
            bot_process.join()
        if api_process.is_alive():
            api_process.terminate()
            api_process.join()
        logger.info("✅ Все процессы успешно остановлены")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 