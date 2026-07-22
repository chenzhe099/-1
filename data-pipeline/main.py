"""
智慧农业数据管道
定时采集天气、市场价格数据，写入 MySQL
"""
import schedule
import time
import logging
from fetchers.weather_fetcher import WeatherFetcher
from fetchers.market_fetcher import MarketFetcher

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(message)s')
logger = logging.getLogger('data-pipeline')

weather_fetcher = WeatherFetcher()
market_fetcher = MarketFetcher()


def fetch_weather():
    """采集天气数据"""
    logger.info("Fetching weather data...")
    try:
        count = weather_fetcher.fetch_and_store()
        logger.info(f"Weather: {count} records inserted")
    except Exception as e:
        logger.error(f"Weather fetch failed: {e}")


def fetch_market():
    """采集市场价格数据"""
    logger.info("Fetching market prices...")
    try:
        count = market_fetcher.fetch_and_store()
        logger.info(f"Market: {count} records inserted")
    except Exception as e:
        logger.error(f"Market fetch failed: {e}")


def main():
    logger.info("SmartFarm Data Pipeline started")

    # 启动时立即执行一次
    fetch_weather()
    fetch_market()

    # 定时任务
    schedule.every(6).hours.do(fetch_weather)
    schedule.every().day.at("08:00").do(fetch_market)

    logger.info("Scheduler configured: weather every 6h, market daily at 08:00")

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == '__main__':
    main()
