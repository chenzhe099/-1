"""
多 Agent 协同决策服务
- 生产模式：调用 LLM 进行深度推理分析
- Mock 模式：使用规则引擎作为降级方案
"""
import json
import logging
import random
from typing import Optional

from services.llm_client import llm_client

logger = logging.getLogger(__name__)

# ==================== 系统提示词 ====================

AGENT_SYSTEM_PROMPT = """你是一个专业的智慧农业多Agent决策系统。你需要综合天气、土壤、病虫害风险、市场四个维度，为农场主提供精准的农事决策建议。

## 你的四个子Agent：
1. **天气Agent** — 分析天气对灌溉、喷药、施肥等农事活动的影响
2. **土壤Agent** — 根据土壤湿度、N/P/K含量，给出灌溉和施肥建议
3. **病虫害Agent** — 评估病虫害风险，给出预防和防治建议
4. **市场Agent** — 分析市场行情，给出采收和销售建议

## 输出格式：
{
    "recommendations": [
        {"type": "weather|irrigation|fertilization|pest_alert|market", "action": "具体建议", "reason": "分析依据"}
    ],
    "riskLevel": "low|medium|high",
    "summary": "总体农事建议摘要"
}

## 注意：
- 建议要具体可操作，包含量化数据（如灌溉量、施肥量）
- 风险等级根据最严重的建议确定
- 如果有高风险项，要特别强调"""


