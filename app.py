import os
import requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")
WEATHER_KEY = os.getenv("WEATHER_API_KEY")
BASE_TELEGRAM_URL = f"https://api.telegram.org/bot{TOKEN}/sendMessage"

def send_to_telegram(text):
    try:
        requests.post(BASE_TELEGRAM_URL, data={"chat_id": CHAT_ID, "text": text})
    except:
        print("Не вдалося надіслати повідомлення в Telegram")

def get_weather(city):
    url = "http://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": WEATHER_KEY, "units": "metric", "lang": "ua"}
    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        temp = data['main']['temp']
        desc = data['weather'][0]['description']
        humidity = data['main']['humidity']
        return f"Погода в {city}:\nТемпература: {temp}°C\nОпис: {desc}\nВологість: {humidity}%"
    except:
        return f"Не вдалося отримати погоду для '{city}'."

def get_currency(currency):
    url = f"https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode={currency.upper()}&json"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        if not data:
            return f"Не вдалося знайти курс для '{currency}'."
        rate = data[0]["rate"]
        return f"1 {currency.upper()} = {rate:.2f}₴"
    except:
        return f"Помилка отримання курсу для '{currency}'."

def translate_to_en(text):
    url = "https://api.mymemory.translated.net/get"
    params = {"q": text, "langpair": "uk|en"}
    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        return f"Переклад англійською:\n{data['responseData']['translatedText']}"
    except:
        return "Не вдалося виконати переклад."

def get_cat_fact():
    url = "https://catfact.ninja/fact"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        fact = r.json()["fact"]
        return f"Факт про котів: {fact}"
    except:
        return "Не вдалося отримати факт про котів."

def main():
    print("Команди:")
    print("/weather {місто}")
    print("/currency {валюта}")
    print("/translate_en {текст}")
    print("/catfact")
    print("/exit\n")

    while True:
        command = input("Введіть команду: ").strip()
        if command.startswith("/weather"):
            city = command.replace("/weather", "").strip()
            message = get_weather(city)
        elif command.startswith("/currency"):
            currency = command.replace("/currency", "").strip()
            message = get_currency(currency)
        elif command.startswith("/translate_en"):
            text = command.replace("/translate_en", "").strip()
            message = translate_to_en(text)
        elif command.startswith("/catfact"):
            message = get_cat_fact()
        elif command == "/exit":
            print("Вихід із програми...")
            break
        else:
            message = "Невідома команда."
        print(f"\n{message}\n")
        send_to_telegram(message)

if __name__ == "__main__":
    main()