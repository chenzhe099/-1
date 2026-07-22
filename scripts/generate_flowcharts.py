"""
生成所有商业计划书流程图（PNG格式）
所有图形使用 matplotlib 绘制，不使用 ASCII 符号
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Arc, Polygon
import numpy as np
import os

# ===== 中文字体配置 =====
FONT_PATH = None
for f in fm.fontManager.ttflist:
    if 'Microsoft YaHei' in f.name or 'SimHei' in f.name:
        FONT_PATH = f.fname
        break
if FONT_PATH:
    font_prop = fm.FontProperties(fname=FONT_PATH)
    FONT_NAME = font_prop.get_name()
    matplotlib.rcParams['font.family'] = FONT_NAME
    matplotlib.rcParams['font.sans-serif'] = [FONT_NAME, 'SimHei', 'Microsoft YaHei', 'DejaVu Sans']
else:
    FONT_NAME = 'sans-serif'

# 全局文本函数（确保中文正常显示）
def gtext(ax, x, y, text, **kwargs):
    """添加中文文本的包装函数"""
    defaults = {'ha': 'center', 'va': 'center', 'fontsize': 9, 'fontweight': 'normal'}
    defaults.update(kwargs)
    return ax.text(x, y, text, **defaults)

OUTPUT_DIR = r'd:\zhuomian\gjcx\assets\flowcharts'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ========== 配色方案 ==========
C = {
    'primary':   '#1A5276',   # 主色 深蓝
    'secondary': '#2980B9',   # 次色 中蓝
    'accent1':   '#27AE60',   # 绿色
    'accent2':   '#E67E22',   # 橙色
    'accent3':   '#8E44AD',   # 紫色
    'accent4':   '#C0392B',   # 红色
    'light1':    '#D6EAF8',   # 浅蓝
    'light2':    '#D5F5E3',   # 浅绿
    'light3':    '#FDEBD0',   # 浅橙
    'light4':    '#E8DAEF',   # 浅紫
    'light5':    '#FADBD8',   # 浅红
    'dark_bg':   '#1B2631',   # 深色背景
    'white':     '#FFFFFF',
    'gray':      '#7F8C8D',
    'text':      '#2C3E50',
}

def save_figure(fig, name):
    path = os.path.join(OUTPUT_DIR, name)
    fig.savefig(path, dpi=200, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f'  OK {name}')


def add_box(ax, x, y, w, h, text, color, fontsize=9, text_color='white', bold=True):
    """添加圆角矩形"""
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15",
                         facecolor=color, edgecolor='white', linewidth=1.5)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=text_color, fontweight='bold' if bold else 'normal', fontfamily='sans-serif')
    return box


def add_arrow(ax, x1, y1, x2, y2, color='#7F8C8D', lw=1.5):
    """添加箭头"""
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw, connectionstyle='arc3,rad=0'))


def add_label_box(ax, x, y, w, h, label, desc, bg, text_color='#2C3E50'):
    """带标签和描述的双行盒子"""
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1",
                         facecolor=bg, edgecolor='#BDC3C7', linewidth=0.8)
    ax.add_patch(box)
    ax.text(x + w/2, y + h*0.7, label, ha='center', va='center', fontsize=8.5,
            color=text_color, fontweight='bold', fontfamily='sans-serif')
    if desc:
        ax.text(x + w/2, y + h*0.25, desc, ha='center', va='center', fontsize=6.5,
                color='#7F8C8D', fontfamily='sans-serif')


# ============================================================
# 图1: 产品架构系统图
# ============================================================
def gen_product_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor('white')

    # 标题
    ax.text(8, 9.5, '智农云 SaaS 平台整体架构', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')
    ax.text(8, 9.1, 'SmartAgri Cloud Platform Architecture', ha='center', va='center',
            fontsize=9, color=C['gray'], fontfamily='sans-serif', style='italic')

    # === 第一层: SaaS 应用层 ===
    add_box(ax, 1.2, 7.6, 13.6, 1.2, '', C['light1'], fontsize=0)
    ax.text(8, 8.6, 'SaaS 应用层 — 八大功能模块', ha='center', va='center',
            fontsize=11, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    modules = [
        ('数据总览\n驾驶舱', C['primary']), ('病虫害AI\n识别预警', C['secondary']),
        ('精准农事\n水肥决策', C['accent2']), ('产量预测\n农事规划', C['accent1']),
        ('数字化\n农场管理', C['accent3']), ('设备监控\n远程控制', C['primary']),
        ('农产品\n溯源管理', C['accent4']), ('权限管理\n多账号协同', C['secondary'])
    ]
    for i, (label, color) in enumerate(modules):
        x = 1.6 + i * 1.65
        add_box(ax, x, 7.7, 1.5, 0.9, label, color, fontsize=7.5)

    # === 第二层: 数据中台 ===
    add_box(ax, 1.2, 5.5, 13.6, 1.0, '', C['light2'], fontsize=0)
    ax.text(8, 6.3, 'DataService 数据中台', ha='center', va='center',
            fontsize=11, fontweight='bold', color=C['accent1'], fontfamily='sans-serif')

    mids = ['多源数据汇聚', '数据清洗/ETL', '实时查询引擎', '聚合分析引擎', '权限管控']
    for i, mid in enumerate(mids):
        x = 2.0 + i * 2.7
        add_box(ax, x, 5.6, 2.4, 0.7, mid, C['accent1'], fontsize=8, text_color='white')

    # === 第三层: IoT 设备层 ===
    add_box(ax, 1.2, 3.4, 13.6, 1.0, '', C['light3'], fontsize=0)
    ax.text(8, 4.2, 'IoT 设备层', ha='center', va='center',
            fontsize=11, fontweight='bold', color=C['accent2'], fontfamily='sans-serif')

    iots = ['土壤传感器', '气象站', '智能摄像头', '灌溉控制器', '施肥机', '网关/MQTT']
    for i, iot in enumerate(iots):
        x = 1.6 + i * 2.1
        add_box(ax, x, 3.5, 1.9, 0.7, iot, C['accent2'], fontsize=7.5)

    # === 第四层: 展示层 ===
    add_box(ax, 1.2, 1.3, 13.6, 1.0, '', C['light4'], fontsize=0)
    ax.text(8, 2.1, '终端接入层', ha='center', va='center',
            fontsize=11, fontweight='bold', color=C['accent3'], fontfamily='sans-serif')

    ends = ['Web 管理端', 'iOS App', 'Android App', '微信小程序', '大屏展示', 'API 开放平台']
    for i, end in enumerate(ends):
        x = 1.6 + i * 2.1
        add_box(ax, x, 1.4, 1.9, 0.7, end, C['accent3'], fontsize=7.5)

    # === 层间箭头 ===
    for y_from, y_to, label in [(7.6, 6.5, 'API 调用'), (5.5, 4.4, 'MQTT 协议'), (3.4, 2.3, 'HTTP/WS')]:
        arr = FancyArrowPatch((13, y_from + 0.1), (13, y_to + 0.1),
                              arrowstyle='->', color=C['gray'], lw=2, mutation_scale=20)
        ax.add_patch(arr)
        ax.text(14.5, (y_from + y_to) / 2, label, ha='center', va='center',
                fontsize=7, color=C['gray'], rotation=90, fontfamily='sans-serif')

    # === 右侧: 安全/运维 ===
    add_box(ax, 13.8, 7.6, 1.6, 3.0, '', '#F8F9FA', fontsize=0)
    add_box(ax, 14.0, 9.3, 1.2, 0.6, '安全防护', C['accent4'], fontsize=7)
    add_box(ax, 14.0, 8.5, 1.2, 0.6, '监控告警', C['accent2'], fontsize=7)
    add_box(ax, 14.0, 7.7, 1.2, 0.6, '日志审计', C['secondary'], fontsize=7)

    save_figure(fig, '01_product_architecture.png')


# ============================================================
# 图2: 客户获取渠道图
# ============================================================
def gen_acquisition_channels():
    fig, ax = plt.subplots(1, 1, figsize=(14, 8))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(7, 7.6, '客户获取渠道体系', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # 顶层: 目标客户
    add_box(ax, 5.5, 6.5, 3.0, 0.8, '目标客户', C['primary'], fontsize=12)

    # 三条主分支
    branches = [
        (1.5, '直销团队 (40%)', C['accent1'], ['农业展会', '协会推荐', '标杆客户带动']),
        (5.5, '渠道合作 (35%)', C['accent2'], ['农资经销商', '政府项目', '科研院所合作']),
        (9.5, '线上获客 (25%)', C['accent3'], ['短视频/直播', 'SEO/SEM', '行业论坛/白皮书']),
    ]

    for bx, label, color, items in branches:
        # 主分支
        add_box(ax, bx, 4.8, 3.0, 0.7, label, color, fontsize=10)

        # 子项
        for j, item in enumerate(items):
            add_box(ax, bx + 0.15, 3.2 + j * 0.7, 2.7, 0.55, item, '#F8F9FA',
                   fontsize=7.5, text_color=C['text'], bold=False)

        # 箭头: 顶层到分支
        add_arrow(ax, 7, 6.4, bx + 1.5, 5.5, C['gray'])

    # 底部: 转化漏斗
    funnel = [
        (3.0, 1.8, '潜在客户 10,000+', '#D6EAF8'),
        (3.5, 1.1, '有效线索 2,000+', '#AED6F1'),
        (4.0, 0.4, '签约客户 200+', C['primary']),
    ]
    for x, y, txt, clr in funnel:
        w = 14 - 2*x
        add_box(ax, x, y, w, 0.55, txt, clr, fontsize=8.5, text_color='white' if clr == C['primary'] else C['text'])

    ax.text(7, 2.5, '销售漏斗转化', ha='center', fontsize=9, color=C['gray'], fontfamily='sans-serif')

    save_figure(fig, '02_acquisition_channels.png')


# ============================================================
# 图3: 组织架构图
# ============================================================
def gen_org_chart():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(7, 8.6, '核心团队组织架构', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # CEO
    add_box(ax, 5.5, 7.2, 3.0, 0.75, 'CEO / 创始人', C['primary'], fontsize=11)

    # 第二层: CTO, COO, 销售总监
    add_box(ax, 1.5, 5.5, 3.2, 0.7, 'CTO 技术负责人', C['secondary'], fontsize=10)
    add_box(ax, 5.4, 5.5, 3.2, 0.7, 'COO 运营负责人', C['accent1'], fontsize=10)
    add_box(ax, 9.3, 5.5, 3.2, 0.7, '销售总监', C['accent2'], fontsize=10)

    for x in [3.1, 7.0, 10.9]:
        add_arrow(ax, 7, 7.2, x, 6.2, C['gray'])

    # 第三层: 各部门
    depts = [
        # CTO 下
        (0.3, 'AI算法\n(2人)', C['light1']), (1.8, '前端\n(2人)', C['light1']),
        (3.3, '后端\n(2人)', C['light1']), (4.8, '产品设计\n(1人)', C['light1']),
        # COO 下
        (5.6, '客户成功\n(2人)', C['light2']), (7.1, '农业专家\n顾问(2人)', C['light2']),
        # 销售下
        (9.5, '直销团队\n(2人)', C['light3']), (11.0, '渠道管理\n(2人)', C['light3']),
    ]
    for x, label, color in depts:
        add_box(ax, x, 3.6, 1.4, 1.0, label, color, fontsize=7.5, text_color=C['text'])

    # CTO 到下属的箭头
    for x in [1.0, 2.5, 4.0, 5.5]:
        add_arrow(ax, 3.1, 5.5, x + 0.5, 4.6, '#AAB7B8')
    for x in [6.3, 7.8]:
        add_arrow(ax, 7.0, 5.5, x + 0.5, 4.6, '#AAB7B8')
    for x in [10.2, 11.7]:
        add_arrow(ax, 10.9, 5.5, x + 0.5, 4.6, '#AAB7B8')

    # 底部统计栏
    add_box(ax, 3.0, 2.0, 8.0, 0.8, '初期团队: 13人  |  技术: 7人  |  运营: 4人  |  销售: 4人',
            '#F8F9FA', fontsize=9, text_color=C['text'], bold=False)

    save_figure(fig, '03_org_chart.png')


# ============================================================
# 图4: 发展路线图 (甘特图风格)
# ============================================================
def gen_roadmap():
    fig, ax = plt.subplots(1, 1, figsize=(16, 8))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(8, 7.7, '产品发展路线图 (2024-2027)', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # 时间轴 (月份)
    months = ['0月','6月','12月','18月','24月','30月','36月','42月']
    for i, m in enumerate(months):
        x = 1.5 + i * 1.8
        ax.axvline(x=x, ymin=0.12, ymax=0.9, color='#E5E7E9', lw=1, ls='--')
        ax.text(x, 7.2, m, ha='center', fontsize=7, color=C['gray'], fontfamily='sans-serif')

    # 四个阶段
    phases = [
        (1.5, 5.0, 3.2, 1.5, 'Phase 1\nMVP 验证\n(0-6月)', C['light1'], C['primary'],
         ['后端API开发', 'AI模型训练', 'IoT网关开发', '种子客户试用']),
        (4.9, 5.0, 3.2, 1.5, 'Phase 2\n产品成熟\n(6-18月)', C['light2'], C['accent1'],
         ['V1.0 发布', '移动端App', '产量预测AI', '渠道体系建设']),
        (8.3, 5.0, 3.2, 1.5, 'Phase 3\n规模扩张\n(18-36月)', C['light3'], C['accent2'],
         ['开放API平台', '数据中台', '智能农机调度', '海外市场探索']),
        (11.7, 5.0, 3.2, 1.5, 'Phase 4\n生态构建\n(36月+)', C['light4'], C['accent3'],
         ['农业AI大模型', '碳汇交易', '保险精算', 'IPO / 并购']),
    ]

    for bx, by, bw, bh, label, bg, text_c, items in phases:
        box = FancyBboxPatch((bx, by), bw, bh, boxstyle="round,pad=0.2",
                             facecolor=bg, edgecolor=text_c, linewidth=2)
        ax.add_patch(box)
        ax.text(bx + bw/2, by + bh/2, label, ha='center', va='center',
                fontsize=9, fontweight='bold', color=text_c, fontfamily='sans-serif')

        for j, item in enumerate(items):
            ax.text(bx + 0.2, by - 0.5 - j * 0.45, f'• {item}', fontsize=7,
                   color=C['text'], fontfamily='sans-serif')

    # 关键里程碑标记
    milestones = [
        (3.1, 6.8, 'MVP\n完成'), (6.7, 6.8, '产品\n发布'), (9.9, 6.8, 'PMF\n验证'),
        (13.5, 6.8, '盈利\n拐点'), (15.3, 6.8, 'IPO\n准备'),
    ]
    for mx, my, label in milestones:
        add_box(ax, mx - 0.4, my, 0.8, 0.5, label, C['accent4'], fontsize=6.5)
        ax.plot(mx, my - 0.1, 'v', color=C['accent4'], markersize=8)
        ax.plot([mx, mx], [6.6, my - 0.1], color=C['accent4'], lw=1.5, ls='--')

    # 付费客户目标
    ax.text(1.5, 1.2, '付费客户目标:', fontsize=9, fontweight='bold', color=C['text'], fontfamily='sans-serif')
    targets = [(1.5, '5 家种子'), (4.9, '50-80 家'), (8.3, '200-400 家'), (11.7, '500+ 家')]
    for tx, tlabel in targets:
        add_box(ax, tx, 0.2, 3.0, 0.6, tlabel, C['primary'], fontsize=8.5)

    save_figure(fig, '04_roadmap.png')


# ============================================================
# 图5: 商业模式收入模型
# ============================================================
def gen_business_model():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(7, 8.6, '商业模式 — 收入来源模型', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # 左侧: 核心产品
    add_box(ax, 0.5, 5.0, 5.5, 3.0, '', '#F8F9FA', fontsize=0)
    ax.text(3.25, 7.6, '核心收入来源', fontsize=12, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # SaaS 三层定价
    saas = [
        (1.0, 6.5, '基础版', '小型农场', '¥0.98万/年', C['accent1']),
        (1.0, 5.3, '专业版', '中型农场', '¥4.8万/年', C['secondary']),
        (1.0, 4.1, '企业版', '大型集团', '¥12-50万/年', C['primary']),
    ]
    for x, y, name, target, price, color in saas:
        add_box(ax, x, y, 4.8, 0.9, f'{name}  |  {target}  |  {price}', color, fontsize=8)

    # 右侧: 增值服务
    add_box(ax, 7.0, 5.0, 6.5, 3.0, '', '#F8F9FA', fontsize=0)
    ax.text(10.25, 7.6, '增值服务收入', fontsize=12, fontweight='bold', color=C['accent2'], fontfamily='sans-serif')

    adds = [
        (7.5, 6.5, 'IoT 硬件套装', '¥0.8-1.5万/套'),
        (7.5, 5.3, 'AI 模型定制', '¥5-20万/次'),
        (11.0, 6.5, '私有化部署', '¥10-30万/次'),
        (11.0, 5.3, '培训 + API 接口', '¥0.5-5万/年'),
    ]
    for x, y, name, price in adds:
        add_box(ax, x, y, 3.2, 0.9, f'{name}\n{price}', C['accent2'], fontsize=7.5)

    # 底部: 收入增长曲线
    ax.text(7, 3.8, '3年收入增长预测（万元）', fontsize=11, fontweight='bold', color=C['text'], fontfamily='sans-serif')

    years_data = [
        ('第1年', 480, C['light1']), ('第2年', 1200, C['light2']), ('第3年', 2400, C['light4'])
    ]
    bar_h = 0.6
    for i, (yr, val, clr) in enumerate(years_data):
        w = val / 350 * 10  # scale
        bx = 2.0
        by = 3.0 - i * 0.9
        add_box(ax, bx, by, w, bar_h, '', clr, fontsize=0)
        ax.text(bx + w / 2, by + bar_h / 2, f'{yr}  ¥{val}万', ha='center', va='center',
                fontsize=9, fontweight='bold', color=C['text'], fontfamily='sans-serif')

    # 客户数
    customers_data = [(1, '60家', C['accent1']), (2, '180家', C['accent2']), (3, '400家', C['accent3'])]
    for i, (yr, num, clr) in enumerate(customers_data):
        by = 3.0 - i * 0.9
        add_box(ax, 13.0, by, 1.5, bar_h, num, clr, fontsize=8.5)

    ax.text(13.75, 3.7, '客户', ha='center', fontsize=7, color=C['gray'], fontfamily='sans-serif')

    save_figure(fig, '05_business_model.png')


# ============================================================
# 图6: 竞争态势矩阵
# ============================================================
def gen_competitive_landscape():
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    ax.text(5, 9.5, '竞争态势分析矩阵', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # 坐标轴
    ax.arrow(1, 1, 8, 0, head_width=0.15, head_length=0.2, fc=C['gray'], ec=C['gray'], lw=1.5)
    ax.arrow(1, 1, 0, 8, head_width=0.15, head_length=0.2, fc=C['gray'], ec=C['gray'], lw=1.5)

    ax.text(5, 0.4, '功能完整度 →', ha='center', fontsize=9, color=C['gray'], fontfamily='sans-serif')
    ax.text(0.2, 5, 'AI 能力深度 →', ha='center', fontsize=9, color=C['gray'], fontfamily='sans-serif', rotation=90)

    # 竞争者位置 (功能完整度, AI深度, 标签, 颜色, 气泡大小)
    competitors = [
        (3.5, 2.5, '传统农业\n信息化厂商', '#95A5A6', 0.8),
        (6.5, 2.0, '硬件厂商\n(大疆/极飞)', '#BDC3C7', 0.7),
        (7.0, 5.5, '互联网巨头\n(阿里/京东)', '#A569BD', 1.1),
        (4.0, 4.5, '创业公司\n(丰疆/麦飞)', '#5DADE2', 0.6),
        (8.5, 8.0, '★ 智农云', C['accent4'], 1.5),
    ]

    for x, y, label, color, size in competitors:
        circle = plt.Circle((x, y), size, facecolor=color, edgecolor='white',
                           linewidth=2, alpha=0.85, zorder=5)
        ax.add_patch(circle)
        ax.text(x, y, label, ha='center', va='center', fontsize=6.5,
                color='white', fontweight='bold', fontfamily='sans-serif')

    # 图例
    legend_items = [
        (7.5, 1.5, '功能: 模块覆盖数量 + 场景适配', C['text']),
        (7.5, 1.0, 'AI: 识别准确率 + 决策智能度', C['text']),
        (7.5, 0.5, '气泡大小: 市场影响力', C['text']),
    ]
    for x, y, txt, clr in legend_items:
        ax.text(x, y, txt, fontsize=7, color=clr, fontfamily='sans-serif')

    save_figure(fig, '06_competitive_matrix.png')


# ============================================================
# 图7: 技术架构层次图
# ============================================================
def gen_tech_stack():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(7, 8.6, '技术架构层次', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    layers = [
        (7.8, '展示层', ['React / Vue SPA', 'Tailwind CSS', 'Chart.js', '响应式设计'], C['primary'], C['light1']),
        (6.2, 'API 网关层', ['FastAPI (Python)', 'RESTful / GraphQL', 'JWT 认证', '限流 / 熔断'], C['secondary'], '#D6EAF8'),
        (4.6, '业务服务层', ['病虫害AI引擎', '产量预测ML', '农事决策引擎', '溯源服务'], C['accent1'], C['light2']),
        (3.0, '数据存储层', ['PostgreSQL', 'TimescaleDB', 'Redis 缓存', 'MinIO 对象存储'], C['accent2'], C['light3']),
        (1.4, '基础设施层', ['Kubernetes', 'Docker', 'MQTT / EMQX', 'Hyperledger Fabric'], C['accent3'], C['light4']),
    ]

    for y, label, items, color, bg in layers:
        box = FancyBboxPatch((0.3, y - 0.6), 13.4, 1.3, boxstyle="round,pad=0.2",
                             facecolor=bg, edgecolor=color, linewidth=2)
        ax.add_patch(box)
        ax.text(0.6, y + 0.35, label, fontsize=11, fontweight='bold', color=color, fontfamily='sans-serif')

        for j, item in enumerate(items):
            ix = 3.5 + j * 2.8
            add_box(ax, ix, y - 0.4, 2.5, 0.65, item, color, fontsize=7.5)

    # 双向箭头连接各层
    for i in range(len(layers) - 1):
        y1 = layers[i][0] - 0.7
        y2 = layers[i+1][0] + 0.6
        mid = (y1 + y2) / 2
        # 右侧
        ax.annotate('', xy=(12.8, y2), xytext=(12.8, y1),
                    arrowprops=dict(arrowstyle='<->', color=C['gray'], lw=1.5))
        ax.text(13.2, mid, 'API', fontsize=7, color=C['gray'], fontfamily='sans-serif', rotation=90)

    # 左侧: 安全运维贯穿
    add_box(ax, 0.3, 1.0, 1.5, 7.2, '安全\n运维\n监控\n日志', C['accent4'], fontsize=8)

    save_figure(fig, '07_tech_stack.png')


# ============================================================
# 图8: 财务预测趋势图
# ============================================================
def gen_financial_projection():
    fig, ax = plt.subplots(1, 1, figsize=(12, 7))
    ax.set_facecolor('white')

    years = ['第1年', '第2年', '第3年']
    revenue = [480, 1200, 2400]
    cost = [690, 918, 1178]
    profit = [-210, 282, 1222]
    customers = [60, 180, 400]

    x = np.arange(len(years))
    width = 0.3

    bars1 = ax.bar(x - width, revenue, width, label='营业收入', color=C['primary'], edgecolor='white')
    bars2 = ax.bar(x, cost, width, label='营业成本', color=C['accent2'], edgecolor='white')
    bars3 = ax.bar(x + width, profit, width, label='净利润', color=C['accent1'], edgecolor='white')

    # 数据标签
    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 30, f'¥{int(bar.get_height())}万',
                ha='center', fontsize=9, fontweight='bold', color=C['primary'])
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 20, f'¥{int(bar.get_height())}万',
                ha='center', fontsize=8, color=C['accent2'])
    for bar in bars3:
        y_pos = bar.get_height() + 15 if bar.get_height() > 0 else bar.get_height() - 60
        ax.text(bar.get_x() + bar.get_width()/2, y_pos, f'¥{int(bar.get_height())}万',
                ha='center', fontsize=9, fontweight='bold', color=C['accent1'])

    # 客户数辅助轴
    ax2 = ax.twinx()
    ax2.plot(x, customers, 'o-', color=C['accent4'], lw=3, markersize=10, label='客户数')
    for i, c in enumerate(customers):
        ax2.text(i, c + 15, f'{c}家', ha='center', fontsize=9, fontweight='bold', color=C['accent4'])
    ax2.set_ylabel('付费客户数', fontsize=10, color=C['accent4'])

    ax.set_xticks(x)
    ax.set_xticklabels(years, fontsize=11)
    ax.set_ylabel('金额（万元）', fontsize=10)
    ax.set_title('3年财务预测', fontsize=14, fontweight='bold', color=C['primary'], pad=15)
    ax.legend(loc='upper left', fontsize=9)
    ax2.legend(loc='upper right', fontsize=9)
    ax.grid(axis='y', alpha=0.3)
    ax.set_ylim(-400, 3000)

    plt.tight_layout()
    save_figure(fig, '08_financial_projection.png')


# ============================================================
# 图9: 风险管理矩阵
# ============================================================
def gen_risk_matrix():
    fig, ax = plt.subplots(1, 1, figsize=(12, 7))
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 5)
    ax.axis('off')

    ax.text(2.5, 4.8, '风险评估矩阵', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # 坐标轴
    ax.arrow(0.5, 0.5, 4, 0, head_width=0.1, head_length=0.1, fc=C['gray'], ec=C['gray'])
    ax.arrow(0.5, 0.5, 0, 4, head_width=0.1, head_length=0.1, fc=C['gray'], ec=C['gray'])

    ax.text(2.5, 0.15, '发生概率 →', ha='center', fontsize=9, color=C['gray'])
    ax.text(0.1, 2.5, '影响程度 →', ha='center', fontsize=9, color=C['gray'], rotation=90)

    # 区域背景
    regions = [
        (0.5, 0.5, 1.5, 1.5, '#D5F5E3', '低风险'),  # 左下 绿
        (2.0, 0.5, 1.5, 1.5, '#FDEBD0', '中风险'),  # 右下 橙
        (0.5, 2.0, 1.5, 1.5, '#FDEBD0', '中风险'),  # 左上 橙
        (2.0, 2.0, 1.5, 1.5, '#FADBD8', '高风险'),  # 右上 红
    ]
    for rx, ry, rw, rh, color, label in regions:
        rect = FancyBboxPatch((rx, ry), rw, rh, boxstyle="round,pad=0.05",
                             facecolor=color, edgecolor='white', linewidth=1, alpha=0.6)
        ax.add_patch(rect)
        ax.text(rx + rw/2, ry + rh/2, label, ha='center', va='center', fontsize=10,
                fontweight='bold', color=C['text'], alpha=0.4)

    # 风险点
    risks = [
        (1.0, 3.5, '政策变化', C['accent1'], 0.25),
        (1.5, 1.5, '人才招聘', C['accent2'], 0.28),
        (2.5, 2.0, '客户教育', C['accent2'], 0.30),
        (2.0, 3.0, '数据安全', C['accent2'], 0.28),
        (3.0, 2.5, '市场竞争', C['accent2'], 0.30),
        (3.0, 3.5, '产品落地', C['accent4'], 0.35),
        (3.5, 3.0, '现金流', C['accent4'], 0.35),
    ]
    for rx, ry, label, color, size in risks:
        circle = plt.Circle((rx, ry), size, facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.9)
        ax.add_patch(circle)
        ax.text(rx, ry, label, ha='center', va='center', fontsize=7, fontweight='bold', color='white')

    save_figure(fig, '09_risk_matrix.png')


# ============================================================
# 图10: 客户价值闭环
# ============================================================
def gen_value_loop():
    fig, ax = plt.subplots(1, 1, figsize=(12, 9))
    ax.set_xlim(-6, 6)
    ax.set_ylim(-6, 6)
    ax.axis('off')
    ax.set_aspect('equal')

    ax.text(0, 5.5, '客户价值闭环', ha='center', va='center',
            fontsize=16, fontweight='bold', color=C['primary'], fontfamily='sans-serif')

    # 闭环节点（圆形排列）
    import math
    nodes = [
        ('数据采集', '传感器+IoT\n实时监测', C['primary']),
        ('AI 分析', '病虫害识别\n产量预测', C['secondary']),
        ('智能决策', '灌溉/施肥\n农事方案', C['accent1']),
        ('精准执行', '远程控制\n自动化作业', C['accent2']),
        ('效果评估', '投入产出\n效益分析', C['accent3']),
        ('持续优化', '模型迭代\n方案调优', C['accent4']),
    ]

    radius = 3.2
    for i, (title, desc, color) in enumerate(nodes):
        angle = math.pi/2 - i * 2 * math.pi / len(nodes)  # 从顶部开始顺时针
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)

        circle = plt.Circle((x, y), 1.1, facecolor=color, edgecolor='white', linewidth=3, alpha=0.9)
        ax.add_patch(circle)
        ax.text(x, y + 0.25, title, ha='center', va='center', fontsize=10,
                fontweight='bold', color='white', fontfamily='sans-serif')
        ax.text(x, y - 0.35, desc, ha='center', va='center', fontsize=6.5,
                color='white', fontfamily='sans-serif', alpha=0.9)

    # 环状箭头连接
    for i in range(len(nodes)):
        a1 = math.pi/2 - i * 2 * math.pi / len(nodes)
        a2 = math.pi/2 - ((i + 1) % len(nodes)) * 2 * math.pi / len(nodes)
        mid_angle = (a1 + a2) / 2
        mid_x = (radius + 1.4) * math.cos(mid_angle)
        mid_y = (radius + 1.4) * math.sin(mid_angle)
        ax.annotate('→', xy=(mid_x, mid_y), ha='center', va='center',
                    fontsize=18, color=C['gray'], fontweight='bold')

    # 中心
    center_circle = plt.Circle((0, 0), 1.0, facecolor='white', edgecolor=C['primary'], linewidth=3)
    ax.add_patch(center_circle)
    ax.text(0, 0.15, '智农云', ha='center', va='center', fontsize=12,
            fontweight='bold', color=C['primary'], fontfamily='sans-serif')
    ax.text(0, -0.3, '智慧农业', ha='center', va='center', fontsize=8,
            color=C['gray'], fontfamily='sans-serif')

    save_figure(fig, '10_value_loop.png')


# ========== 主函数 ==========
if __name__ == '__main__':
    print('生成流程图中...')
    gen_product_architecture()
    gen_acquisition_channels()
    gen_org_chart()
    gen_roadmap()
    gen_business_model()
    gen_competitive_landscape()
    gen_tech_stack()
    gen_financial_projection()
    gen_risk_matrix()
    gen_value_loop()
    print(f'\n全部完成！共 10 张流程图已保存到: {OUTPUT_DIR}')
