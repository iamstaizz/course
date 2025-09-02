import json
import random
import string
import time
import hashlib
from functools import wraps

# Завантажуємо дані користувачів з JSON
with open("users.json", "r", encoding="utf-8") as f:
    users = json.load(f)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def logging_before(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"CALLING {func.__name__}: ARGS={args}, KWARGS={kwargs}")
        return func(*args, **kwargs)
    return wrapper


def logging_after(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"PROCESSED {func.__name__}: RESULT={result}")
        return result
    return wrapper


def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"TIMER LOG: {func.__name__} took {end - start:.6f} seconds")
        return result
    return wrapper


def access_required(role):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            name = input("Введіть ваше ім’я: ")
            password = input("Введіть ваш пароль: ")

            user = next((u for u in users if u["name"] == name), None)
            if not user:
                raise PermissionError("Користувача не знайдено")

            if user.get("password") != hash_password(password):
                raise PermissionError("Неправильний пароль")

            if user["access_right"] != role:
                raise PermissionError("Недостатньо прав доступу")

            return func(*args, **kwargs)
        return wrapper
    return decorator


def sort_result(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        if isinstance(result, list):
            return sorted(result)
        return result
    return wrapper


@access_required("admin")
@sort_result
@timer
@logging_before
@logging_after
def get_shuffled_alphabet():
    letters = list(string.ascii_lowercase)
    random.shuffle(letters)
    return letters


if __name__ == "__main__":
    try:
        print(get_shuffled_alphabet())
    except PermissionError as e:
        print(f"Помилка доступу: {e}")