class AgentService:
    """多 Agent 农事决策引擎 — LLM 驱动 + 规则引擎降级"""

    # ==================== 规则引擎 (Mock 降级) ====================

    CROP_STAGES = {
        "番茄": ["苗期", "开花期", "结果期", "成熟期"],
        "黄瓜": ["苗期", "伸蔓期", "开花结果期", "采收期"],
        "辣椒": ["苗期", "开花期", "结果期", "成熟期"],
        "草莓": ["苗期", "开花期", "结果期", "采收期"],
        "茄子": ["苗期", "开花期", "结果期", "成熟期"],
    }

    def _weather_agent(self, weather: Optional[dict]) -> list:
        """天气 Agent (规则)"""
        advices = []
        if weather:
            rainfall = weather.get("rainfall_mm", 0)
            temp_high = weather.get("temperatureHigh", 30)
            temp_low = weather.get("temperatureLow", 0)
            wind_speed = weather.get("windSpeed", 0)
            if rainfall > 5:
                advices.append({
                    "type": "weather", "severity": "info",
                    "message": f"预计降雨{rainfall}mm，建议推迟灌溉和喷药作业"
                })
            if temp_high > 32:
                advices.append({
                    "type": "weather", "severity": "warning",
                    "message": f"高温预警: 最高温{temp_high}°C，注意遮阳降温"
                })
            if temp_low < 2:
                advices.append({
                    "type": "weather", "severity": "critical",
                    "message": f"霜冻预警: 最低温{temp_low}°C，立即采取防寒措施"
                })
            if wind_speed > 30:
                advices.append({
                    "type": "weather", "severity": "warning",
                    "message": f"大风预警: 风速{wind_speed}km/h，检查大棚设施"
                })
        if not advices:
            advices.append({
                "type": "weather", "severity": "info",
                "message": "暂无天气数据，建议关注当地气象预报"
            })
        return advices

    def _soil_agent(self, soil: Optional[dict], stage: Optional[str]) -> list:
        """土壤 Agent (规则)"""
        advices = []
        if soil:
            moisture = soil.get("moisture", 60)
            if moisture < 40:
                advices.append({
                    "type": "irrigation", "severity": "critical",
                    "message": f"土壤严重缺水: 湿度{moisture}%，需立即灌溉"
                })
            elif moisture < 55:
                advices.append({
                    "type": "irrigation", "severity": "warning",
                    "message": f"土壤湿度偏低: {moisture}%，建议近期灌溉，目标湿度65%"
                })
            n = soil.get("nLevel", 80)
            p = soil.get("pLevel", 80)
            k = soil.get("kLevel", 80)
            if k < 70 and stage in ["开花期", "结果期", "开花结果期"]:
                advices.append({
                    "type": "fertilization", "severity": "warning",
                    "message": f"钾含量偏低({k})，果期需要追施钾肥10-15kg/亩"
                })
            if n < 60 and stage in ["苗期", "伸蔓期"]:
                advices.append({
                    "type": "fertilization", "severity": "info",
                    "message": f"氮含量偏低({n})，生长期建议追施氮肥"
                })
        if not advices:
            advices.append({
                "type": "soil", "severity": "info",
                "message": "暂无土壤数据，建议进行土壤检测"
            })
        return advices

    def _pest_agent(self, weather: Optional[dict], stage: Optional[str], crop_name: str) -> list:
        """病虫害 Agent (规则)"""
        advices = []
        if weather:
            humidity = weather.get("humidity", 60)
            temp = weather.get("temperatureHigh", 25)
            if humidity > 75 and temp > 22:
                advices.append({
                    "type": "pest_alert", "severity": "warning",
                    "message": f"高温高湿(温度{temp}°C/湿度{humidity}%)有利于真菌病害发生，建议预防性喷药"
                })
            if humidity < 30:
                advices.append({
                    "type": "pest_alert", "severity": "warning",
                    "message": f"空气干燥(湿度{humidity}%)，注意防治红蜘蛛和蚜虫"
                })
        if stage in ["开花期", "结果期", "开花结果期"]:
            advices.append({
                "type": "pest_alert", "severity": "info",
                "message": f"{crop_name}{stage}是病虫害高发期，建议每3天巡查一次"
            })
        if not advices:
            advices.append({
                "type": "pest_alert", "severity": "info",
                "message": "当前病虫害风险较低，常规巡查即可"
            })
        return advices

    def _market_agent(self, crop_name: str) -> list:
        """市场 Agent (规则)"""
        price_trends = {"番茄": "上涨", "黄瓜": "稳定", "辣椒": "上涨", "草莓": "上涨", "茄子": "稳定"}
        trend = price_trends.get(crop_name, "稳定")
        if trend == "上涨":
            return [{"type": "market", "severity": "info",
                     "message": f"{crop_name}近期价格呈上涨趋势(+5%)，近成熟期的作物可考虑适时采收上市"}]
        return [{"type": "market", "severity": "info",
                 "message": f"{crop_name}市场价格稳定，按计划安排采收即可"}]

    def _build_llm_prompt(self, params: dict) -> str:
        """构建 LLM 分析提示词"""
        weather = params.get("weatherForecast", {})
        soil = params.get("soilData", {})
        stage = params.get("currentStage", "结果期")
        crop_name = params.get("cropName", "番茄")

        prompt_parts = [f"## 当前农场状态\n"]
        prompt_parts.append(f"- 作物: {crop_name}")
        prompt_parts.append(f"- 生长阶段: {stage}")

        if weather:
            prompt_parts.append(f"\n### 天气预报")
            for k, v in weather.items():
                prompt_parts.append(f"- {k}: {v}")

        if soil:
            prompt_parts.append(f"\n### 土壤数据")
            for k, v in soil.items():
                prompt_parts.append(f"- {k}: {v}")

        prompt_parts.append(f"\n请基于以上数据，综合四个Agent维度给出农事决策建议。")
        return "\n".join(prompt_parts)

    def _rules_decision(self, params: dict) -> dict:
        """规则引擎决策 (降级方案)"""
        weather = params.get("weatherForecast", {})
        soil = params.get("soilData", {})
        stage = params.get("currentStage", "结果期")
        crop_name = params.get("cropName", "番茄")

        weather_advices = self._weather_agent(weather)
        soil_advices = self._soil_agent(soil, stage)
        pest_advices = self._pest_agent(weather, stage, crop_name)
        market_advices = self._market_agent(crop_name)

        all_advices = weather_advices + soil_advices + pest_advices + market_advices

        recommendations = []
        for adv in all_advices:
            type_map = {
                "weather": "气象数据", "irrigation": "土壤数据", "fertilization": "土壤数据",
                "soil": "土壤数据", "pest_alert": "病虫害风险评估", "market": "市场行情分析"
            }
            recommendations.append({
                "type": adv["type"],
                "action": adv["message"],
                "reason": f"[{adv['type']}] 基于{type_map.get(adv['type'], '综合')}分析"
            })

        severities = [a["severity"] for a in all_advices]
        if "critical" in severities:
            risk_level = "high"
        elif severities.count("warning") >= 2:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "recommendations": recommendations,
            "riskLevel": risk_level,
            "confidence": round(random.uniform(0.80, 0.95), 3),
            "agentDetails": {
                "weatherAgent": weather_advices,
                "soilAgent": soil_advices,
                "pestAgent": pest_advices,
                "marketAgent": market_advices,
            },
            "mode": "rules",
        }

    # ==================== 对外接口 ====================

    def make_decision(self, params: dict) -> dict:
        """
        综合多 Agent 建议，生成农事决策

        优先使用 LLM 推理，不可用时降级到规则引擎
        """
        # === 尝试 LLM 推理 ===
        if llm_client.available:
            try:
                user_prompt = self._build_llm_prompt(params)
                result = llm_client.chat_json(
                    messages=[{"role": "user", "content": user_prompt}],
                    system_prompt=AGENT_SYSTEM_PROMPT,
                    temperature=0.3,
                )
                if result:
                    # 补充字段
                    result.setdefault("confidence", round(random.uniform(0.85, 0.98), 3))
                    result.setdefault("riskLevel", "medium")
                    result["mode"] = "llm"
                    result["agentDetails"] = {"engine": "LLM (DeepSeek)"}
                    logger.info(f"LLM Agent决策成功，风险等级: {result.get('riskLevel')}")
                    return result
            except Exception as e:
                logger.error(f"LLM Agent决策失败，降级到规则引擎: {e}")

        # === 降级到规则引擎 ===
        logger.info("使用规则引擎进行Agent决策")
        return self._rules_decision(params)
