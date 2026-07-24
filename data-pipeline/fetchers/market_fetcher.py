"""
市场价格采集器 (Mock 模式: 生成随机游走价格数据)
"""
import random
import uuid
from datetime import datetime, timedelta
from config import MOCK_MODE


class MarketFetcher:
    """农产品市场价格采集"""

    # 基础价格参考 (元/kg)
    BASE_PRICES = {
        "番茄": 4.50, "黄瓜": 3.20, "辣椒": 6.80,
        "草莓": 25.00, "茄子": 3.50, "玉米": 2.80,
    }

    MARKETS = ["昆明呈贡批发市场", "大理古城菜市场", "玉溪通海批发市场", "曲靖农产品交易中心"]

    def _generate_mock_data(self):
        """生成模拟价格数据 (随机游走)"""
        records = []
        today = datetime.now().strftime("%Y-%m-%d")

        for crop_name, base_price in self.BASE_PRICES.items():
            for market in self.MARKETS:
                change_pct = random.uniform(-0.05, 0.05)
                price = round(base_price * (1 + change_pct), 2)
                trend = "up" if change_pct > 0.01 else "down" if change_pct < -0.01 else "stable"

                records.append({
                    "id": f"mp_{crop_name}_{market}_{today}".replace(" ", "_"),
                    "cropName": crop_name,
                    "pricePerKg": price,
                    "unit": "元/kg",
                    "market": market,
                    "date": today,
                    "changePercent": round(change_pct * 100, 2),
                    "trend": trend,
                })

                # 更新基础价格 (模拟价格波动)
                self.BASE_PRICES[crop_name] = price

        return records

    def fetch_and_store(self):
        """采集数据并存入数据库"""
        records = self._generate_mock_data()

        if MOCK_MODE:
            print(f"[MarketFetcher] Mock mode: generated {len(records)} records")
            for r in records[:5]:
                print(f"  {r['cropName']} @ {r['market']}: ¥{r['pricePerKg']}/kg ({r['trend']})")
            if len(records) > 5:
                print(f"  ... and {len(records) - 5} more")
            return len(records)

        # 正式模式: 写入 MySQL
        try:
            from db.connection import get_connection
            conn = get_connection()
            cursor = conn.cursor()
            for r in records:
                cursor.execute(
                    """INSERT INTO market_prices (id, cropName, pricePerKg, unit, market, date, changePercent, trend)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                       ON DUPLICATE KEY UPDATE pricePerKg=VALUES(pricePerKg), changePercent=VALUES(changePercent)""",
                    (r["id"], r["cropName"], r["pricePerKg"], r["unit"], r["market"],
                     r["date"], r["changePercent"], r["trend"])
                )
            conn.commit()
            conn.close()
            return len(records)
        except Exception as e:
            print(f"[MarketFetcher] DB error: {e}")
            return 0


if __name__ == '__main__':
    fetcher = MarketFetcher()
    fetcher.fetch_and_store()
