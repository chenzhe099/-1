"""
AI 智能对话路由
提供农业知识问答、农事咨询等通用 AI 对话能力
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List

from services.llm_client import llm_client
from services.rag_service import RAGService

router = APIRouter()
rag_service = RAGService()

# ==================== 数据模型 ====================


class ChatMessage(BaseModel):
    role: str = Field(..., description="消息角色: user/assistant")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    message: str = Field(..., description="用户问题")
    context: Optional[str] = Field(None, description="额外上下文（如当前查看的作物、地块等）")
    history: List[ChatMessage] = Field(default_factory=list, description="对话历史")
    useRag: bool = Field(True, description="是否使用RAG检索农技知识库")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI 回复")
    mode: str = Field("llm", description="响应模式: llm/rag_llm/mock")
    sources: List[str] = Field(default_factory=list, description="引用的知识来源")
    followUpQuestions: List[str] = Field(default_factory=list, description="建议追问")


# ==================== 系统提示词 ====================

SYSTEM_PROMPT = """你是一个专业的智慧农业AI助手，服务于SmartFarm智慧农业管理系统。你的职责是帮助农场管理者解决农业生产中的各种问题。

## 你的能力范围：
1. **病虫害防治** — 识别病害症状、推荐防治方案（化学/生物/农业防治）
2. **农事管理** — 灌溉、施肥、修剪、采收等农事操作建议
3. **土壤与肥料** — 土壤改良、施肥方案、养分管理
4. **气象农事** — 根据天气情况调整农事计划
5. **市场行情** — 农产品价格趋势分析和销售建议
6. **农业政策** — 农业补贴、认证标准、行业规范
7. **智能设备** — 温室控制、水肥一体化、环境监测

## 回答要求：
- 专业、准确、可操作
- 涉及用量、时间、频率等要给出具体数值
- 如果用户提供了作物、地块等上下文信息，要结合给出针对性建议
- 对不确定的信息要诚实说明
- 使用中文回答，语言通俗易懂但不失专业性

## 系统当前可以访问的数据：
- 病虫害知识库（含化学/生物/农业防治方案）
- 农技规范文档（国标、行标）
- 作物生长周期数据
- 土壤和气象历史数据"""


# ==================== 路由 ====================


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI 智能对话

    支持农业知识问答、农事咨询、病虫害防治建议等。
    可选启用 RAG 模式，自动检索农技知识库增强回答质量。

    - **message**: 用户问题
    - **context**: 可选额外上下文（当前作物、地块等）
    - **history**: 对话历史（用于多轮对话）
    - **useRag**: 是否启用RAG检索增强
    """
    # === Mock 模式降级 ===
    if not llm_client.available:
        return ChatResponse(
            reply=_mock_reply(request.message, request.context),
            mode="mock",
            sources=[],
            followUpQuestions=["如何预防病虫害？", "什么时候施肥最合适？", "当前季节适合种什么？"],
        )

    # === 构建消息 ===
    messages = []

    # 添加历史消息
    for h in request.history[-10:]:  # 最近10轮
        messages.append({"role": h.role, "content": h.content})

    # === RAG 检索增强 ===
    sources = []
    if request.useRag:
        try:
            rag_result = rag_service.search(request.message, top_k=3)
            if rag_result.get("results"):
                context_parts = ["\n## 参考农技规范（请优先引用）"]
                for doc in rag_result["results"]:
                    if doc.get("score", 0) > 0.1:
                        context_parts.append(f"- [{doc.get('sourceRegulation', '知识库')}] {doc['title']}: {doc.get('snippet', '')}")
                        sources.append(doc.get("title", ""))
                if len(context_parts) > 1:
                    rag_context = "\n".join(context_parts)
                    messages.append({"role": "system", "content": rag_context})
        except Exception:
            pass  # RAG 失败不影响对话

    # === 构建用户消息 ===
    user_content = request.message
    if request.context:
        user_content = f"当前上下文信息：{request.context}\n\n用户问题：{request.message}"

    messages.append({"role": "user", "content": user_content})

    # === 调用 LLM ===
    try:
        reply = llm_client.chat(
            messages=messages,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.7,
            max_tokens=2048,
        )

        if reply:
            return ChatResponse(
                reply=reply,
                mode="rag_llm" if sources else "llm",
                sources=sources[:5],
                followUpQuestions=_suggest_followups(request.message),
            )
    except Exception:
        pass

    # === 最终降级 ===
    return ChatResponse(
        reply=_mock_reply(request.message, request.context),
        mode="mock",
        sources=sources,
        followUpQuestions=["如何预防病虫害？", "什么时候施肥最合适？"],
    )


