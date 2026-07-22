"""
重新绘制 10 张流程图 — 简化配色（只用蓝灰白黑）、大字体、高清晰
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np, os, math

# 字体
FONT = None
for f in fm.fontManager.ttflist:
    if 'Microsoft YaHei' in f.name:
        FONT = f.fname; break
if not FONT:
    for f in fm.fontManager.ttflist:
        if 'SimHei' in f.name: FONT = f.fname; break
if FONT:
    fm.fontManager.addfont(FONT)
    font_prop = fm.FontProperties(fname=FONT)
    matplotlib.rcParams['font.family'] = font_prop.get_name()

OUT = r'd:\zhuomian\gjcx\assets\flowcharts'
os.makedirs(OUT, exist_ok=True)

# 极简配色
DARK  = '#2C3E50'
BLUE  = '#2980B9'
MID   = '#5DADE2'
LIGHT = '#D6EAF8'
LIGHT2 = '#EBF5FB'
GRAY  = '#7F8C8D'
LGRAY = '#BDC3C7'
WHITE = '#FFFFFF'
RED   = '#C0392B'
GREEN = '#27AE60'
ORANGE= '#E67E22'

def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=250, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f'  OK {name}')

def box(ax, x, y, w, h, text, bg, fontsize=11, tc='white', bold=True):
    b = FancyBboxPatch((x,y), w, h, boxstyle="round,pad=0.15", facecolor=bg, edgecolor=WHITE, linewidth=2)
    ax.add_patch(b)
    ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=fontsize, color=tc, fontweight='bold' if bold else 'normal')
    return b

def arrow(ax, x1, y1, x2, y2, color=GRAY):
    ax.annotate('', xy=(x2,y2), xytext=(x1,y1), arrowprops=dict(arrowstyle='->', color=color, lw=2.5))

def label(ax, x, y, text, fontsize=10, color=DARK, bold=False, rotation=0, alpha=1.0):
    ax.text(x, y, text, ha='center', va='center', fontsize=fontsize, color=color,
            fontweight='bold' if bold else 'normal', rotation=rotation, alpha=alpha)


# ====== 图1: 产品架构 ======
def gen_arch():
    fig, ax = plt.subplots(1,1, figsize=(18,10.5))
    ax.set_xlim(0,18); ax.set_ylim(0,10.5); ax.axis('off')
    label(ax,9,10.1,'智农云 SaaS 平台整体架构',fontsize=18,color=DARK,bold=True)

    # 第一层
    box(ax,0.5,8.3,17,1.3,'',LIGHT,tc=DARK)
    label(ax,9,9.5,'应用服务层 — 八大功能模块',fontsize=13,color=DARK,bold=True)
    mods = [('数据总览\n驾驶舱',BLUE),('AI病虫害\n识别预警',BLUE),('精准农事\n水肥决策',BLUE),
            ('产量预测\n农事规划',BLUE),('数字化\n农场管理',BLUE),('设备监控\n远程控制',BLUE),
            ('农产品\n溯源管理',BLUE),('权限管理\n多账号协同',BLUE)]
    for i,(t,c) in enumerate(mods):
        box(ax,0.9+i*2.1,8.45,1.9,0.95,t,c,fontsize=8.5)

    # 第二层
    box(ax,0.5,6.3,17,1.2,'',LIGHT2,tc=DARK)
    label(ax,9,7.4,'数据中台层 — DataService 数据引擎',fontsize=13,color=DARK,bold=True)
    for i,t in enumerate(['数据汇聚\nETL清洗','实时查询\n引擎','聚合分析\n引擎','权限管控\n中间件']):
        box(ax,1.5+i*4,6.4,3.5,0.85,t,MID,fontsize=9.5)

    # 第三层
    box(ax,0.5,4.3,17,1.2,'',LIGHT,tc=DARK)
    label(ax,9,5.4,'IoT 设备层 — 物联网感知与控制',fontsize=13,color=DARK,bold=True)
    for i,t in enumerate(['土壤传感器\n温湿度/pH/NPK','气象站\n风速/雨量/光照','智能摄像头\nAI视觉分析','灌溉控制器\n电磁阀/流量计','施肥机\n配比/搅拌/输出','MQTT网关\n协议转换/边缘计算']):
        box(ax,0.9+i*2.75,4.4,2.5,0.95,t,BLUE,fontsize=7.2)

    # 第四层
    box(ax,0.5,2.3,17,1.2,'',LIGHT2,tc=DARK)
    label(ax,9,3.4,'终端接入层 — 多端覆盖',fontsize=13,color=DARK,bold=True)
    for i,t in enumerate(['Web 管理端\n桌面浏览器','iOS App\n苹果手机','Android App\n安卓手机','微信小程序\n扫码即用','数据大屏\n指挥中心','API 开放平台\n第三方集成']):
        box(ax,0.9+i*2.75,2.4,2.5,0.95,t,GRAY,fontsize=7.2)

    # 箭头连接各层
    for y1,y2 in [(8.3,7.5),(6.3,5.5),(4.3,3.5)]:
        arrow(ax,15.5,y1,15.5,y2,GRAY)
    # 右侧: 安全贯穿
    box(ax,16,4.3,1.3,5.3,'安\n全\n防\n护\n体\n系',RED,fontsize=8)
    save(fig,'01_arch.png')

# ====== 图2: 获客渠道 ======
def gen_channels():
    fig, ax = plt.subplots(1,1, figsize=(16,8.5))
    ax.set_xlim(0,16); ax.set_ylim(0,8.5); ax.axis('off')
    label(ax,8,8.1,'客户获取渠道体系',fontsize=18,color=DARK,bold=True)

    box(ax,6,6.8,4,0.8,'目标客户',DARK,fontsize=14)

    branches = [
        (1,'直销团队\n占比 40%',['参加农业行业展会','行业协会推荐引荐','打造标杆客户案例','直销团队上门拜访']),
        (6.5,'渠道合作\n占比 35%',['农资经销商联合推广','承接政府智慧农业项目','科研院所产学研合作','农业合作社批量签约']),
        (11.5,'线上获客\n占比 25%',['短视频平台内容营销','搜索引擎 SEO/SEM','行业论坛白皮书传播','农业自媒体矩阵运营']),
    ]
    for bx,label_text,items in branches:
        box(ax,bx+0.3,5.5,2.8,0.7,label_text,BLUE,fontsize=10.5)
        for j,item in enumerate(items):
            box(ax,bx,4.0+j*0.45,4.0,0.42,item,LIGHT,tc=DARK,fontsize=7.5,bold=False)
        arrow(ax,8,6.7,bx+1.7,6.2,GRAY)

    # 漏斗
    steps=[(8,1.8,14,'潜在客户池  10,000+'),(8.5,1.0,13,'有效线索  2,000+'),(9,0.2,12,'签约客户  200+')]
    for x,y,w,t in steps:
        box(ax,x,y,w-2*x,0.65,t,BLUE if '签约' in t else MID,fontsize=10)
    label(ax,8,2.6,'销售漏斗转化',fontsize=11,color=GRAY)
    save(fig,'02_channels.png')

# ====== 图3: 组织架构 ======
def gen_org():
    fig, ax = plt.subplots(1,1, figsize=(16,9))
    ax.set_xlim(0,16); ax.set_ylim(0,9); ax.axis('off')
    label(ax,8,8.5,'核心团队组织架构',fontsize=18,color=DARK,bold=True)

    box(ax,6,7.0,4,0.85,'CEO / 创始人',DARK,fontsize=14)
    arrows = [(1.5,'CTO\n技术负责人',8,7.0),(6,'COO\n运营负责人',8,7.0),(10.5,'销售总监',8,7.0)]
    for x,t,fx,fy in arrows:
        box(ax,x,5.2,3,0.7,t,BLUE,fontsize=11)
        arrow(ax,8,7.0,x+1.5,5.9,GRAY)

    teams = [
        (0.3,'AI算法\n工程师',2), (2.0,'前端\n工程师',2), (3.7,'后端\n工程师',2), (5.2,'产品\n设计师',1),
        (6.5,'客户成功\n经理',2), (8.2,'农业专家\n顾问',2),
        (10.8,'直销团队',2), (12.5,'渠道管理',2),
    ]
    for x,t,c in teams:
        box(ax,x,3.3,1.55,0.95,t,MID,fontsize=9,tc=WHITE)

    box(ax,4,1.5,8,0.8,'初期团队规模: 13 人    |    技术研发: 7 人    |    运营管理: 4 人    |    销售市场: 4 人',LIGHT,tc=DARK,fontsize=10.5,bold=False)
    save(fig,'03_org.png')

# ====== 图4: 路线图 ======
def gen_roadmap():
    fig, ax = plt.subplots(1,1, figsize=(18,8.5))
    ax.set_xlim(0,18); ax.set_ylim(0,8.5); ax.axis('off')
    label(ax,9,8.2,'产品发展路线图 (2024-2027)',fontsize=18,color=DARK,bold=True)

    months = ['0月','3月','6月','9月','12月','15月','18月','21月','24月','27月','30月','33月','36月','39月','42月']
    for i,m in enumerate(months):
        x=1+i*1.15
        ax.axvline(x=x,ymin=0.15,ymax=0.92,color=LGRAY,lw=1,ls='--')
        label(ax,x,7.8,m,fontsize=6.5,color=GRAY)

    phases = [
        (1,5.5,4.2,'Phase 1: MVP 验证期 (0-6月)','后端API开发 | AI模型训练 | IoT网关开发 | 种子客户试用',LIGHT),
        (5.4,5.5,4.2,'Phase 2: 产品成熟期 (6-18月)','V1.0正式发布 | 移动端App | 产量预测AI | 渠道体系建设',LIGHT2),
        (9.8,5.5,4.2,'Phase 3: 规模扩张期 (18-36月)','开放API平台 | 数据中台 | 智能农机调度 | 海外市场探索',LIGHT),
        (14.2,5.5,3.5,'Phase 4\n生态构建\n(36月+)','农业AI大模型 | 碳汇交易 | 保险精算 | IPO/并购',LIGHT2),
    ]
    for x,y,w,title,detail,bg in phases:
        box(ax,x,y,w,1.6,'',bg,tc=DARK)
        label(ax,x+w/2,y+1.15,title,fontsize=11,color=DARK,bold=True)
        label(ax,x+w/2,y+0.5,detail,fontsize=7.5,color=GRAY)

    # 里程碑
    ms = [(3.3,'MVP\n完成'), (7.7,'产品\n发布'), (12.1,'PMF\n验证'), (16.5,'盈利\n拐点')]
    for x,t in ms:
        box(ax,x-0.5,7.0,1,0.6,t,DARK,fontsize=8)
        ax.plot(x,6.85,'v',color=DARK,markersize=10)
        ax.plot([x,x],[6.5,6.85],color=DARK,lw=2,ls='--')

    targets=[(1.0,'种子客户: 5 家'),(5.4,'付费客户: 50-80 家'),(9.8,'付费客户: 200-400 家'),(14.2,'付费客户: 500+ 家')]
    for x,t in targets:
        box(ax,x,0.5,4,0.6,t,BLUE,fontsize=9.5)
    save(fig,'04_roadmap.png')

# ====== 图5: 商业模式 ======
def gen_bizmodel():
    fig, ax = plt.subplots(1,1, figsize=(16,9))
    ax.set_xlim(0,16); ax.set_ylim(0,9); ax.axis('off')
    label(ax,8,8.6,'商业模式 — 收入来源结构',fontsize=18,color=DARK,bold=True)

    # 左侧: SaaS
    box(ax,0.3,4.5,7.2,3.6,'',LIGHT,tc=DARK)
    label(ax,3.9,7.8,'核心收入: SaaS 订阅费',fontsize=14,color=DARK,bold=True)
    saas = [('基础版','小型农场 (<100亩)','数据看板+农场管理+溯源','0.98 万元/年'),
            ('专业版','中型农场 (100-500亩)','基础版+病虫害AI+农事AI+设备监控','4.8 万元/年'),
            ('企业版','大型集团 (500+亩)','全功能+私有化部署+定制开发','12-50 万元/年')]
    for i,(v,t,f,p) in enumerate(saas):
        y=6.5-i*0.85
        box(ax,0.8,y,6.2,0.72,f'{v}  |  {t}',BLUE,fontsize=9)
        label(ax,7.0,y+0.36,f'{f}: {p}',fontsize=7.5,color=DARK)

    # 右侧: 增值
    box(ax,8,4.5,7.7,3.6,'',LIGHT2,tc=DARK)
    label(ax,11.85,7.8,'增值服务收入',fontsize=14,color=DARK,bold=True)
    adds = [('IoT 硬件套装','土壤传感器+气象站+网关','0.8-1.5 万元/套'),
            ('AI 模型定制','细分作物识别/预测模型训练','5-20 万元/次'),
            ('私有化部署','本地服务器部署及运维','10-30 万元/次'),
            ('培训 + API 接口','现场培训+政府平台对接','0.5-5 万元/年')]
    for i,(t,d,p) in enumerate(adds):
        y=6.8-i*0.85
        box(ax,8.5,y,6.7,0.72,f'{t}  —  {d}',MID,fontsize=8.5)
        label(ax,8.5+3.35,y-0.18,p,fontsize=7.5,color=DARK)

    # 底部: 3年增长
    label(ax,8,3.3,'3 年收入增长预测',fontsize=13,color=DARK,bold=True)
    data = [(3.0,0.6,480,'第1年'),(3.0,1.45,1200,'第2年'),(3.0,2.3,2400,'第3年')]
    for x,y,v,yr in data:
        w=v/350*10
        box(ax,x,y,w,0.6,'',BLUE,fontsize=0)
        label(ax,x+w/2,y+0.3,f'{yr}  ¥{v}万元',fontsize=10.5,color=DARK,bold=True)
    # 客户数
    for i,(y,v) in enumerate([(0.6,60),(1.45,180),(2.3,400)]):
        box(ax,14.5,y,1.2,0.6,f'{v}家',BLUE,fontsize=9.5)
    safe_label = ax.text(15.1,3.0,'客户',fontsize=8,color=GRAY,ha='center')
    save(fig,'05_bizmodel.png')

# ====== 图6: 竞争矩阵 ======
def gen_compete():
    fig, ax = plt.subplots(1,1, figsize=(14,9))
    ax.set_xlim(0,10); ax.set_ylim(0,10); ax.set_facecolor(WHITE)
    ax.arrow(1.5,1.5,7.5,0,head_width=0.12,head_length=0.15,fc=GRAY,ec=GRAY,lw=2)
    ax.arrow(1.5,1.5,0,7.5,head_width=0.12,head_length=0.15,fc=GRAY,ec=GRAY,lw=2)
    label(ax,5.5,0.8,'功能完整度 (模块覆盖数量 + 场景适配) →',fontsize=10,color=GRAY)
    label(ax,0.6,5.5,'AI 能力深度\n(识别准确率 +\n决策智能度) →',fontsize=8,color=GRAY)

    comps = [
        (3.5,2.8,0.9,'传统农业\n信息化厂商',LGRAY),
        (6.8,2.5,0.85,'硬件厂商\n(大疆/极飞)',LGRAY),
        (7.5,6.0,1.2,'互联网巨头\n(阿里/京东)',MID),
        (4.2,5.0,0.8,'创业公司\n(丰疆/麦飞)',MID),
        (8.5,8.2,1.6,'智农云',DARK),
    ]
    for x,y,r,t,c in comps:
        circle=plt.Circle((x,y),r,facecolor=c,edgecolor=WHITE,linewidth=3,alpha=0.85,zorder=5)
        ax.add_patch(circle)
        label(ax,x,y,t,fontsize=7.5 if c==DARK else 6.5,color=WHITE,bold=True)

    label(ax,9.5,1.5,'★ 推荐定位',fontsize=9,color=DARK,bold=True)
    save(fig,'06_compete.png')

# ====== 图7: 技术架构 ======
def gen_tech():
    fig, ax = plt.subplots(1,1, figsize=(16,9.5))
    ax.set_xlim(0,16); ax.set_ylim(0,9.5); ax.axis('off')
    label(ax,8,9.2,'技术架构层次图',fontsize=18,color=DARK,bold=True)

    layers = [
        (7.8,'展示层',['React / Vue SPA 前端框架','Tailwind CSS 响应式布局','Chart.js 数据可视化','PWA 渐进式 Web 应用']),
        (6.2,'API 网关层',['FastAPI 高性能异步框架','RESTful / GraphQL 接口','JWT 身份认证与鉴权','API 限流与熔断保护']),
        (4.6,'业务服务层',['病虫害 AI 识别引擎','产量预测 ML 模型','农事智能决策引擎','产品溯源服务']),
        (3.0,'数据存储层',['PostgreSQL 业务数据库','TimescaleDB 时序数据库','Redis 高速缓存','MinIO 对象存储']),
        (1.4,'基础设施层',['Kubernetes 容器编排','Docker 容器化部署','MQTT / EMQX 消息中间件','区块链存证 (可选)']),
    ]
    for y,title,items in layers:
        box(ax,0.3,y-0.6,15.4,1.35,'',LIGHT if layers.index((y,title,items))%2==0 else LIGHT2,tc=DARK)
        label(ax,1.2,y+0.4,title,fontsize=12,color=DARK,bold=True)
        for j,item in enumerate(items):
            box(ax,3.2+j*3.2,y-0.45,2.9,0.7,item,BLUE,fontsize=8)

        if layers.index((y,title,items)) < len(layers)-1:
            arrow(ax,14,layers[layers.index((y,title,items))+1][0]+0.6,14,y-0.7,GRAY)

    box(ax,0.3,1.0,1.2,7.5,'安\n全\n运\n维\n监\n控',DARK,fontsize=7.5)
    save(fig,'07_tech.png')

# ====== 图8: 财务预测 ======
def gen_finance():
    fig, ax = plt.subplots(1,1, figsize=(14,8))
    ax.set_facecolor(WHITE)
    years=['第1年','第2年','第3年']
    rev=[480,1200,2400]; cost=[690,918,1178]; prof=[-210,282,1222]; cust=[60,180,400]
    x=np.arange(len(years)); w=0.28
    b1=ax.bar(x-w,rev,w,label='营业收入',color=BLUE,edgecolor=WHITE)
    b2=ax.bar(x,cost,w,label='营业成本',color=MID,edgecolor=WHITE)
    b3=ax.bar(x+w,prof,w,label='净利润',color=DARK,edgecolor=WHITE)
    for b in b1: ax.text(b.get_x()+b.get_width()/2,b.get_height()+30,f'{int(b.get_height())}',ha='center',fontsize=11,fontweight='bold',color=DARK)
    for b in b2: ax.text(b.get_x()+b.get_width()/2,b.get_height()+20,f'{int(b.get_height())}',ha='center',fontsize=9,color=GRAY)
    for b in b3:
        yp=b.get_height()+15 if b.get_height()>0 else b.get_height()-70
        ax.text(b.get_x()+b.get_width()/2,yp,f'{int(b.get_height())}',ha='center',fontsize=11,fontweight='bold',color=DARK)
    ax2=ax.twinx()
    ax2.plot(x,cust,'o-',color=DARK,lw=3,markersize=12,label='付费客户数')
    for i,c in enumerate(cust): ax2.text(i,c+18,f'{c}家',ha='center',fontsize=11,fontweight='bold',color=DARK)
    ax.set_xticks(x); ax.set_xticklabels(years,fontsize=13)
    ax.set_ylabel('金额 (万元)',fontsize=11); ax2.set_ylabel('客户数 (家)',fontsize=11)
    ax.set_title('3 年财务预测',fontsize=16,fontweight='bold',color=DARK,pad=15)
    ax.legend(loc='upper left',fontsize=10); ax2.legend(loc='upper right',fontsize=10)
    ax.grid(axis='y',alpha=0.2,color=LGRAY)
    ax.set_ylim(-450,2800)
    plt.tight_layout()
    save(fig,'08_finance.png')

# ====== 图9: 风险矩阵 ======
def gen_risk():
    fig, ax = plt.subplots(1,1, figsize=(13,8))
    ax.set_xlim(0,5); ax.set_ylim(0,5); ax.axis('off')
    ax.arrow(0.5,0.5,4.2,0,head_width=0.08,head_length=0.1,fc=DARK,ec=DARK,lw=2)
    ax.arrow(0.5,0.5,0,4.2,head_width=0.08,head_length=0.1,fc=DARK,ec=DARK,lw=2)
    label(ax,2.6,0.15,'发生概率 →',fontsize=10,color=DARK)
    label(ax,0.15,2.6,'影响程度 →',fontsize=10,color=DARK,rotation=True)

    regions=[(0.5,0.5,1.5,1.5,LIGHT,'低风险区域'),(2.0,0.5,1.5,1.5,LIGHT2,'中低风险区域'),
             (0.5,2.0,1.5,1.5,LIGHT2,'中高风险区域'),(2.0,2.0,1.5,1.5,'#F5B7B1','高风险区域')]
    for rx,ry,rw,rh,clr,tx in regions:
        rect=FancyBboxPatch((rx,ry),rw,rh,boxstyle="round,pad=0.05",facecolor=clr,edgecolor=WHITE,linewidth=1,alpha=0.5)
        ax.add_patch(rect)
        label(ax,rx+rw/2,ry+rh/2,tx,fontsize=9,color=DARK,alpha=0.3)

    risks=[(1.3,3.5,0.28,'政策变化'),(1.8,1.5,0.30,'人才招聘'),(2.8,2.3,0.32,'客户教育'),
           (2.2,3.2,0.32,'数据安全'),(3.3,2.8,0.34,'市场竞争'),(3.5,3.5,0.40,'产品落地'),
           (3.8,3.2,0.38,'现金流')]
    for rx,ry,rs,lb in risks:
        circle=plt.Circle((rx,ry),rs,facecolor=DARK if rs>=0.34 else GRAY,edgecolor=WHITE,linewidth=2,alpha=0.85)
        ax.add_patch(circle)
        label(ax,rx,ry,lb,fontsize=7.5,color=WHITE,bold=True)
    save(fig,'09_risk.png')

# ====== 图10: 价值闭环 ======
def gen_loop():
    fig, ax = plt.subplots(1,1, figsize=(12,10))
    ax.set_xlim(-5.5,5.5); ax.set_ylim(-5.5,5.5); ax.set_aspect('equal'); ax.axis('off')
    label(ax,0,5.2,'客户价值闭环',fontsize=18,color=DARK,bold=True)

    nodes=[('数据采集','传感器+IoT\n实时监测'),('AI 分析','病虫害识别\n产量预测'),
           ('智能决策','灌溉施肥\n农事方案'),('精准执行','远程控制\n自动化作业'),
           ('效果评估','投入产出\n效益分析'),('持续优化','模型迭代\n方案调优')]
    R=3.3
    for i,(t,d) in enumerate(nodes):
        ang=math.pi/2-i*2*math.pi/6
        x=R*math.cos(ang); y=R*math.sin(ang)
        circle=plt.Circle((x,y),1.2,facecolor=BLUE,edgecolor=WHITE,linewidth=3,alpha=0.9)
        ax.add_patch(circle)
        label(ax,x,y+0.25,t,fontsize=11,color=WHITE,bold=True)
        label(ax,x,y-0.40,d,fontsize=7,color=WHITE)

    for i in range(6):
        a1=math.pi/2-i*2*math.pi/6; a2=math.pi/2-((i+1)%6)*2*math.pi/6
        ma=(a1+a2)/2; mx=(R+1.5)*math.cos(ma); my=(R+1.5)*math.sin(ma)
        label(ax,mx,my,'➤',fontsize=16,color=GRAY,bold=True)

    circle=plt.Circle((0,0),1.1,facecolor=WHITE,edgecolor=DARK,linewidth=4)
    ax.add_patch(circle)
    label(ax,0,0.2,'智农云',fontsize=14,color=DARK,bold=True)
    label(ax,0,-0.4,'智慧农业平台',fontsize=9,color=GRAY)
    save(fig,'10_loop.png')

# ====== MAIN ======
if __name__=='__main__':
    print('Generating simplified flowcharts...')
    gen_arch(); gen_channels(); gen_org(); gen_roadmap(); gen_bizmodel()
    gen_compete(); gen_tech(); gen_finance(); gen_risk(); gen_loop()
    print(f'All 10 charts saved to {OUT}')
