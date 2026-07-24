"""
天气数据采集器 (Mock 模式: 生成云南地区气候模拟数据)
"""
import random
import uuid
from datetime import datetime, timedelta
from config import MOCK_MODE


class WeatherFetcher:
    """天气数据采集"""

    # 云南昆明气候特征参考值
    YUNNAN_CLIMATE = {
        (1, 2, 12):   {"temp_high": (14, 18), "temp_low": (2, 6), "humidity": (55, 70), "rain": (0, 5), "wind": (5, 15)},
        (3, 4):       {"temp_high": (20, 26), "temp_low": (8, 13), "humidity": (50, 65), "rain": (0, 15), "wind": (8, 20)},
        (5, 6, 7, 8): {"temp_high": (24, 30), "temp_low": (15, 19), "humidity": (60, 80), "rain": (0, 25), "wind": (5, 18)},
        (9, 10, 11):  {"temp_high": (20, 25), "temp_low": (10, 15), "humidity": (55, 75), "rain": (0, 15), "wind": (6, 18)},
    }

    CONDITIONS = ["晴", "多云", "阴", "小雨", "中雨", "阵雨"]

    def _get_climate(self, month):
        for months, climate in self.YUNNAN_CLIMATE.items():
            if month in months:
                return climate
        return {"temp_high": (20, 25), "temp_low": (10, 15), "humidity": (55, 70), "rain": (0, 10), "wind": (5, 15)}

    def _generate_mock_data(self, days=7):
        """生成模拟天气数据"""
        records = []
        today = datetime.now()

        for i in range(days):
            date = today + timedelta(days=i - days + 1)
            month = date.month
            climate = self._get_climate(month)

            temp_high = random.randint(*climate["temp_high"])
            temp_low = random.randint(*climate["temp_low"])
            humidity = random.randint(*climate["humidity"])
            rainfall = round(random.uniform(*climate["rain"]), 1)
            wind_speed = round(random.uniform(*climate["wind"]), 1)
            condition = random.choice(self.CONDITIONS)

            if rainfall > 10:
                condition = random.choice(["中雨", "阵雨"])
            elif rainfall > 5:
                condition = "小雨"
            elif humidity < 40:
                condition = "晴"

            records.append({
                "id": f"wr_{date.strftime('%Y%m%d')}",
                "date": date.strftime("%Y-%m-%d"),
                "temperatureHigh": temp_high,
                "temperatureLow": temp_low,
                "humidity": humidity,
                "rainfall_mm": rainfall,
                "windSpeed": wind_speed,
                "condition": condition,
                "forecast": f"{condition}，{temp_low}°C~{temp_high}°C，湿度{humidity}%，风速{wind_speed}km/h",
            })

        return records

    def fetch_and_store(self):
        """采集数据并存入数据库"""
        records = self._generate_mock_data(7)

        if MOCK_MODE:
            # Mock 模式: 只打印日志，不写入数据库
            print(f"[WeatherFetcher] Mock mode: generated {len(records)} records")
            for r in records:
                print(f"  {r['date']}: {r['condition']} {r['temperatureLow']}~{r['temperatureHigh']}°C "
                      f"降雨{r['rainfall_mm']}mm 湿度{r['humidity']}%")
            return len(records)

        # 正式模式: 写入 MySQL
        try:
            from db.connection import get_connection
            conn = get_connection()
            cursor = conn.cursor()
            for r in records:
                cursor.execute(
                    """INSERT INTO weather_records (id, date, temperatureHigh, temperatureLow, humidity,
                       rainfall_mm, windSpeed, `condition`, forecast)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                       ON DUPLICATE KEY UPDATE temperatureHigh=VALUES(temperatureHigh),
                       temperatureLow=VALUES(temperatureLow), humidity=VALUES(humidity)""",
                    (r["id"], r["date"], r["temperatureHigh"], r["temperatureLow"],
                     r["humidity"], r["rainfall_mm"], r["windSpeed"], r["condition"], r["forecast"])
                )
            conn.commit()
            conn.close()
            return len(records)
        except Exception as e:
            print(f"[WeatherFetcher] DB error: {e}")
            return 0


if __name__ == '__main__':
    fetcher = WeatherFetcher()
    fetcher.fetch_and_store()
