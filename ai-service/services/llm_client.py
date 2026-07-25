"""
统一 LLM 客户端
支持 OpenAI 兼容接口 (DeepSeek / GPT-4o / Qwen / GLM 等)
自动降级到 Mock 模式
"""
import json
import logging
from typing import Optional, List, Dict, Any

from config import (
    MOCK_MODE, DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, DEEPSEEK_TIMEOUT,
)

logger = logging.getLogger(__name__)


class LLMClient:
    """统一 LLM 客户端 — OpenAI 兼容接口"""

    def __init__(self):
        self._client = None
        self._model = DEEPSEEK_MODEL
        self._available = False
        self._init_client()

    def _init_client(self):
        """初始化 OpenAI 兼容客户端"""
        if MOCK_MODE or not DEEPSEEK_API_KEY:
            logger.info("Mock 模式或未配置 API Key，LLM 将使用本地规则引擎")
            return

        try:
            from openai import OpenAI
            self._client = OpenAI(
                api_key=DEEPSEEK_API_KEY,
                base_url=DEEPSEEK_BASE_URL,
                timeout=DEEPSEEK_TIMEOUT,
            )
            self._available = True
            logger.info(f"LLM 客户端初始化成功，模型: {DEEPSEEK_MODEL}, 端点: {DEEPSEEK_BASE_URL}")
        except ImportError:
            logger.warning("openai 包未安装，LLM 功能不可用。安装: pip install openai")
        except Exception as e:
            logger.error(f"LLM 客户端初始化失败: {e}")

    @property
    def available(self) -> bool:
        return self._available and self._client is not None

    def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[dict] = None,
    ) -> Optional[str]:
        """
        发送对话请求

        Args:
            messages: 对话消息列表 [{"role": "user", "content": "..."}]
            system_prompt: 系统提示词（可选）
            temperature: 温度参数 (0-2)
            max_tokens: 最大输出 token 数
            response_format: 响应格式 {"type": "json_object"} 强制返回 JSON

        Returns:
            LLM 响应文本，失败返回 None
        """
        if not self.available:
            logger.warning("LLM 不可用，返回 None")
            return None

        # 构建完整消息列表
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        try:
            kwargs = {
                "model": self._model,
                "messages": full_messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if response_format:
                kwargs["response_format"] = response_format

            response = self._client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content.strip()
            logger.info(f"LLM 响应 ({len(content)} chars): {content[:200]}...")
            return content

        except Exception as e:
            logger.error(f"LLM 调用失败: {e}")
            return None

    def chat_json(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Optional[dict]:
        """
        发送对话请求并解析 JSON 响应

        Args:
            messages: 对话消息列表
            system_prompt: 系统提示词
            temperature: 温度参数

        Returns:
            解析后的 dict，失败返回 None
        """
        # 在 system_prompt 中追加 JSON 格式要求
        json_hint = "\n请严格返回 JSON 格式，不要包含 markdown 代码块标记。"
        if system_prompt:
            system_prompt = system_prompt + json_hint
        else:
            system_prompt = "请严格返回 JSON 格式，不要包含 markdown 代码块标记。"

        raw = self.chat(
            messages=messages,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format={"type": "json_object"},
        )

        if raw is None:
            return None

        # 解析 JSON
        return self._parse_json(raw)

    def _parse_json(self, text: str) -> Optional[dict]:
        """解析 LLM 返回的 JSON"""
        text = text.strip()
        # 去除 markdown 代码块
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # 尝试提取 JSON 子串
            import re
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
            logger.warning(f"无法解析 LLM 响应为 JSON: {text[:200]}")
            return None


# 全局单例
llm_client = LLMClient()
