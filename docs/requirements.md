# 云南特色农业智能诊断与生产管理平台 需求规格说明书

---

## 文档信息

| 项目 | 内容 |
|---|---|
| 项目名称 | 云南特色农业智能诊断与生产管理平台 |
| 选题编号 | 选题三 |
| 文档版本 | V1.0 |
| 编制日期 | 2026-07-22 |
| 编制人 | 项目组 |

---

## 目录

1. [引言](#1-引言)
   - 1.1 项目背景
   - 1.2 项目目标
   - 1.3 适用范围
2. [用户故事](#2-用户故事)
3. [用例图](#3-用例图)
4. [功能需求](#4-功能需求)
5. [非功能需求](#5-非功能需求)
6. [数据字典](#6-数据字典)
7. [验收标准](#7-验收标准)

---

## 1. 引言

### 1.1 项目背景

云南省地处低纬高原，立体气候特征显著，拥有丰富多样的农业资源，是全国重要的高原特色农业产区。茶叶、咖啡、花卉、中药材、水果、蔬菜等特色作物种植面积持续扩大，农业在云南国民经济中占有举足轻重的地位。

然而，云南农业发展仍面临诸多严峻挑战：

- **病虫害损失严重**：据农业农村部统计，云南省每年因病虫害导致的农作物损失高达总产量的30%以上。以普洱茶产区为例，茶饼病、茶毛虫等主要病虫害年均发生面积超过200万亩，直接经济损失超过15亿元。花卉产业中，灰霉病、白粉病等病害导致切花品质下降，每年造成的经济损失约占产值的20%-25%。
- **农技服务供给不足**：全省乡镇级农技推广人员人均服务耕地面积超过5000亩，远高于全国平均水平。偏远山区农户获取专业农技指导的渠道极为有限，往往依赖经验判断，导致病虫害错过最佳防治窗口期。
- **生产管理粗放**：大部分中小农户仍采用传统种植管理模式，缺乏精细化的地块管理、农事记录和产量预测手段。合作社层面普遍存在信息孤岛，生产数据分散、标准不统一，难以支撑科学决策。
- **数字化转型迫切**：云南省"十四五"数字经济发展规划明确提出，要加快农业数字化转型，推动人工智能、大数据、物联网等新一代信息技术与农业深度融合，建设一批智慧农业示范项目。

在此背景下，人工智能技术的快速发展为精准农业带来了新的契机。基于深度学习的图像识别技术在作物病虫害诊断领域已取得突破性进展，识别准确率在多个公开数据集上超过95%。同时，大语言模型（LLM）与检索增强生成（RAG）技术的成熟，使得构建具备专业农业知识问答能力的智能决策系统成为可能。多Agent协作框架的兴起，为打通"感知-诊断-决策-执行"的全链路智能化提供了技术基础。

本平台旨在整合计算机视觉、大语言模型、物联网数据采集和知识图谱等前沿技术，构建一个面向云南特色农业的智能诊断与生产管理一体化平台，为农户、农技人员、合作社管理者和政府监管部门提供全方位、多层次的数字化服务。

### 1.2 项目目标

本项目的总体目标是构建一个集病虫害智能识别、农业生产管理、市场风险预警和知识服务于一体的综合管理平台，具体目标包括：

1. **病虫害智能诊断**：基于深度学习图像识别技术，实现云南主要特色作物（茶叶、花卉、中药材、蔬菜、水果）常见病虫害的自动识别，目标Top-3识别准确率达到92%以上，平均响应时间不超过3秒。
2. **农业生产全流程管理**：提供地块管理、作物管理、种植周期跟踪、农事任务调度等核心功能，帮助农户和合作社实现生产过程的数字化和标准化。
3. **产量预测与风险评估**：结合历史产量数据、气象数据、土壤数据和作物生长模型，利用机器学习算法对未来产量进行预测，并对病虫害爆发风险和市场波动风险进行提前预警。
4. **农业知识智能问答**：基于RAG（检索增强生成）技术，构建农业知识库，使农户能够通过自然语言提问获取专业的种植技术、病虫害防治、施肥管理等方面的建议。
5. **多Agent智能决策**：构建多Agent协作框架，实现感知Agent（数据采集）、诊断Agent（病虫害识别）、决策Agent（防治方案生成）和执行Agent（任务调度）的协同工作。
6. **物联网设备集成**：支持接入田间气象站、土壤传感器、视频监控等IoT设备，实现环境数据的实时采集与监控。
7. **农产品溯源**：建立从种植、施肥、用药到采收的全流程追溯体系，对接云南省农产品质量安全追溯平台，增强消费者信任。

### 1.3 适用范围

本平台适用于以下场景和用户群体：

- **适用作物**：茶叶（普洱茶、滇红茶）、花卉（玫瑰、康乃馨、百合）、中药材（三七、天麻、重楼）、蔬菜（番茄、辣椒、白菜）、水果（柑橘、芒果、葡萄）等云南特色经济作物。
- **适用区域**：云南省16个州市的农业生产区，重点覆盖普洱、临沧、西双版纳、红河、大理、昆明等主要农业产区。
- **适用规模**：可灵活适配小农户（< 10亩）、家庭农场（10-100亩）、农民专业合作社（100-1000亩）及大型农业企业（> 1000亩）等不同经营规模。
- **适用环节**：覆盖产前（种植规划、品种选择）、产中（田间管理、病虫害防治、水肥管理）、产后（采收、初加工、销售）全产业链环节。
- **不适用范围**：本平台不替代专业实验室检测（如农药残留定量检测、土壤重金属检测等需要专业仪器设备的内容），不提供法律效力级别的农产品认证服务。

---

## 2. 用户故事

### US-01 农户地块与作物管理
**作为** 一名种植茶叶的农户，
**我希望** 能够在平台上创建和管理我的地块信息，记录每个地块上种植的作物品种、种植时间和面积，
**以便** 我对自己的农业生产资产有清晰的数字化台账，方便后续的农事管理和产品溯源。

### US-02 农户病虫害图片诊断
**作为** 一名种植花卉的花农，
**我希望** 能够通过手机拍照上传疑似患病作物的照片，系统自动识别病虫害类型并给出防治建议，
**以便** 我能够在病害发生初期就获得准确的诊断信息，及时采取防治措施，减少经济损失。

### US-03 农户农事任务管理
**作为** 一名种植蔬菜的农户，
**我希望** 能够根据系统推荐的种植日历创建农事任务（如施肥、浇水、打药、采收），并收到任务提醒通知，
**以便** 我不遗漏关键农事节点，确保作物在最佳时期得到相应的管理措施。

### US-04 农技人员审核诊断结果
**作为** 一名乡镇农技推广站的技术人员，
**我希望** 能够查看辖区内农户提交的病虫害识别记录，对AI识别结果进行审核确认或纠正，并补充专业的防治方案，
**以便** 我能够发挥专业优势，弥补AI可能存在的误判，确保农户获得可靠的技术指导。

### US-05 农技人员知识库维护
**作为** 一名县级植保站的专家，
**我希望** 能够将本地区常见的病虫害图谱、防治技术和用药标准录入平台知识库，
**以便** 积累和沉淀本地化农业知识，提升AI诊断模型在本地场景下的准确性和适配性。

### US-06 合作社生产数据看板
**作为** 一名农民专业合作社的管理人员，
**我希望** 能够在一个统一的仪表板上查看合作社所有成员的生产数据汇总，包括种植面积分布、作物长势概况、病虫害发生情况和农事任务完成率，
**以便** 我能够全面掌握合作社的生产运营状况，及时发现异常情况并进行协调调度。

### US-07 合作社市场风险预警
**作为** 一名合作社的销售负责人，
**我希望** 能够查看主要农产品的市场批发价格走势、供需分析和价格波动预警，
**以便** 我能够把握最佳销售时机，合理安排采收和上市计划，降低市场价格波动带来的经营风险。

### US-08 合作社产量预测
**作为** 一名合作社的生产计划人员，
**我希望** 能够基于历史产量数据、当前作物生长状况和气象预测，获得未来1-3个月的产量预估，
**以便** 我能够提前对接销售渠道、安排仓储物流和协调用工需求。

### US-09 管理员模型版本管理
**作为** 一名平台系统管理员，
**我希望** 能够管理AI病虫害识别模型的版本，包括部署新版本、回滚旧版本、对比不同版本的准确率指标，
**以便** 确保平台始终使用最优的识别模型为用户提供服务，并能够在出现问题时快速回滚。

### US-10 管理员用户权限管理
**作为** 一名平台系统管理员，
**我希望** 能够创建和管理用户账号，按角色（农户、农技人员、合作社管理员、系统管理员）分配权限，查看用户操作日志，
**以便** 保障平台数据安全，确保不同角色用户只能访问和操作其权限范围内的功能。

### US-11 农户产品溯源查询
**作为** 一名消费者，
**我希望** 能够通过扫描农产品包装上的二维码，查看该产品从种植、施肥、用药到采收的全过程记录，
**以便** 我能够放心购买，了解所购农产品的生产过程，增强对产品的信任。

### US-12 农技人员Agent决策辅助
**作为** 一名农技人员，
**我希望** 能够使用平台的多Agent决策功能，输入一个复杂的农业问题（如"三七连作障碍的综合解决方案"），系统能够自动检索相关知识、分析影响因素并生成结构化的决策建议，
**以便** 我能够高效处理复杂的农业技术咨询，为农户提供更全面、更专业的服务。

---

## 3. 用例图

### 3.1 参与者（Actor）定义

| Actor ID | Actor 名称 | 描述 |
|---|---|---|
| ACT-01 | 农户（Farmer） | 平台的核心使用者，进行地块管理、病虫害上报、农事操作记录等 |
| ACT-02 | 农技人员（Technician） | 农业技术推广人员，负责诊断审核、防治建议、知识库维护 |
| ACT-03 | 合作社管理员（Cooperative Manager） | 合作社/农业企业的管理人员，查看生产数据、进行经营决策 |
| ACT-04 | 系统管理员（System Admin） | 平台运维管理人员，负责用户权限、模型版本、系统配置 |
| ACT-05 | 消费者（Consumer） | 终端消费者，通过扫码查询农产品溯源信息 |
| ACT-06 | IoT设备（IoT Device） | 外部系统参与者，田间传感器和气象站等设备自动上报数据 |
| ACT-07 | 第三方数据服务（Third-party Data Service） | 外部系统参与者，提供气象预报和市场行情数据 |

### 3.2 用例（Use Case）列表

| UC ID | 用例名称 | 简要描述 | 主要参与者 |
|---|---|---|---|
| UC-01 | 注册登录 | 用户注册账号并登录平台 | 所有用户 |
| UC-02 | 地块管理 | 创建、编辑、查看地块信息（位置、面积、土壤类型） | 农户, 合作社管理员 |
| UC-03 | 作物管理 | 记录地块种植的作物品种、种植时间和管理周期 | 农户 |
| UC-04 | 病虫害图像上传与识别 | 拍照上传作物图片，获取AI病虫害识别结果 | 农户 |
| UC-05 | 识别结果审核 | 审核AI诊断结果，确认或修正，补充防治方案 | 农技人员 |
| UC-06 | 农事任务管理 | 创建、指派、跟踪农事任务的执行情况 | 农户, 合作社管理员 |
| UC-07 | 产量预测 | 基于多源数据对未来产量进行预测 | 合作社管理员 |
| UC-08 | 设备监控 | 查看田间IoT设备的实时数据和运行状态 | 农户, 合作社管理员 |
| UC-09 | 天气服务 | 查看实时天气和未来天气预报 | 所有用户 |
| UC-10 | 市场行情查询 | 查询农产品的市场批发价格和价格走势 | 合作社管理员, 农户 |
| UC-11 | 产品溯源 | 查看农产品从种植到销售的全流程追溯信息 | 消费者, 农户 |
| UC-12 | 知识库检索（RAG） | 通过自然语言提问获取农业专业知识解答 | 农户, 农技人员 |
| UC-13 | Agent决策咨询 | 提交复杂农业问题，获取多Agent协作的决策建议 | 农技人员, 合作社管理员 |
| UC-14 | 用户权限管理 | 管理用户账号、角色和权限 | 系统管理员 |
| UC-15 | 模型版本管理 | 管理AI识别模型和RAG模型的版本迭代 | 系统管理员 |
| UC-16 | 知识库管理 | 维护和更新农业知识文档内容 | 农技人员, 系统管理员 |
| UC-17 | 数据看板 | 查看生产数据汇总和可视化分析 | 合作社管理员 |
| UC-18 | 自动数据采集 | IoT设备自动上报环境和土壤数据 | IoT设备 |
| UC-19 | 市场数据同步 | 从第三方接口同步市场价格数据 | 第三方数据服务 |

### 3.3 用例关系描述

**泛化关系（Generalization）：**
- 农户、农技人员、合作社管理员、系统管理员均继承自"注册用户"（Registered User），共享登录、个人信息管理、天气查询等基础用例。

**包含关系（Include）：**
- UC-04 病虫害图像上传与识别 **包含** 图像预处理（压缩、格式校验）。
- UC-05 识别结果审核 **包含** 历史识别记录的查询。
- UC-07 产量预测 **包含** 历史产量数据查询 和 气象数据查询。
- UC-11 产品溯源 **包含** 种植过程记录查询 和 农事操作记录查询。
- UC-13 Agent决策咨询 **包含** UC-12 知识库检索（RAG）。

**扩展关系（Extend）：**
- UC-04 病虫害图像上传与识别 **扩展于** 模型监控记录（当AI置信度低于阈值时，自动触发人工审核提醒）。
- UC-06 农事任务管理 **扩展于** 任务提醒通知（当任务到期前24小时未完成时，自动推送提醒）。

**参与者与用例的关联：**
- 农户 关联 UC-01, UC-02, UC-03, UC-04, UC-06, UC-08, UC-09, UC-10, UC-11, UC-12
- 农技人员 关联 UC-01, UC-05, UC-09, UC-12, UC-13, UC-16
- 合作社管理员 关联 UC-01, UC-02, UC-06, UC-07, UC-08, UC-09, UC-10, UC-13, UC-17
- 系统管理员 关联 UC-01, UC-14, UC-15, UC-16
- 消费者 关联 UC-11
- IoT设备 关联 UC-18
- 第三方数据服务 关联 UC-19

---

## 4. 功能需求

### FR-01 农场与地块管理

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-01 |
| **需求名称** | 农场与地块管理 |
| **优先级** | 高（P0） |
| **描述** | 系统应提供农场和地块的完整生命周期管理功能。农户可以在平台上创建农场，录入农场基本信息（名称、地址、经纬度坐标、总面积），并在农场下创建多个地块。每个地块应记录地块编号、面积、土壤类型、灌溉条件、海拔高度等详细信息。支持地块信息的地理可视化展示（基于Leaflet/OpenLayers的地图标注）。合作社管理员可查看和管理旗下所有成员的农场与地块信息。 |

**核心功能点：**
1. 农场创建、编辑、删除（软删除）和搜索。
2. 地块创建、编辑、删除和按农场分组展示。
3. 地图可视化：在地图上标注地块位置，支持卫星影像底图切换。
4. 批量导入：支持通过Excel模板批量导入地块数据。
5. 地块状态标记：种植中、休耕中、已流转等状态管理。
6. 地块历史记录查看：追溯地块的种植历史和使用变更。

---

### FR-02 作物与种植周期管理

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-02 |
| **需求名称** | 作物与种植周期管理 |
| **优先级** | 高（P0） |
| **描述** | 系统应支持作物品种库的管理，预置云南主要特色作物品种信息（名称、生长周期天数、适宜温度范围、常见病虫害列表）。农户可将作物品种关联到具体地块，创建种植周期记录，包括种植日期、预期采收日期、种植密度、种苗来源等。系统自动根据作物品种信息生成推荐农事日历。 |

**核心功能点：**
1. 作物品种库的查询和维护（管理员可增删改）。
2. 种植周期创建：关联地块 + 作物品种 + 种植日期。
3. 种植周期阶段自动划分：苗期、生长期、开花期、结果期、采收期。
4. 根据种植日期和品种生长周期自动推算各阶段起止日期。
5. 种植周期状态流转：进行中、已采收、已废弃。
6. 多茬口管理：同一地块的多个连续种植周期记录。

---

### FR-03 病虫害智能识别

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-03 |
| **需求名称** | 病虫害智能识别 |
| **优先级** | 高（P0） |
| **描述** | 这是平台的核心功能。农户可通过手机端拍照或从相册选择图片上传，系统调用AI病虫害识别模型进行分析。模型应返回Top-3预测结果，每项包含病虫害名称、置信度评分、病害特征描述、典型症状图示。对于置信度较低的结果（< 70%），系统应自动标记并推荐人工审核。识别记录应完整保存，支持历史查询和统计分析。 |

**核心功能点：**
1. 图片上传（支持多图同时上传，单图最大10MB）。
2. 图片预处理：自动压缩、方向校正、模糊检测。
3. AI模型调用：识别结果返回时间不超过3秒（P95）。
4. 结果展示：病虫害名称、置信度、典型症状、危害程度评估。
5. 关联防治建议：根据识别结果自动匹配知识库中的防治方案。
6. 低置信度自动标记：置信度<70%的结果标记为"待审核"。
7. 识别历史：按时间、地块、作物类型筛选和统计。
8. 用户反馈：农户可对识别结果进行"准确/不准确"评价，用于模型优化。

---

### FR-04 农事任务管理

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-04 |
| **需求名称** | 农事任务管理 |
| **优先级** | 高（P0） |
| **描述** | 系统应提供农事任务的计划、指派、执行和跟踪功能。农户可创建施肥、浇水、打药、除草、修剪、采收等类型的农事任务。任务可设置计划执行时间、负责人、关联地块/作物。系统根据种植日历自动生成推荐任务列表。任务到期前24小时发送提醒通知。任务完成后可记录执行详情（如肥料种类和用量、农药名称和稀释比例、操作时长等）。 |

**核心功能点：**
1. 任务创建：手动创建和系统自动推荐两种方式。
2. 任务类型预置：施肥、浇水、打药、除草、修剪、采收、翻耕等。
3. 任务状态流转：待执行、进行中、已完成、已取消。
4. 任务提醒：微信/短信/App推送（到期前24小时、到期时）。
5. 执行记录：操作人、执行时间、物资用量、现场照片、备注。
6. 任务日历视图：以月/周维度可视化展示农事任务安排。
7. 合作社管理员可查看所有成员的任务完成情况统计。

---

### FR-05 产量预测

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-05 |
| **需求名称** | 产量预测 |
| **优先级** | 中（P1） |
| **描述** | 系统应提供基于数据驱动的产量预测功能。利用历史产量记录、种植品种特性、气象条件（温度、降水、日照时长）、土壤数据、病虫害发生情况和农事管理水平等多维特征，采用机器学习回归模型（如XGBoost或LSTM）进行未来产量预测。预测结果以可视化方式呈现，包括预测产量、置信区间、关键影响因素分析。 |

**核心功能点：**
1. 预测模型选择：支持多种模型，管理员可配置当前使用模型。
2. 数据输入：自动聚合关联地块的历史产量、气象、土壤和农事数据。
3. 预测输出：预测产量（公斤/亩）、置信区间（90%）、趋势方向。
4. 影响因素分析：展示对预测结果贡献最大的前5个特征变量。
5. 预测准确率反馈：实际采收后对比预测值，计算误差率并反馈到模型。
6. 批量预测：合作社管理员可一键对旗下所有地块进行产量预测。
7. 预测结果导出：支持Excel和PDF格式导出。

---

### FR-06 设备监控与IoT集成

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-06 |
| **需求名称** | 设备监控与IoT集成 |
| **优先级** | 中（P1） |
| **描述** | 系统应支持接入田间物联网设备，包括气象站（温度、湿度、风速、降雨量、光照强度）、土壤传感器（土壤温度、土壤湿度、土壤EC值、土壤pH值）和视频监控设备。设备数据通过MQTT协议实时上传，平台进行数据存储、展示和异常告警。设备列表可按农场/地块进行分组管理，支持设备在线状态监控和数据历史曲线查看。 |

**核心功能点：**
1. 设备注册与管理：录入设备ID、类型、安装位置（关联地块）、通信协议。
2. 实时数据展示：仪表盘形式展示各传感器最新数值。
3. 历史数据查询：按时间范围查看传感器数据曲线图。
4. 异常告警：当监测值超出预设阈值时自动告警（如土壤湿度过低）。
5. 设备在线状态监控：离线超过30分钟自动告警。
6. 数据导出：支持传感器历史数据的CSV格式导出。
7. 视频监控：支持RTSP流媒体播放和截图抓取。

---

### FR-07 农产品溯源

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-07 |
| **需求名称** | 农产品溯源 |
| **优先级** | 中（P1） |
| **描述** | 系统应建立从种植源头到销售终端的全流程溯源体系。以种植周期为溯源主线，自动关联该批次农产品在种植过程中所有的农事操作记录（施肥、打药、浇水等）、病虫害发生与防治记录、采收记录和初加工记录。系统为每个采收批次生成唯一的溯源二维码，消费者扫描后可查看完整的生产过程信息。溯源信息应按照云南省农产品质量安全追溯相关标准进行数据组织。 |

**核心功能点：**
1. 溯源批次管理：采收时自动生成溯源批次号（格式：NY-YYYYMMDD-XXXXXX）。
2. 溯源信息自动聚合：关联种植周期下的所有农事和病虫害记录。
3. 溯源二维码生成与下载：每个批次一个唯一二维码。
4. 溯源信息展示页：消费者扫码后看到的H5页面，包含产品基本信息、种植过程时间线、农事操作详情、检测报告（如有）。
5. 溯源信息防篡改：采用哈希链或区块链存证确保数据不可篡改。
6. 溯源数据统计：合作社管理员可查看溯源批次的数量和扫码次数统计。

---

### FR-08 用户与权限管理

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-08 |
| **需求名称** | 用户与权限管理 |
| **优先级** | 高（P0） |
| **描述** | 系统应提供完善的用户认证、授权和权限管理功能。支持手机号注册和微信授权登录两种方式。预置四种系统角色：农户、农技人员、合作社管理员、系统管理员，每种角色拥有不同的功能访问权限和操作权限。系统管理员可创建自定义角色、分配权限。合作社管理员可将农户用户关联到本合作社进行统一管理。用户密码应采用安全的加密存储方式（bcrypt或Argon2）。 |

**核心功能点：**
1. 用户注册：手机号+验证码注册，或微信一键授权登录。
2. 角色预置：农户、农技人员、合作社管理员、系统管理员。
3. 权限控制：基于RBAC（基于角色的访问控制）模型。
4. 自定义角色：系统管理员可创建新角色并分配细粒度权限。
5. 合作社成员管理：合作社管理员可邀请、移除、查询成员。
6. 用户状态管理：正常、禁用、待审核。
7. 登录安全：密码错误5次锁定30分钟、支持双因素认证（可选）。
8. 会话管理：JWT Token认证，Token有效期7天，支持刷新。

---

### FR-09 天气服务

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-09 |
| **需求名称** | 天气服务 |
| **优先级** | 中（P1） |
| **描述** | 系统应集成第三方气象数据服务（如和风天气API或中国气象局开放平台），提供实时天气查询和7天天气预报功能。天气信息应根据用户农场的地理位置自动匹配，展示温度、湿度、降水概率、风速风向、日照时长等关键指标。系统应基于天气预报数据为农户提供农事操作建议（如"未来3天有降雨，不建议进行喷洒农药操作"）。支持极端天气预警推送（暴雨、霜冻、冰雹、大风等）。 |

**核心功能点：**
1. 实时天气展示：当前温度、湿度、风速、天气状况、体感温度。
2. 7天预报：每日最高/最低温度、降水概率、风力等级、天气图标。
3. 农事建议：结合天气预报和作物生长阶段生成操作建议。
4. 极端天气预警：根据气象部门发布的预警信号及时推送通知。
5. 历史天气数据：支持查询过去30天的实际天气数据，用于农事分析。
6. 多地块天气：合作社管理员可查看不同地块所在区域的天气差异。

---

### FR-10 市场行情服务

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-10 |
| **需求名称** | 市场行情与风险预警 |
| **优先级** | 中（P1） |
| **描述** | 系统应集成农产品市场数据服务（如农业农村部批发市场数据接口或惠农网API），提供云南省主要农产品批发市场的价格查询和走势分析功能。支持按农产品种类、市场、时间范围进行筛选和对比。系统应基于历史价格数据进行波动分析和趋势预测，当价格波动幅度超过预设阈值时触发预警。价格数据以折线图和表格两种形式呈现，支持数据导出。 |

**核心功能点：**
1. 价格查询：按农产品种类和市场筛选当日和历史价格。
2. 走势分析：展示7天/30天/90天/1年的价格走势折线图。
3. 价格对比：同一农产品在不同批发市场的价格对比。
4. 价格预警：当价格低于成本价或日波动超过15%时自动预警。
5. 供需分析：提供主要品类的上市量、交易量数据（如有接口支持）。
6. 行情报告：每周自动生成市场行情简报，推送至合作社管理员。
7. 数据更新频率：价格数据每日至少更新1次。

---

### FR-11 AI模型监控与管理

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-11 |
| **需求名称** | AI模型监控与管理 |
| **优先级** | 中（P1） |
| **描述** | 系统应提供AI模型（病虫害识别模型、产量预测模型等）的版本管理和性能监控功能。系统管理员可查看各模型版本的在线状态、调用量、平均响应时间、识别准确率（基于用户反馈统计）等性能指标。支持模型版本的灰度发布（按用户比例逐步放量）和快速回滚。当模型性能指标（如准确率、可用性）低于预设阈值时，系统应自动告警。模型调用的每一次请求和响应应记录详细日志。 |

**核心功能点：**
1. 模型版本列表：展示所有历史版本信息（版本号、发布时间、状态）。
2. 模型性能仪表盘：实时展示调用量QPS、P50/P95/P99响应延迟、错误率。
3. 准确率统计：基于用户"准确/不准确"反馈的准确率实时计算。
4. 灰度发布：支持按用户ID哈希比例分配流量到不同模型版本。
5. 版本回滚：一键将指定模型回滚到前一版本。
6. 使用配额管理：设置每日最大调用次数限制（按用户或全局）。
7. 告警规则：模型不可用 > 1分钟、错误率 > 5%、P95延迟 > 5秒。

---

### FR-12 RAG知识检索与Agent决策

| 属性 | 内容 |
|---|---|
| **需求ID** | FR-12 |
| **需求名称** | RAG知识检索与Agent决策 |
| **优先级** | 中（P1） |
| **描述** | 系统应构建基于检索增强生成（RAG）的农业知识问答功能。将农业技术文档、病虫害图谱、防治手册、用药标准等专业知识文档通过向量化处理后存入向量数据库（如Chroma或Milvus）。用户以自然语言提问时，系统检索最相关的知识片段，结合大语言模型生成专业回答，并标注引用来源。在此基础上构建多Agent协作框架：感知Agent负责收集用户问题和上下文数据，诊断Agent负责分析问题并检索知识，决策Agent负责合成回答并生成可操作建议。Agent决策过程应记录完整的推理链路。 |

**核心功能点：**
1. 知识库管理：文档上传、分块处理（Chunking）、向量化存储、文档版本管理。
2. RAG问答：自然语言提问 → 语义检索 → 上下文组装 → LLM生成回答。
3. 回答溯源：在回答中标注引用文档和段落，支持点击查看原文。
4. 多Agent协作：感知→诊断→决策的流水线式Agent协作框架。
5. Agent运行记录：每次Agent决策的完整运行日志（Run Log），包括每个Agent的输入、输出和执行耗时。
6. 对话记忆：支持多轮对话上下文保持（最近10轮对话）。
7. 反馈机制：用户对回答质量进行评价（有帮助/无帮助），用于持续优化。
8. Agent决策模板：预置若干常见问题的Agent决策链路模板（如病虫害诊断、施肥方案推荐）。

---

## 5. 非功能需求

### NFR-01 性能需求

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-01 |
| **需求名称** | 系统性能 |
| **描述** | 系统应在正常负载下保持良好的响应性能。页面加载时间不超过2秒（首屏），API接口响应时间不超过500ms（P95，不含AI模型推理时间）。AI病虫害识别接口端到端响应时间不超过3秒（P95，含图片传输和模型推理）。系统应支持至少200个并发用户同时在线操作，500 QPS的API请求峰值处理能力。数据库查询应在100ms内完成（P95），复杂聚合查询不超过2秒。图片上传和下载应支持断点续传。 |

---

### NFR-02 安全需求

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-02 |
| **需求名称** | 系统安全 |
| **描述** | 系统应遵循OWASP Top 10安全标准进行设计和开发。所有用户密码使用bcrypt算法加密存储（工作因子>=10）。API接口应实施JWT Token认证和鉴权机制，Token有效期不超过7天。敏感数据传输必须使用HTTPS/TLS 1.3加密。系统应具备防护常见Web攻击的能力，包括SQL注入、XSS跨站脚本攻击、CSRF跨站请求伪造、文件上传漏洞等。用户上传的图片文件应进行格式校验、病毒扫描和内容安全审核。API接口应实施速率限制（Rate Limiting），默认每用户每分钟不超过60次请求。系统应定期进行安全漏洞扫描和渗透测试。 |

---

### NFR-03 可用性需求

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-03 |
| **需求名称** | 系统可用性 |
| **描述** | 系统应保证核心功能（病虫害识别、农事管理、数据查询）的高可用性，月度可用率不低于99.5%（月度不可用时间不超过3.6小时）。系统应支持关键服务的多实例部署和故障自动切换。数据库应实施主从复制和定期备份策略（每日全量备份，每小时增量备份）。系统维护操作应尽量安排在夜间低峰时段（凌晨2:00-5:00），并提前72小时发布维护公告。系统应提供友好的错误提示页面和降级服务策略（如AI模型不可用时，自动引导用户提交人工审核）。 |

---

### NFR-04 可扩展性需求

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-04 |
| **需求名称** | 系统可扩展性 |
| **描述** | 系统应采用微服务架构设计，核心服务（用户服务、病虫害识别服务、农事管理服务、数据服务）独立部署，通过API网关统一对外暴露。各服务应支持水平扩展（通过增加实例数量提升处理能力）。系统应支持对接多种AI模型服务（通过统一的模型服务接口抽象层，支持切换不同的模型供应商和模型版本）。数据库设计应考虑分库分表的扩展能力（如按tenant/合作社进行数据隔离）。系统应预留开放API接口，支持与第三方系统（如农业物联网平台、农产品电商平台、政府监管平台）的数据对接。 |

---

### NFR-05 兼容性需求

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-05 |
| **需求名称** | 系统兼容性 |
| **描述** | 前端Web管理平台应兼容主流浏览器的最新两个主要版本，包括：Chrome（>=100）、Firefox（>=100）、Edge（>=100）、Safari（>=15）。移动端（微信公众号H5或小程序）应兼容微信最新版本，并适配主流手机屏幕尺寸（320px-428px宽度）。系统API接口应遵循RESTful设计规范，使用JSON格式进行数据交换。对于云南省部分偏远地区网络条件较差的情况，系统应进行前端资源优化（代码压缩、图片懒加载、CDN加速），保证在3G网络条件下页面基本可用（核心功能加载时间不超过10秒）。系统应支持中文字符集UTF-8编码，支持云南省少数民族地区的地名和用户姓名正确显示。 |

---

### NFR-06 可维护性需求

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-06 |
| **需求名称** | 系统可维护性 |
| **描述** | 系统代码应遵循统一的编码规范和命名约定。后端采用Java Spring Boot或Python FastAPI框架，前端采用Vue 3或React 18框架。所有服务模块应提供健康检查端点（/health）和指标暴露端点（/metrics，Prometheus格式）。系统应实施集中化日志管理（ELK Stack：Elasticsearch + Logstash + Kibana，或Loki + Grafana），日志级别可动态调整。关键业务操作应记录结构化审计日志。系统应提供自动化部署脚本（Docker Compose或Kubernetes Helm Charts），支持一键部署和环境切换（开发/测试/生产）。系统配置应实现代码与配置分离，支持环境变量和配置中心的动态配置管理。 |

---

### NFR-07 数据合规与隐私保护

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-07 |
| **需求名称** | 数据合规与隐私保护 |
| **描述** | 系统应严格遵守《中华人民共和国个人信息保护法》《中华人民共和国数据安全法》和《中华人民共和国网络安全法》的相关规定。在收集用户个人信息（手机号、地理位置、身份证号等）前必须获得用户的明确同意，并提供隐私政策说明。用户有权查看、更正和删除其个人数据。系统不应将用户数据用于超出服务目的之外的用途（如未经授权的数据分析和商业变现）。农户的地块信息和生产数据属于用户私有数据，未经授权不得向第三方披露。合作社级别的生产统计数据应进行脱敏处理后再用于公开分析。对于涉及云南省地理信息数据的使用，应遵守《测绘法》相关规定（地图展示需使用审图号合规的地图服务）。系统数据存储应位于中国境内服务器。 |

---

### NFR-08 审计日志

| 属性 | 内容 |
|---|---|
| **需求ID** | NFR-08 |
| **需求名称** | 审计日志 |
| **描述** | 系统应对所有关键业务操作记录完整的审计日志。审计日志应至少包含以下字段：操作时间（精确到毫秒）、操作人ID和用户名、操作类型（增/删/改/查/导出）、操作对象类型和ID、操作前后数据变化（JSON格式）、操作来源IP地址、User-Agent信息。审计日志应存储为不可篡改的追加模式（Append-Only），支持按时间范围、操作人、操作类型等多维度查询。系统管理员和合作社管理员可查看权限范围内的审计日志。系统应保留审计日志至少12个月，超过保留期的日志可归档到冷存储。日志数据应进行定期备份，备份数据加密存储。 |

---

## 6. 数据字典

### 6.1 用户表（users）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 用户唯一标识 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt加密后的密码 |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 手机号 |
| real_name | VARCHAR(50) | NOT NULL | 真实姓名 |
| role | ENUM('farmer','technician','cooperative_admin','system_admin') | NOT NULL | 用户角色 |
| cooperative_id | BIGINT | FK → cooperatives.id, NULLABLE | 所属合作社ID |
| avatar_url | VARCHAR(500) | NULLABLE | 头像图片URL |
| wechat_openid | VARCHAR(100) | UNIQUE, NULLABLE | 微信OpenID |
| status | ENUM('active','disabled','pending') | NOT NULL, DEFAULT 'active' | 账号状态 |
| last_login_at | DATETIME | NULLABLE | 最后登录时间 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.2 农场表（farms）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 农场唯一标识 |
| name | VARCHAR(100) | NOT NULL | 农场名称 |
| owner_id | BIGINT | FK → users.id, NOT NULL | 农场主用户ID |
| cooperative_id | BIGINT | FK → cooperatives.id, NULLABLE | 所属合作社ID |
| address | VARCHAR(300) | NOT NULL | 农场详细地址 |
| province | VARCHAR(50) | NOT NULL, DEFAULT '云南省' | 省份 |
| city | VARCHAR(50) | NOT NULL | 州市 |
| district | VARCHAR(50) | NOT NULL | 区县 |
| longitude | DECIMAL(10,7) | NULLABLE | 经度坐标 |
| latitude | DECIMAL(10,7) | NULLABLE | 纬度坐标 |
| total_area_mu | DECIMAL(10,2) | NOT NULL | 总面积（亩） |
| status | ENUM('active','inactive') | NOT NULL, DEFAULT 'active' | 农场状态 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.3 地块表（fields）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 地块唯一标识 |
| farm_id | BIGINT | FK → farms.id, NOT NULL | 所属农场ID |
| field_code | VARCHAR(50) | UNIQUE, NOT NULL | 地块编号 |
| field_name | VARCHAR(100) | NULLABLE | 地块名称（如"东坡1号地"） |
| area_mu | DECIMAL(10,2) | NOT NULL | 地块面积（亩） |
| soil_type | VARCHAR(50) | NULLABLE | 土壤类型（红壤/黄壤/水稻土等） |
| irrigation_type | ENUM('drip','sprinkler','flood','rainfed','none') | NULLABLE | 灌溉方式 |
| altitude | DECIMAL(8,2) | NULLABLE | 海拔高度（米） |
| longitude | DECIMAL(10,7) | NULLABLE | 地块中心经度 |
| latitude | DECIMAL(10,7) | NULLABLE | 地块中心纬度 |
| boundary_geojson | JSON | NULLABLE | 地块边界GeoJSON数据 |
| status | ENUM('planting','fallow','transferred') | NOT NULL, DEFAULT 'fallow' | 地块状态 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.4 作物品种表（crops）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 作物品种唯一标识 |
| crop_name | VARCHAR(100) | NOT NULL | 作物名称（如"普洱茶-大叶种"） |
| category | VARCHAR(50) | NOT NULL | 作物分类（茶叶/花卉/中药材/蔬菜/水果） |
| growth_cycle_days | INT | NOT NULL | 生长周期（天） |
| min_temp | DECIMAL(5,2) | NULLABLE | 适宜最低温度（℃） |
| max_temp | DECIMAL(5,2) | NULLABLE | 适宜最高温度（℃） |
| common_diseases | JSON | NULLABLE | 常见病虫害列表（JSON数组） |
| description | TEXT | NULLABLE | 品种描述 |
| image_url | VARCHAR(500) | NULLABLE | 品种示例图片 |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 | 是否启用 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.5 种植周期表（planting_cycles）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 种植周期唯一标识 |
| field_id | BIGINT | FK → fields.id, NOT NULL | 关联地块ID |
| crop_id | BIGINT | FK → crops.id, NOT NULL | 关联作物品种ID |
| planting_date | DATE | NOT NULL | 种植日期 |
| expected_harvest_date | DATE | NOT NULL | 预计采收日期 |
| actual_harvest_date | DATE | NULLABLE | 实际采收日期 |
| planting_density | VARCHAR(100) | NULLABLE | 种植密度（如"3000株/亩"） |
| seedling_source | VARCHAR(200) | NULLABLE | 种苗来源 |
| area_mu | DECIMAL(10,2) | NOT NULL | 实际种植面积（亩） |
| predicted_yield_kg | DECIMAL(12,2) | NULLABLE | 预测产量（公斤） |
| actual_yield_kg | DECIMAL(12,2) | NULLABLE | 实际产量（公斤） |
| stage | ENUM('seedling','vegetative','flowering','fruiting','harvesting') | NULLABLE | 当前生长阶段 |
| status | ENUM('active','harvested','abandoned') | NOT NULL, DEFAULT 'active' | 周期状态 |
| traceability_code | VARCHAR(50) | UNIQUE, NULLABLE | 溯源码（采收时生成） |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.6 田间观察记录表（observations）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 观察记录唯一标识 |
| planting_cycle_id | BIGINT | FK → planting_cycles.id, NOT NULL | 关联种植周期ID |
| field_id | BIGINT | FK → fields.id, NOT NULL | 关联地块ID |
| observer_id | BIGINT | FK → users.id, NOT NULL | 观察人ID |
| observation_date | DATETIME | NOT NULL | 观察时间 |
| observation_type | ENUM('growth','pest_disease','damage','weather_impact','general') | NOT NULL | 观察类型 |
| crop_height_cm | DECIMAL(8,2) | NULLABLE | 作物高度（厘米） |
| leaf_color | VARCHAR(50) | NULLABLE | 叶色描述 |
| soil_moisture | VARCHAR(50) | NULLABLE | 土壤墒情描述（干/适中/湿/过湿） |
| description | TEXT | NOT NULL | 观察描述 |
| images | JSON | NULLABLE | 观察照片URL列表（JSON数组） |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 6.7 病虫害记录表（disease_records）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 病虫害记录唯一标识 |
| planting_cycle_id | BIGINT | FK → planting_cycles.id, NOT NULL | 关联种植周期ID |
| field_id | BIGINT | FK → fields.id, NOT NULL | 关联地块ID |
| reporter_id | BIGINT | FK → users.id, NOT NULL | 上报人ID |
| report_date | DATETIME | NOT NULL | 上报时间 |
| image_urls | JSON | NOT NULL | 上传的图片URL列表 |
| ai_disease_name | VARCHAR(200) | NULLABLE | AI识别的病虫害名称 |
| ai_confidence | DECIMAL(5,4) | NULLABLE | AI识别置信度（0-1） |
| ai_top3_results | JSON | NULLABLE | AI Top-3识别结果（含名称和置信度） |
| model_version | VARCHAR(20) | NULLABLE | 使用的模型版本号 |
| review_status | ENUM('pending','reviewed','disputed') | NOT NULL, DEFAULT 'pending' | 审核状态 |
| reviewer_id | BIGINT | FK → users.id, NULLABLE | 审核人ID |
| reviewer_diagnosis | VARCHAR(200) | NULLABLE | 审核人诊断结果 |
| reviewer_advice | TEXT | NULLABLE | 审核人防治建议 |
| review_date | DATETIME | NULLABLE | 审核时间 |
| severity | ENUM('mild','moderate','severe','critical') | NULLABLE | 危害程度 |
| user_feedback | ENUM('accurate','inaccurate',NULL) | NULLABLE | 用户对AI结果的反馈 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.8 农事任务表（farming_tasks）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 任务唯一标识 |
| planting_cycle_id | BIGINT | FK → planting_cycles.id, NOT NULL | 关联种植周期ID |
| field_id | BIGINT | FK → fields.id, NOT NULL | 关联地块ID |
| task_type | ENUM('fertilizing','watering','spraying','weeding','pruning','harvesting','plowing','other') | NOT NULL | 任务类型 |
| task_title | VARCHAR(200) | NOT NULL | 任务标题 |
| task_description | TEXT | NULLABLE | 任务详细描述 |
| planned_start_date | DATE | NOT NULL | 计划开始日期 |
| planned_end_date | DATE | NULLABLE | 计划结束日期 |
| assignee_id | BIGINT | FK → users.id, NOT NULL | 负责人ID |
| status | ENUM('pending','in_progress','completed','cancelled') | NOT NULL, DEFAULT 'pending' | 任务状态 |
| actual_start_time | DATETIME | NULLABLE | 实际开始时间 |
| actual_end_time | DATETIME | NULLABLE | 实际结束时间 |
| material_used | JSON | NULLABLE | 使用物资记录（JSON：名称、用量、单位） |
| execution_notes | TEXT | NULLABLE | 执行备注 |
| execution_images | JSON | NULLABLE | 执行现场照片URL列表 |
| is_auto_generated | TINYINT(1) | NOT NULL, DEFAULT 0 | 是否系统自动生成 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.9 天气记录表（weather_records）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 天气记录唯一标识 |
| farm_id | BIGINT | FK → farms.id, NOT NULL | 关联农场ID |
| record_date | DATE | NOT NULL | 记录日期 |
| record_type | ENUM('actual','forecast') | NOT NULL | 记录类型（实际/预报） |
| max_temp | DECIMAL(5,2) | NULLABLE | 最高温度（℃） |
| min_temp | DECIMAL(5,2) | NULLABLE | 最低温度（℃） |
| avg_temp | DECIMAL(5,2) | NULLABLE | 平均温度（℃） |
| humidity | DECIMAL(5,2) | NULLABLE | 相对湿度（%） |
| precipitation_mm | DECIMAL(8,2) | NULLABLE | 降水量（毫米） |
| wind_speed | DECIMAL(5,2) | NULLABLE | 风速（m/s） |
| wind_direction | VARCHAR(20) | NULLABLE | 风向 |
| sunshine_hours | DECIMAL(5,2) | NULLABLE | 日照时长（小时） |
| weather_condition | VARCHAR(50) | NULLABLE | 天气状况（晴/多云/阴/雨/雪等） |
| alert_type | VARCHAR(50) | NULLABLE | 预警类型（暴雨/霜冻/冰雹/大风等） |
| alert_level | ENUM('blue','yellow','orange','red') | NULLABLE | 预警级别 |
| data_source | VARCHAR(100) | NULLABLE | 数据来源 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 6.10 市场行情表（market_prices）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 价格记录唯一标识 |
| crop_name | VARCHAR(100) | NOT NULL | 农产品名称 |
| variety | VARCHAR(100) | NULLABLE | 品种规格 |
| market_name | VARCHAR(200) | NOT NULL | 批发市场名称 |
| price_date | DATE | NOT NULL | 价格日期 |
| min_price | DECIMAL(10,2) | NULLABLE | 最低价（元/公斤） |
| max_price | DECIMAL(10,2) | NULLABLE | 最高价（元/公斤） |
| avg_price | DECIMAL(10,2) | NOT NULL | 平均价（元/公斤） |
| price_unit | VARCHAR(20) | NOT NULL, DEFAULT '元/公斤' | 价格单位 |
| trading_volume_kg | DECIMAL(12,2) | NULLABLE | 交易量（公斤） |
| price_change_pct | DECIMAL(6,2) | NULLABLE | 较前日价格变化百分比 |
| data_source | VARCHAR(100) | NULLABLE | 数据来源 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 6.11 知识文档表（knowledge_documents）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 文档唯一标识 |
| title | VARCHAR(300) | NOT NULL | 文档标题 |
| category | VARCHAR(100) | NOT NULL | 文档类别（病虫害/栽培技术/施肥/用药/质量标准等） |
| crop_category | VARCHAR(50) | NULLABLE | 关联作物分类 |
| content | LONGTEXT | NOT NULL | 文档原始内容 |
| content_type | ENUM('text','pdf','web_page') | NOT NULL, DEFAULT 'text' | 内容类型 |
| source_url | VARCHAR(500) | NULLABLE | 来源URL |
| author_id | BIGINT | FK → users.id, NULLABLE | 上传者/作者ID |
| tags | JSON | NULLABLE | 标签（JSON数组） |
| chunk_count | INT | NOT NULL, DEFAULT 0 | 分块数量 |
| vector_store_id | VARCHAR(100) | NULLABLE | 向量存储中的集合/索引ID |
| status | ENUM('draft','published','archived') | NOT NULL, DEFAULT 'draft' | 文档状态 |
| view_count | INT | NOT NULL, DEFAULT 0 | 查看次数 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.12 模型版本表（model_versions）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 模型版本唯一标识 |
| model_name | VARCHAR(100) | NOT NULL | 模型名称（如"pest-disease-detector"） |
| model_type | ENUM('image_classification','object_detection','yield_prediction','rag_embedding','llm') | NOT NULL | 模型类型 |
| version | VARCHAR(20) | NOT NULL | 版本号（如"v2.1.0"） |
| description | TEXT | NULLABLE | 版本描述/更新日志 |
| model_path | VARCHAR(500) | NOT NULL | 模型文件存储路径 |
| framework | VARCHAR(50) | NULLABLE | 模型框架（PyTorch/ONNX/TensorFlow等） |
| accuracy | DECIMAL(5,4) | NULLABLE | 验证集准确率 |
| precision_metric | DECIMAL(5,4) | NULLABLE | 精确率 |
| recall_metric | DECIMAL(5,4) | NULLABLE | 召回率 |
| f1_score | DECIMAL(5,4) | NULLABLE | F1分数 |
| training_dataset_version | VARCHAR(50) | NULLABLE | 训练数据集版本 |
| parameters_json | JSON | NULLABLE | 模型参数配置（JSON） |
| status | ENUM('development','staging','production','archived') | NOT NULL, DEFAULT 'development' | 部署状态 |
| traffic_ratio | DECIMAL(3,2) | NOT NULL, DEFAULT 0.00 | 流量分配比例（用于灰度发布） |
| deployed_at | DATETIME | NULLABLE | 部署时间 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

### 6.13 Agent运行记录表（agent_runs）

| 字段名 | 数据类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 运行记录唯一标识 |
| run_id | VARCHAR(50) | UNIQUE, NOT NULL | 运行ID（UUID） |
| user_id | BIGINT | FK → users.id, NOT NULL | 发起用户ID |
| session_id | VARCHAR(50) | NULLABLE | 对话会话ID |
| user_query | TEXT | NOT NULL | 用户输入的问题 |
| agent_pipeline | JSON | NOT NULL | Agent管线配置（Agent顺序和类型） |
| agent_results | JSON | NOT NULL | 各Agent执行结果（每步输入、输出、耗时） |
| final_answer | TEXT | NOT NULL | 最终生成的回答 |
| referenced_docs | JSON | NULLABLE | 引用的知识文档列表 |
| total_execution_time_ms | INT | NOT NULL | 总执行耗时（毫秒） |
| token_usage | JSON | NULLABLE | LLM Token使用量统计 |
| user_feedback | ENUM('helpful','not_helpful',NULL) | NULLABLE | 用户反馈 |
| error_message | TEXT | NULLABLE | 错误信息（如有） |
| status | ENUM('running','completed','failed') | NOT NULL, DEFAULT 'running' | 运行状态 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| completed_at | DATETIME | NULLABLE | 完成时间 |

---

## 7. 验收标准

### 7.1 功能完整性验收

| 验收项编号 | 验收项 | 验收标准 | 权重 |
|---|---|---|---|
| AC-FUNC-01 | 用户注册与登录 | 支持手机号注册和微信登录，密码安全加密，登录成功率 >= 99.9% | 5% |
| AC-FUNC-02 | 农场与地块管理 | 农场和地块的创建、编辑、删除、查询功能完整，支持地图可视化展示 | 5% |
| AC-FUNC-03 | 作物与种植周期管理 | 作物品种库可用，种植周期创建和管理功能完整，自动生成农事日历 | 5% |
| AC-FUNC-04 | 病虫害智能识别 | 上传图片后3秒内返回识别结果，Top-3准确率 >= 92%（测试集），低置信度自动标记 | 15% |
| AC-FUNC-05 | 农技人员审核 | 审核流程完整：查看诊断记录 → 确认/修正 → 补充建议 → 提交 | 5% |
| AC-FUNC-06 | 农事任务管理 | 任务CRUD完整，任务提醒正常推送，执行记录可追溯 | 10% |
| AC-FUNC-07 | 产量预测 | 预测功能可用，预测误差率 <= 15%（MAPE），支持多模型切换 | 5% |
| AC-FUNC-08 | 设备监控 | IoT数据正常接入和展示，异常告警功能正常 | 5% |
| AC-FUNC-09 | 农产品溯源 | 溯源码生成和查询功能正常，溯源信息完整展示（种植→采收全过程） | 10% |
| AC-FUNC-10 | 权限管理 | 四种角色权限正确隔离，越权访问被拒绝 | 5% |
| AC-FUNC-11 | 天气服务 | 实时天气和7天预报正常展示，极端天气预警可推送 | 3% |
| AC-FUNC-12 | 市场行情 | 价格数据正常展示和查询，价格走势图正确，预警功能正常 | 3% |
| AC-FUNC-13 | AI模型管理 | 模型版本列表、性能指标、灰度发布、回滚功能正常 | 5% |
| AC-FUNC-14 | RAG知识检索 | 知识库检索功能可用，回答引用来源正确标注 | 7% |
| AC-FUNC-15 | Agent决策 | 多Agent协作流程正常执行，决策链路可视化，运行记录可追溯 | 7% |

### 7.2 非功能需求验收

| 验收项编号 | 验收项 | 验收标准 |
|---|---|---|
| AC-NFR-01 | 页面响应时间 | 首屏加载时间 <= 2秒，API响应时间P95 <= 500ms |
| AC-NFR-02 | AI识别响应时间 | 端到端响应时间P95 <= 3秒 |
| AC-NFR-03 | 并发支持 | 200并发用户下系统正常运行，核心功能响应时间不超过基准的2倍 |
| AC-NFR-04 | 安全性 | 通过OWASP Top 10安全测试，无高危漏洞，密码加密存储，HTTPS全站启用 |
| AC-NFR-05 | 浏览器兼容性 | Chrome/Firefox/Edge/Safari最新两个版本功能正常 |
| AC-NFR-06 | 移动端适配 | H5/小程序在主流手机屏幕尺寸下展示正常，3G网络下核心功能可用 |
| AC-NFR-07 | 审计日志 | 关键操作审计日志完整记录，支持查询和导出 |
| AC-NFR-08 | 数据备份与恢复 | 数据库每日自动备份，备份恢复可在2小时内完成 |
| AC-NFR-09 | 系统可用性 | 测试期间系统可用率 >= 99%（计划维护时间除外） |
| AC-NFR-10 | API文档完整性 | 所有API接口有完整的Swagger/OpenAPI文档 |

### 7.3 文档与交付验收

| 验收项编号 | 验收项 | 验收标准 |
|---|---|---|
| AC-DOC-01 | 需求规格说明书 | 本文档内容完整，覆盖所有规定章节，描述清晰无歧义 |
| AC-DOC-02 | 系统设计文档 | 包含架构设计、数据库设计、接口设计、部署方案等完整内容 |
| AC-DOC-03 | 测试报告 | 包含功能测试、性能测试、安全测试的结果和分析 |
| AC-DOC-04 | 用户操作手册 | 面向各角色用户的操作指南，图文并茂，步骤清晰 |
| AC-DOC-05 | 部署运维手册 | 包含环境要求、部署步骤、配置说明、常见问题排查等内容 |
| AC-DOC-06 | 源代码交付 | 代码仓库完整，结构清晰，包含README、注释规范、构建脚本 |
| AC-DOC-07 | 演示视频 | 5-10分钟的系统功能演示视频，覆盖核心业务流程 |

### 7.4 综合评分维度

| 评分维度 | 满分 | 评分要点 |
|---|---|---|
| 功能完整性 | 25分 | 15个功能需求是否全部实现，是否符合需求规格描述 |
| 技术创新性 | 20分 | AI识别模型效果、RAG检索质量、Agent协作框架设计 |
| 用户体验 | 15分 | 界面美观、操作流畅、移动端适配、错误提示友好 |
| 系统性能 | 10分 | 响应时间、并发能力、资源利用率 |
| 代码质量 | 10分 | 编码规范、架构设计、注释文档、可维护性 |
| 文档质量 | 10分 | 文档完整性、准确性、专业性和可读性 |
| 演示答辩 | 10分 | 演示流畅度、问题回答质量、团队协作表现 |
| **总分** | **100分** | --- |

---

> **文档说明**：本需求规格说明书是"云南特色农业智能诊断与生产管理平台"项目的核心规划文档，所有功能开发、测试和验收均以本文档为依据。文档内容将随项目进展进行必要的修订和补充，修订记录以版本号进行标识和管理。
