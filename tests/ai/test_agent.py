"""多 Agent 决策服务测试"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'ai-service'))

from services.agent_service import AgentService


def test_agent_init():
    """测试 Agent 初始化"""
    agent = AgentService()
    assert agent is not None


def test_make_decision_basic():
    """测试基本决策"""
    agent = AgentService()
    params = {
        "fieldId": "field_a1",
        "cropName": "番茄",
        "currentStage": "结果期",
        "weatherForecast": {"temperatureHigh": 28, "temperatureLow": 18, "humidity": 75, "rainfall_mm": 3},
        "soilData": {"moisture": 55, "nLevel": 75, "pLevel": 80, "kLevel": 65},
    }
    result = agent.make_decision(params)
    assert "recommendations" in result
    assert "riskLevel" in result
    assert "confidence" in result
    assert len(result["recommendations"]) > 0


def test_make_decision_high_risk():
    """测试高风险场景"""
    agent = AgentService()
    params = {
        "fieldId": "field_b1",
        "cropName": "辣椒",
        "currentStage": "开花期",
        "weatherForecast": {"temperatureHigh": 34, "temperatureLow": 26, "humidity": 85, "rainfall_mm": 0},
        "soilData": {"moisture": 35, "nLevel": 50, "pLevel": 70, "kLevel": 45},
    }
    result = agent.make_decision(params)
    assert result["riskLevel"] in ["high", "medium"]


def test_agent_details():
    """测试子 Agent 详情"""
    agent = AgentService()
    params = {
        "fieldId": "field_c1",
        "cropName": "草莓",
        "currentStage": "采收期",
        "weatherForecast": {"temperatureHigh": 22, "temperatureLow": 10, "humidity": 60, "rainfall_mm": 0},
        "soilData": {"moisture": 65, "nLevel": 80, "pLevel": 82, "kLevel": 78},
    }
    result = agent.make_decision(params)
    assert "agentDetails" in result
    assert "weatherAgent" in result["agentDetails"]
    assert "soilAgent" in result["agentDetails"]
    assert "pestAgent" in result["agentDetails"]
    assert "marketAgent" in result["agentDetails"]


if __name__ == '__main__':
    test_agent_init()
    test_make_decision_basic()
    test_make_decision_high_risk()
    test_agent_details()
    print("All Agent tests passed!")
