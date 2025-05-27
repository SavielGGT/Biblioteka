#!/usr/bin/env python
import os
import sys

def main():
    """Запуск адміністративних команд Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Не вдалося імпортувати Django. Переконайтеся, що він встановлений."
        ) from exc

    print("⚙️ Сервер запускається...")  # ← діагностичний print
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