@router.get("/chat/health")
async def chat_health():
    """对话服务健康检查"""
    return {
        "status": "healthy",
        "llmAvailable": llm_client.available,
        "ragDocsCount": len(rag_service._documents),
        "mode": "production" if llm_client.available else "mock",
    }


# ==================== Mock 降级回复 ====================


def _mock_reply(message: str, context: str = None) -> str:
    """Mock 模式下的预设回复"""
    msg_lower = message.lower()

    if any(kw in msg_lower for kw in ["病害", "病虫害", "叶子", "叶片", "虫害", "病斑"]):
        return ("根据您的描述，建议采取以下防治措施：\n\n"
                "**1. 农业防治**\n- 及时清除病株残体，减少传染源\n- 合理密植，保证通风透光\n- 轮作倒茬，减少病原菌积累\n\n"
                "**2. 生物防治**\n- 引入天敌昆虫（瓢虫、寄生蜂等）\n- 使用芽孢杆菌制剂\n\n"
                "**3. 化学防治**\n- 发病初期喷洒霜脲·锰锌800倍液\n- 间隔7-10天喷1次，连续2-3次\n"
                "- ⚠️ 收获前7天停止用药\n\n"
                "💡 **提示**：上传病害图片可使用AI图像识别获取更精准的诊断结果。")

    if any(kw in msg_lower for kw in ["施肥", "肥料", "养分", "追肥"]):
        return ("**施肥建议**：\n\n"
                "- **苗期**：以氮肥为主，促进营养生长，建议尿素10-15kg/亩\n"
                "- **开花结果期**：增施磷钾肥，钾肥10-15kg/亩，促进果实发育\n"
                "- **采收期**：减少氮肥，避免贪青晚熟\n\n"
                "**施肥原则**：\n- 少量多次，避免一次性大量施肥\n- 结合灌溉进行，提高肥料利用率\n- 有机肥与化肥配合使用\n\n"
                "💡 建议先进行土壤检测，根据N/P/K含量精准施肥。")

    if any(kw in msg_lower for kw in ["灌溉", "浇水", "湿度", "干旱"]):
        return ("**灌溉建议**：\n\n"
                "- **土壤湿度目标**：苗期55-65%，结果期65-75%\n"
                "- **灌溉时间**：清晨或傍晚，避免中午高温时段\n"
                "- **灌溉量参考**：滴灌每亩15-25m³/次，视土壤墒情调整\n\n"
                "**节水技巧**：\n- 采用滴灌或微喷灌，比漫灌节水40%以上\n- 覆盖地膜减少蒸发\n- 根据天气预报调整，雨后减少灌溉量\n\n"
                "💡 当前系统智能灌溉方案可自动根据土壤传感器数据调整灌溉计划。")

    if any(kw in msg_lower for kw in ["价格", "行情", "市场", "销售"]):
        return ("**近期市场行情**：\n\n"
                "- 番茄：价格上涨趋势（+5%），建议适时采收上市\n"
                "- 黄瓜：价格稳定，按计划采收\n- 辣椒：价格上涨，关注市场动态\n"
                "- 草莓：价格持续走高，精品果溢价明显\n\n"
                "**销售建议**：\n- 关注批发市场价格波动，选择合适时机出货\n- 分级销售提高收益，精品果走高端渠道\n"
                "- 提前联系收购商，签订预售合同锁定价格\n\n"
                "💡 系统市场价格监测模块可查看详细走势图。")

    # 默认回复
    return ("感谢您的咨询！作为智慧农业AI助手，我可以帮您解答以下问题：\n\n"
            "🌱 **病虫害防治** — 病害诊断、防治方案、农药使用\n"
            "💧 **水肥管理** — 灌溉方案、施肥建议、养分管理\n"
            "🌤️ **气象农事** — 根据天气调整农事计划\n"
            "📊 **市场行情** — 价格分析、销售建议\n"
            "🔧 **设备管理** — 温室控制、水肥一体化\n\n"
            "请详细描述您的问题，我会尽力提供专业建议。")


def _suggest_followups(message: str) -> list:
    """根据问题推荐追问"""
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in ["病害", "病虫害", "叶子"]):
        return ["这种病害的传播途径是什么？", "如何区分真菌性和细菌性病害？", "有机种植中如何防治？"]
    if any(kw in msg_lower for kw in ["施肥", "肥料"]):
        return ["有机肥和化肥如何搭配？", "不同生长阶段施肥有什么不同？", "如何判断施肥过量？"]
    if any(kw in msg_lower for kw in ["灌溉", "浇水"]):
        return ["不同土壤类型如何调整灌溉？", "滴灌和喷灌哪个更好？", "如何判断作物是否缺水？"]
    return ["近期天气对农事有什么影响？", "当前季节需要注意哪些病虫害？", "有什么节本增效的好方法？"]
