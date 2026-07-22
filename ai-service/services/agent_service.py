"""
多 Agent 协同决策服务
模拟四个子 Agent 分别从天气、土壤、病虫害风险、市场角度分析，综合给出农事建议
"""
import random
from typing import Optional


class AgentService:
    """多 Agent 农事决策引擎"""

    # 作物生长阶段参考数据
    CROP_STAGES = {
        "番茄": ["苗期", "开花期", "结果期", "成熟期"],
        "黄瓜": ["苗期", "伸蔓期", "开花结果期", "采收期"],
        "辣椒": ["苗期", "开花期", "结果期", "成熟期"],
        "草莓": ["苗期", "开花期", "结果期", "采收期"],
        "茄子": ["苗期", "开花期", "结果期", "成熟期"],
    }

    # 灌溉建议规则
    IRRIGATION_RULES = [
        (lambda w, s: w and w.get("rainfall_mm", 0) > 5,
         "建议推迟灌溉", "预计未来48小时有降雨，降雨量约{w[rainfall_mm]}mm"),
        (lambda w, s: s and s.get("moisture", 100) < 45,
         "建议立即灌溉", "当前土壤湿度{s[moisture]}%低于阈值45%"),
        (lambda w, s: s and s.get("moisture", 100) < 60,
         "建议适量灌溉", "当前土壤湿度{s[moisture]}%，建议补水至65%"),
    ]

    # 施肥建议规则
    FERTILIZATION_RULES = [
        (lambda stage: stage in ["开花期", "结果期"],
         "建议追施钾肥", "果实发育期需补充钾元素，建议追施钾肥10-15kg/亩"),
        (lambda stage: stage in ["苗期", "伸蔓期"],
         "建议追施氮肥", "营养生长期需补充氮元素，促进叶片生长"),
        (lambda stage: stage == "成熟期",
         "建议停止氮肥", "成熟期过量氮肥会延迟成熟，降低品质"),
    ]

    # 病虫害风险规则
    PEST_RISK_RULES = [
        (lambda w: w and w.get("humidity", 0) > 80 and w.get("temperatureHigh", 0) > 25,
         "加强白粉病巡查", "当前高温高湿条件有利于白粉病发生，建议每3天巡查一次"),
        (lambda w: w and w.get("temperatureLow", 0) < 5,
         "注意霜冻防护", "低温天气可能导致霜冻，建议覆盖地膜或大棚保温"),
        (lambda stage: stage in ["开花期", "结果期"],
         "加强蚜虫监控", "开花结果期蚜虫易发，建议悬挂黄板监测"),
    ]

    # 市场建议规则
    MARKET_RULES = [
        (lambda crop: crop in ["番茄", "草莓"],
         "关注市场行情", "近期{crop}价格呈上涨趋势，可适时采收上市"),
        (lambda crop: crop in ["黄瓜", "辣椒"],
         "合理安排采收", "{crop}市场价格相对稳定，建议按计划采收"),
    ]

    def __init__(self):
        pass

    def _weather_agent(self, weather: Optional[dict]) -> list:
        """天气 Agent: 分析天气对农事的影响"""
        advices = []
        if weather:
            if weather.get("rainfall_mm", 0) > 5:
                advices.append({
                    "type": "weather",
                    "severity": "info",
                    "message": f"预计降雨{weather['rainfall_mm']}mm，建议推迟灌溉和喷药作业"
                })
            if weather.get("temperatureHigh", 30) > 32:
                advices.append({
                    "type": "weather",
                    "severity": "warning",
                    "message": f"高温预警: 最高温{weather['temperatureHigh']}°C，注意遮阳降温"
                })
            if weather.get("temperatureLow", 0) < 2:
                advices.append({
                    "type": "weather",
                    "severity": "critical",
                    "message": f"霜冻预警: 最低温{weather['temperatureLow']}°C，立即采取防寒措施"
                })
            if weather.get("windSpeed", 0) > 30:
                advices.append({
                    "type": "weather",
                    "severity": "warning",
                    "message": f"大风预警: 风速{weather['windSpeed']}km/h，检查大棚设施"
                })
        else:
            advices.append({
                "type": "weather",
                "severity": "info",
                "message": "暂无天气数据，建议关注当地气象预报"
            })
        return advices

    def _soil_agent(self, soil: Optional[dict], stage: Optional[str]) -> list:
        """土壤 Agent: 分析土壤状况并给灌溉施肥建议"""
        advices = []
        if soil:
            moisture = soil.get("moisture", 60)
            if moisture < 40:
                advices.append({
                    "type": "irrigation",
                    "severity": "critical",
                    "message": f"土壤严重缺水: 湿度{moisture}%，需立即灌溉"
                })
            elif moisture < 55:
                advices.append({
                    "type": "irrigation",
                    "severity": "warning",
                    "message": f"土壤湿度偏低: {moisture}%，建议近期灌溉，目标湿度65%"
                })

            n = soil.get("nLevel", 80)
            p = soil.get("pLevel", 80)
            k = soil.get("kLevel", 80)

            if k < 70 and stage in ["开花期", "结果期", "开花结果期"]:
                advices.append({
                    "type": "fertilization",
                    "severity": "warning",
                    "message": f"钾含量偏低({k})，果期需要追施钾肥10-15kg/亩"
                })
            if n < 60 and stage in ["苗期", "伸蔓期"]:
                advices.append({
                    "type": "fertilization",
                    "severity": "info",
                    "message": f"氮含量偏低({n})，生长期建议追施氮肥"
                })
        else:
            advices.append({
                "type": "soil",
                "severity": "info",
                "message": "暂无土壤数据，建议进行土壤检测"
            })
        return advices

    def _pest_agent(self, weather: Optional[dict], stage: Optional[str], crop_name: str) -> list:
        """病虫害 Agent: 评估病虫害风险"""
        advices = []
        high_risk = False

        if weather:
            humidity = weather.get("humidity", 60)
            temp = weather.get("temperatureHigh", 25)

            if humidity > 75 and temp > 22:
                high_risk = True
                advices.append({
                    "type": "pest_alert",
                    "severity": "warning",
                    "message": f"高温高湿(温度{temp}°C/湿度{humidity}%)有利于真菌病害发生，建议预防性喷药"
                })
            if humidity < 30:
                advices.append({
                    "type": "pest_alert",
                    "severity": "warning",
                    "message": f"空气干燥(湿度{humidity}%)，注意防治红蜘蛛和蚜虫"
                })

        if stage in ["开花期", "结果期", "开花结果期"]:
            advices.append({
                "type": "pest_alert",
                "severity": "info",
                "message": f"{crop_name}{stage}是病虫害高发期，建议每3天巡查一次"
            })

        if not high_risk and not advices:
            advices.append({
                "type": "pest_alert",
                "severity": "info",
                "message": "当前病虫害风险较低，常规巡查即可"
            })

        return advices

    def _market_agent(self, crop_name: str) -> list:
        """市场 Agent: 分析市场行情"""
        advices = []
        price_trends = {
            "番茄": "上涨", "黄瓜": "稳定", "辣椒": "上涨",
            "草莓": "上涨", "茄子": "稳定"
        }

        trend = price_trends.get(crop_name, "稳定")
        if trend == "上涨":
            advices.append({
                "type": "market",
                "severity": "info",
                "message": f"{crop_name}近期价格呈上涨趋势(+5%)，近成熟期的作物可考虑适时采收上市"
            })
        else:
            advices.append({
                "type": "market",
                "severity": "info",
                "message": f"{crop_name}市场价格稳定，按计划安排采收即可"
            })

        return advices

    def make_decision(self, params: dict) -> dict:
        """
        综合多 Agent 建议，生成农事决策

        Args:
            params: {
                fieldId: str,
                cropId: Optional[str],
                cropName: Optional[str],
                currentStage: Optional[str],
                weatherForecast: Optional[dict],
                soilData: Optional[dict],
            }

        Returns:
            dict: 综合决策结果
        """
        weather = params.get("weatherForecast", {})
        soil = params.get("soilData", {})
        stage = params.get("currentStage", "结果期")
        crop_name = params.get("cropName", "番茄")

        # 各 Agent 独立分析
        weather_advices = self._weather_agent(weather)
        soil_advices = self._soil_agent(soil, stage)
        pest_advices = self._pest_agent(weather, stage, crop_name)
        market_advices = self._market_agent(crop_name)

        all_advices = weather_advices + soil_advices + pest_advices + market_advices

        # 生成结构化建议
        recommendations = []
        for adv in all_advices:
            recommendations.append({
                "type": adv["type"],
                "action": adv["message"],
                "reason": f"[{adv['type']}] 基于{'气象数据' if adv['type'] == 'weather' else '土壤数据' if adv['type'] in ('irrigation', 'fertilization', 'soil') else '病虫害风险评估' if adv['type'] == 'pest_alert' else '市场行情分析'}分析"
            })

        # 计算风险等级
        severities = [a["severity"] for a in all_advices]
        if "critical" in severities:
            risk_level = "high"
        elif severities.count("warning") >= 2:
            risk_level = "medium"
        else:
            risk_level = "low"

        confidence = random.uniform(0.80, 0.95)

        return {
            "recommendations": recommendations,
            "riskLevel": risk_level,
            "confidence": round(confidence, 3),
            "agentDetails": {
                "weatherAgent": weather_advices,
                "soilAgent": soil_advices,
                "pestAgent": pest_advices,
                "marketAgent": market_advices,
            }
        }
