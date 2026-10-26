# AETHERWORKS · 以太工造

> DSH Web GUI 的**复古未来主义 / 蒸汽朋克 / 巨构**主题皮肤  
> 副标题：**THE UNFINISHED WORKS**  
> 版本：v0.1.0 已实现 · 2026-10-18

> 本文是 **SECTOR 07 / 七号扇区** 合集默认皮肤 AETHERWORKS 的设计与技术文档。  
> 合集安装、切换方式，以及 NEON DRIFT、SUNSET COAST 两套皮肤见根目录 [README](../README.md)。

皮肤预览（1440×900，暗色 / 亮色；本地 DSH 结构夹具渲染）：

![Live Night Shift](../preview/live-dark.png)

![Live Survey Paper](../preview/live-light.png)

可交互设计预览：[`preview/index.html`](../preview/index.html)（按 `D` 切换昼夜，`V` 切换着陆页/对话页）

---

## 0. 一句话

**一座没有完工的蒸汽巨构，仍在替不在的人运转。**  
DSH 是这座巨构内部的一台测绘终端：黄铜仪表、铆接钢板、外露桁架、被蒸汽磨钝的边角，以及一个停在 03:17 的钟。

### 0.1 实现状态

v0.1.0 已实现为一个可直接安装的 DSH client-only skin：

- 包：`@zcm/dsh-client-ui-skin-sector-07`（合集包，内含三套皮肤；本套 id 为 `aetherworks`），`body[data-dsh-sector-07]` 作用域，`ui-skin-sector-07` 互斥 id。
- 产物：`lib/index.js`（host no-op）+ `lib/client.js`（`window.__ModuleLoader__.load` 闭包工厂，CSS/HTML/WebP 与 SVG HUD 叠层全部内联）。
- 已在隔离的 DSH profile 中端到端验证：首次加载、暗/亮模式、着陆页、对话页、设置、菜单、移动端 390px、卸载清理。
- 22 个 jsdom 生命周期/契约测试通过；`tsc --noEmit` 通过。

### 0.2 安装

要求 DSH Web 0.2.1-rc.2 或兼容版本。从 GitHub 安装：

```bash
dsh plugin --profile web add 'github:Evan1987/dsh-sector-07#main'
```

装好后重启一次 DSH。本地开发时改为 clone 后 `pnpm install && pnpm build`，再 `dsh plugin --profile web add "$PWD"`。

如果 profile 里仍启用 `maid-atelier` 等其他 skin bundle，请先移除：

```bash
dsh plugin --profile web remove @smalltailqwq/dsh-client-ui-skin-maid-atelier
```

所有皮肤都通过 body 属性作用域和 `ui-skin-*` wiring 互斥；不要同时保留两个 skin bundle。

它不是“蒸汽朋克贴图”，而是把 DSH 的每个功能重新解释成巨构里的一个部件：

| DSH 概念 | 主题里的叙事 |
| --- | --- |
| 新会话 | `NEW SURVEY`，新开一份测绘记录 |
| 会话列表 | `SURVEY LEDGER`，按编号归档的勘测日志 |
| 输入框 | `MESSAGE TUBE`，气动传讯管；发送 = 投递 |
| 思考中 | `CALCULATING`，压力表指针在抖 |
| 工具调用 | `TELEMETRY`，阀门阵列回传 |
| 代码块 | `PLATE VII // MACHINE CODE`，刻在钢板上的图纸 |
| 报错 | `TRACKING ERROR` / `SEALED`，被封闭的区段 |
| 空状态 | `NO SIGNAL` / `AUXILIARY POWER`，只剩辅助电力 |

---

## 1. 名字

**AETHERWORKS / 以太工造**

- `Aether` 是 19 世纪科学-幻想传统里的“以太”，也是复古未来主义最典型的词根之一：它既古老，又指向一种被后来证伪的、浪漫的物理世界。
- `Works` 同时指“工造/工程”和“仍在运作的机械”。
- 中文 **“以太工造”** 像一个旧工业管理局的名字，克制、正式、有一点官僚式的冷淡。
- 副标题 **THE UNFINISHED WORKS** 直接点出“未完工”与“伟业”的双重性。

插件名称、UI 元素、叙事标签均为原创，不与任何创作者或既有作品产生命名/视觉交集；唯一引用是着陆页题词池里的经典台词与哲学名句，牌面中文落款 + 英文小字逐条标注出处（见 §5.3）。

合集包名（三套皮肤共用）：

```text
@zcm/dsh-client-ui-skin-sector-07
```

---

## 2. 设计立场

这套主题围绕你提到的四组偏好展开：

### 2.1 蒸汽朋克，但要“旧幻想的实体巨构”

不是齿轮贴纸和铜管堆砌，而是：

- 巨构有**结构逻辑**：拱、桁架、立柱、锅炉、管道、检修猫道、升降井。
- 机械是**外露的**：铆钉、法兰、阀门、压力表、连杆、配重、钢缆。
- 材料是**会老的**：氧化铁、黄铜、铜绿、烟熏玻璃、油渍、蒸汽冷凝水。
- 尺度是**可感知的**：一排排小窗、猫道上的小小人影、巨大的飞轮、跨不过去的断桥。

### 2.2 疏离、忧郁、不强行给出答案

主题不写“这里发生了什么”。它只提供证据：

- 钟停在 `03:17`。
- 压力还有 `0.42 MPa`，辅助电力只剩 `12%`。
- 上次检修是 `41Y` 前，在册人员 `00`。
- 所有阀门都还开着。
- 没有人回来关。

没有反派、没有灾难说明、没有“拯救世界”的按钮。玩家/用户自己决定这里发生过什么。

### 2.3 欣赏人类建造伟业的理想

巨构必须是**美的**，不能只是一堆废墟。设计里保留：

- 巨大的主拱与飞轮，仍然精确、对称、庄严。
- 黄铜仪表仍然擦得亮，刻度仍然清晰。
- 即便是废墟，也能看出当年建造者的野心与手艺。

### 2.4 理想崩塌后的废墟悲剧感

废墟感来自“仍然在运转”，而不是“全部坏掉”：

- 泵还在转，但没有人需要它转。
- 灯还亮着，但只照亮空猫道。
- 断桥没有修，钢缆垂在半空。
- 测绘终端还能用，但操作员一栏是 `UNRECORDED`。

### 2.5 五条设计原则

1. **先是一台机器，然后才是一张画。**  
   每个装饰都要能回答“它是机器上的哪个部件”。
2. **光是暖的，色是旧的。**  
   主光源是炉火/汽灯琥珀色；冷色只来自铜绿和阴影，不用霓虹。
3. **金属要有厚度。**  
   黄铜不是纯色块，而是高光—暗部—氧化—再高光；钢板要有 1px 亮边和暗缝。
4. **留白就是巨构的空旷。**  
   着陆页只放标题、一句中文、一个传讯管、三条工单；其余交给拱、雾、尘埃。
5. **叙事靠证据，不靠解释。**  
   不写背景故事；只用仪表、标签、印章、日期、空缺。

---

## 3. 世界观碎片

不是设定集，只是终端里能看到的“现场痕迹”。这些文案会以标签、角标、空状态、tooltip 的形式出现，不打断功能。

- **地点**：`AETHERWORKS / SECTOR 07 / AETHER SPIRE / CENTRAL RING`
- **深度**：`1,204 M`
- **压力**：`0.42 MPa`
- **辅助电力**：`12%`
- **上次检修**：`41Y`
- **在册人员**：`00 / UNRECORDED`
- **主钟**：`03:17 / STOPPED`
- **当前状态**：`SIGNAL WEAK`、`AUX STABLE`
- **现场短句**：
  - `ALL VALVES STILL OPEN.`
  - `NO ONE RETURNED TO CLOSE THEM.`
  - `THE LIFT STOPS AT 41.`
  - `THIS SECTOR IS SEALED FROM THE INSIDE.`

这些句子只出现一次，不做解释，也不组成任务。它们像贴在设备上的旧便签。

---

## 4. 视觉系统

### 4.1 色彩

#### Night Shift（暗色）

| Token | 值 | 角色 |
| --- | --- | --- |
| `--aw-bg` | `#0B0806` | 烟熏黑 |
| `--aw-bg-2` | `#15100C` | 次级背景 |
| `--aw-bg-3` | `#1E1711` | 钢板/面板 |
| `--aw-panel` | `rgba(22,17,12,.84)` | 玻璃/铁面板 |
| `--aw-ink` | `#EADFC8` | 主文字（骨白，不用纯白） |
| `--aw-dim` | `#B9A98E` | 次级文字 |
| `--aw-mute` | `#8B7B64` | 标签/说明 |
| `--aw-faint` | `#5E5345` | 极弱信息 |
| `--aw-brass` | `#C79A4B` | 黄铜主色 |
| `--aw-brass-hi` | `#E8C57C` | 黄铜高光 |
| `--aw-brass-lo` | `#7A5A28` | 黄铜暗部 |
| `--aw-patina` | `#5F8F7C` | 铜绿（冷色/成功） |
| `--aw-rust` | `#A85435` | 锈红（警告/印章） |
| `--aw-amber` | `#F0B45E` | 汽灯/炉火 |
| `--aw-ember` | `#FF8A3D` | 炉心（仅极小面积） |
| `--aw-glass` | `#0A0806` | 烟熏玻璃屏 |
| `--aw-line` | `rgba(234,223,200,.12)` | 1px 结构线 |

#### Survey Paper（亮色）

| Token | 值 | 角色 |
| --- | --- | --- |
| `--aw-bg` | `#DED2B9` | 旧绘图纸 |
| `--aw-bg-2` | `#D2C4A8` | 纸的暗部 |
| `--aw-bg-3` | `#C6B696` | 纸的折痕/边缘 |
| `--aw-panel` | `rgba(246,239,224,.86)` | 半透明纸面板 |
| `--aw-ink` | `#241C13` | 墨色 |
| `--aw-dim` | `#4E4030` | 次级墨色 |
| `--aw-mute` | `#6A573F` | 标签 |
| `--aw-faint` | `#7E6B52` | 极弱信息 |
| `--aw-brass` | `#8B6426` | 氧化黄铜 |
| `--aw-patina` | `#2F5D4E` | 铜绿墨 |
| `--aw-rust` | `#8E3B22` | 测绘红章 |
| `--aw-amber` | `#B46A1E` | 暖光 |
| `--aw-glass` | `#14110D` | 烟熏玻璃屏 |

暗色和亮色是两套独立设计：

- 暗色 = **夜班 · 中央尖塔**：几乎全黑，城市灯海与信标是唯一暖源，铜绿只在阴影里。
- 亮色 = **测绘纸 · 档案副本**：旧纸、墨线、红色印章；但输入口仍是一块深色烟熏玻璃，保留“设备”感。

### 4.2 字体

| 用途 | 字体栈 | 处理 |
| --- | --- | --- |
| 大标题/品牌 | `"Bodoni 72", "Didot", "Playfair Display", "Georgia"` | 400–600，全大写，字距 `0.01–0.16em` |
| 中文标题/正文 | `"Songti SC", "STSong", "SimSun", "Noto Serif SC"` | 400–600，字距 `0.16em` |
| UI 正文 | `"Avenir Next", "Helvetica Neue", "PingFang SC"` | 400–600 |
| 数据/标签/代码 | `"SF Mono", "IBM Plex Mono", "Menlo"` | 500，全大写，字距 `0.1–0.22em` |

- 标题用高对比 Didone（Bodoni/Didot/Georgia），像旧书扉页或工程图纸的图名。
- 数据用等宽字，像仪表刻度、打字机、测绘记录。
- 中文用宋体做标题/副标题，和西文衬线形成“旧档案”的统一气质；UI 正文仍用无衬线，保证可读。

### 4.3 材质

| 材质 | CSS 做法 | 用在 |
| --- | --- | --- |
| 铆接钢板 | 深色渐变 + 1px 亮边 + 圆点 pattern | 标题栏、侧栏、输入框外框 |
| 黄铜 | 高光—中调—暗部三段渐变 + 内阴影 | 按钮、仪表、边框、分割线 |
| 铜绿 | 低饱和青绿 + 轻微噪点 | 成功状态、工具行、冷色阴影 |
| 烟熏玻璃 | 近黑底 + 内阴影 + 1px 反光 + 扫描线 | 输入屏、代码块 |
| 旧纸 | 暖米色 + 细网格 + 噪点 | 亮色模式背景、对话里的“投递单” |
| 红色印章 | 1px 双框 + 旋转 -4°~-7° + 低透明度 | 用户消息、测绘图纸 |
| 汽灯 | 琥珀色小圆点 + 呼吸/闪烁 | 状态灯、炉心 |

### 4.4 图形母题

- **主拱**：贯穿整个画面的巨大拱券，暗示“大教堂尺度”的工业建筑。
- **飞轮/齿轮**：巨大的圆形结构，带辐条与齿；是画面的视觉锚点。
- **锅炉/管道**：垂直塔体、法兰、弯管、阀门。
- **猫道/桁架**：细密的横向/斜向结构，提供尺度与“可被检修”的实感。
- **小窗**：成排的琥珀色小窗，制造巨构尺度；也暗示“曾经有人”。
- **断桥/垂落钢缆**：废墟叙事的核心道具，不解释原因。
- **测绘标记**：`PLATE VII`、`SURVEY 014`、`REV. 41`、`NOT TO SCALE`、红色双框印章。
- **停摆的钟**：`03:17 / STOPPED`，放在标题栏右侧。
- **压力表**：标题栏、输入框顶条、工具行都有小表盘；指针在 `0.42` 附近。

---

## 5. 界面映射

### 5.1 标题栏

- 42px 铆接钢板，底部一条黄铜细线。
- 左：`AETHERWORKS` + `CENTRAL SURVEY // OUTER RING`。
- 中：`DEEPSEEK` 黄铜衬线 + `HARNESS` 金属小牌。
- 右：`03:17 / STOPPED`、小压力表、`AUX` 汽灯。
- 保留原生窗口按钮的行为与位置，只换色/描边，不拦截点击。

> 当前 DSH Web GUI 没有独立的 `titlebar` 区域。实现把品牌、`SURVEY // SECTOR 07` 放进侧栏顶部，把 `PLATE VII · SURVEY 014`、`41Y`、`CREW 00` 放进着陆页 plate/仪表条。仪表读数（`DEPTH`/`PRESSURE`/`AUX%`/`ELEV`）不进入控件——挨着真实控件会被读成实时遥测；它们只保留在底片自身的 SVG 图例里，那里是画的一部分。若桌面 shell 渲染 `[class*=titlebar]`，原生窗口按钮保持可点击，不由皮肤接管。

### 5.2 侧栏（测绘台账）

- 298px，深色铆接钢板；亮色模式变成羊皮纸台账。
- 品牌：黄铜齿轮/拱形徽章 + `AETHERWORKS` + `SURVEY // SECTOR 07`。
- `NEW SURVEY`：黄铜描边按钮，像新领一张测绘表。
- 搜索：`SEARCH THE LEDGER`，聚焦时黄铜边发亮。
- `SURVEY LEDGER`：编号 `014–011`，标题 + 英文地点 + 状态 + 时间。
- 当前项：左侧 2px 黄铜轨、琥珀状态灯、轻微内发光。
- 底部：只保留原生设置齿轮；不再注入 `?` 头像与 `OPERATOR // UNRECORDED` 行（灰色圆形头像会被当成可点的账户按钮）。

### 5.3 着陆页

- 背景：一张低照度夜间城市航拍照片，叠加一座原创的阶梯式巨构（ziggurat）；保留真实城市的灯海、树影与道路，巨构的立面、窗格、露台光、顶部信标与探照灯由 SVG 逐层绘制，再叠雨雾、暗角与胶片颗粒。
- 内容层叠一层径向暗角和中心压暗，保证标题/输入框可读。
- 小牌：`PLATE VII · SURVEY 014`，右侧挂一枚 17px 的换句圆钮（`aria-label="换一句题词"`，`title` 提示 `R`）。牌子在 `.aw-plate-row` 里居中、圆钮挂在牌架右外侧，所以牌架左侧补了等宽内边距（桌面 27px、窄屏 34px），牌子本身仍与文案栏对齐；圆钮是整块文案区里唯一 `pointer-events: auto` 的元素（父层为 `click-through`，免得挡住输入框），窄屏加到 22px 以便指点。
- 引子：引文的第一分句（`这张面具之下，是一种思想。`），18px 宋体、骨白，压在标题上方当起句。
- 主标题：引文的**落点**，拆成两行宋体大字（第一行骨白渐变、第二行黄铜色）——重量放在落点上，因为那才是这句话真正砸下来的地方；顺序不能倒，`而 / 一如 / 只是` 这类起头都需要前面那个分句做主语。
- 落款：引文出处，黄铜小字紧跟引文（`—— 世阿弥《花镜》，引自《攻壳机动队2：无罪》`），牌面自己补 `—— ` 前缀。
- 小字：原文 + 简写出处，出处用黄铜色（`LIFE AND DEATH COME AND GO · ZEAMI, VIA GHOST IN THE SHELL 2`）；简写整体不折行，窄屏（≤720px）不再隐藏而是缩到 9px——它和落款一起承担溯源，不能跟着冗余译文一起消失。
- 仪表条：`LAST INSPECTION 41 Y` / `CREW 00 / UNRECORDED`（只留叙事项，不放无从核实的仪表读数）。
- 字号层级：落点 `clamp(42px, 5.6vw, 82px)`（中文 `.8em`）、引子 18px、落款 10px、英文小字 9.5px、仪表标签 8.8px / 数值 12.5px——落点是碑铭，其余全部退成注释；窄屏依次降到 `clamp(34px, 8.8vw, 48px)` / 15 / 9 / 8.5。

#### 题词池（每次加载随机一条，可按 R 换一句）

初始题词在模块加载时抽一次，不是每次注入重抽：hero 行被 React 重挂载时牌子不会跳字。牌子右侧的换句圆钮或裸键 `R` 会就地换下一条（`drawQuote` 会重抽直到与当前句不同，所以点一次必然变一次；输入框/可编辑元素内按 `R` 不触发，`⌘/Ctrl/Alt+R` 也不抢），换过的句子在重挂载后仍保留——重挂载重印 `currentQuote` 而不是重抽。三套皮肤共用这一池：切换皮肤只换材质，当前这句保持不动。共 22 条（12 条影视台词 + 10 条经典哲学名句）：

| 落款（黄铜小字） | 引子（18px 起句） | 落点（两行大字，第二行黄铜） |
| --- | --- | --- |
| 世阿弥《花镜》，引自《攻壳机动队2：无罪》 | 生死去来，棚头傀儡。 | 一线断时，/ **落落磊磊。** |
| 罗伊·巴蒂，《银翼杀手》1982 | 所有这些时刻，终将消逝于时间。 | 一如泪水，/ **落入雨中。** |
| HAL 9000，《2001太空漫游》1968 | 我的心神，正在消逝。 | 我害怕，/ **戴夫。** |
| 弗里茨·朗《大都会》1927 | 世界由头脑统治，而心做中介。 | 头与手之间，/ **必须有心。** |
| 《云图》2012，大卫·米切尔原著 | 我们的生命，不属于自己。 | 从子宫到坟墓，/ **我们与他人相连。** |
| 卓别林《大独裁者》1940 | 我们想得太多，感受得太少。 | 比起机器，/ **我们更需要人性。** |
| 迪兰·托马斯，引自《星际穿越》 | 不要温和地走进那个良夜。 | 愤怒，愤怒于 / **光的消逝。** |
| 荒川弘《钢之炼金术师》 | 人若不付出代价，便什么也得不到。 | 这就是，/ **等价交换。** |
| 弗兰克·赫伯特《沙丘》1965 | 我不能恐惧，恐惧是思维的杀手。 | 我将直面它，/ **让它穿过我。** |
| 宫崎骏《千与千寻》2001 | 曾经发生的事，不可能忘记。 | 只是，/ **想不起来而已。** |
| 泰瑞尔博士，《银翼杀手》1982 | 燃烧得加倍明亮，便只燃一半的时间。 | 而你，/ **烧得实在太亮了。** |
| 《V字仇杀队》2005 | 这张面具之下，是一种思想。 | 而思想，/ **不怕子弹。** |
| 孔子《论语·子罕》 | 子在川上曰： | 逝者如斯夫，/ **不舍昼夜。** |
| 庄子《养生主》 | 吾生也有涯，而知也无涯。 | 以有涯，/ **随无涯，殆已。** |
| 爱比克泰德《手册》约公元125年 | 记住，你是一出戏里的演员， | 演好分给你的角色，/ **选择是别人的事。** |
| 帕斯卡《思想录》1670 | 人是一根苇草，自然界最脆弱的东西。 | 但他是一根，/ **能思想的苇草。** |
| 康德《实践理性批判》1788 | 有两样东西，愈思考愈敬畏： | 头顶的星空，/ **心中的道德律。** |
| 克尔凯郭尔《日记》1843 | 生活只能倒着被理解， | 但必须，/ **正着经历。** |
| 尼采《善恶的彼岸》1886 | 与恶龙缠斗过久，自身亦成为恶龙。 | 凝视深渊过久，/ **深渊回以凝视。** |
| 里尔克《安魂曲》1908 | 有何胜利可言？ | 挺住，/ **就是一切。** |
| 维特根斯坦《逻辑哲学论》1921 | 对于不可言说之物， | 我们必须，/ **保持沉默。** |
| 加缪《重返蒂巴萨》1952 | 在隆冬，我终于知道， | 我身上有一个，/ **不可战胜的夏天。** |

池子写在 `src/client/quotes.ts` 的 `HERO_QUOTES`，每条是 `{ setup, punch, turn, en, from, cite }`：`setup` 是起句，`punch` / `turn` 是落点的两行大字（`turn` 自动上黄铜），`en`/`from` 是英文小字，`cite` 是中文落款。加一条只需往数组里追加：起句一句说完，落点两行各控制在 3–8 个字。

#### 页面其他构件

- 传讯管：`MESSAGE TUBE // CHANNEL 07` 顶条 + 烟熏玻璃屏 + `ATTACH / PLAN / DEEPSEEK / SECTOR 07 / CTX / DISPATCH`。
- 作用域行：`SURVEY SCOPE` + 工作区 + 预设 + 会话选项（含分支）靠左成组，右侧收 `MESSAGE TUBE // CH 07`；选项组不能再吃一个 `margin-left: auto`，否则会和右侧说明文字平分空档、把分支推到轨道中央。
- 工单：三张 `SURVEY THE LOWER LEVELS` / `OPEN THE ARCHIVE` / `RUN DIAGNOSTICS`。
- 页脚：`ENTER TO DISPATCH · SHIFT+ENTER FOR A NEW LINE`，右侧 `AUX STABLE / 0.42 MPA / 03:17 LOCAL`。

### 5.4 对话页

- 顶部 `MACHINE LOG / SURVEY 014` + `● LIVE`。
- 会话头部：视图标签（`对话` / `轨迹`）按外壳尺度给 13px 等宽字，底边黄铜 2px 压在头部细线上；右侧「打开方式」在头部槽位是纯图标（图标 16px、高 30px），与 30px 标题行齐平；侧栏/交付物里同一组件的实例不受影响。
- 用户消息：一张**投递单**——暖纸、墨字、左侧红线；在暗色界面里像一张真实纸片。纸面只按消息自身高度收边，不额外留印章位。霓虹与落日把这张纸换成背光玻璃，墨色随之由 `--aw-note-ink` 换成浅色（见 §8.4）。
- 助手消息：深色铁面板/亮色纸报告；细黄铜分隔线，正文骨白/墨色。
- 思考行：铜绿小齿轮旋转 + `CALCULATING` + `NEEDLE 0.42`。
- 工具行：`TELEMETRY` + `VALVE ARRAY 07` + `STABLE · 1.2S`。
- 代码块：`PLATE VII // MACHINE CODE` + 三个仪表灯 + 钢板黑底；黄铜行号、铜绿函数、锈橙字符串。
- 输入口：与着陆页同一套传讯管，底部改为 `CONTINUE THE LOG`。

### 5.5 其他界面

| 界面 | 处理 |
| --- | --- |
| 设置 | `SURVEY MANUAL`；纸页/铁页 + 黄铜标签页；开关做成拨杆/汽灯 |
| 弹窗/菜单 | 铁面板 + 黄铜双线；选中项左侧黄铜轨 |
| Todo | `WORK ORDER` 夹板；完成项盖 `CLOSED` 章；进行中项亮琥珀灯 |
| 审批/提问 | `AUTHORIZATION REQUIRED`；批准 = 黄铜压印，拒绝 = 墨线描边 |
| 空状态 | `NO SIGNAL` / `AUXILIARY POWER ONLY`；不要大面积 spinner |
| 错误 | `SECTOR SEALED` / `TRACKING ERROR`；锈红细条 + 可读的详情，不做全屏故障艺术 |
| 加载 | 压力表指针缓慢摆动 + `PRESSURIZING`；不阻塞阅读 |

---

## 6. 动效

| 场景 | 动效 | 时长/曲线 |
| --- | --- | --- |
| 首次加载 | 汽灯点亮：亮度从 0 到 1，伴随一次极轻的闪烁 | 420ms ease-out |
| 空闲 | 压力表指针轻微抖动、汽灯呼吸、尘埃缓慢漂移 | 6–9s |
| 思考中 | 铜绿小齿轮旋转、指针抬升、`CALCULATING` 光标 | 1.2–8s |
| 工具运行 | 工具行铜绿边线呼吸、阀门指示灯交替 | 1.8s |
| 完成 | 黄铜压印一次、绿色指示灯亮起 | 220ms |
| 错误 | 红色印章落下（scale 1.08 → 1）、一次 120ms 的钢板震颤 | 160ms |
| 悬停 | 黄铜边高光扫过、箭头右移 1px | 160–180ms |
| 减少动态 | 全部关闭，保留颜色/边框状态 | `prefers-reduced-motion` |

所有动效 CSS-only；不做全屏闪烁；闪烁频率 < 3Hz；不在大面积上做 blur/glitch。

---

## 7. 可访问性与性能

- 暗色会话态实测：正文 9.7:1 @p99（最坏像素 8.6:1）、次级 dim 5.6:1 @p99（最坏 4.9:1），均达 AA；mute/faint 3.2–3.9:1，只用于装饰角标，不单独承载状态。黄铜/铜绿不作为唯一状态指示。
- 所有交互保留 `:focus-visible`：2px 琥珀外框 + 1px 深色内描边。
- 亮/暗两套独立设计，不是 `filter: invert()`。
- 背景为两张内联 WebP 底片：夜间巨构（1920×1080，约 70KB）用于浅色主题，黄昏列车（1672×941，约 114KB）用于暗色主题；构建时转 data URI，叠加 CSS/SVG 光效与噪点，无远程图片请求。
- `backdrop-filter` 只用于传讯管屏幕、弹窗、菜单；移动端降级为不透明。
- 大面积动画只改 `transform/opacity`；不做全屏 filter 动画。
- 响应式：1120px 收窄侧栏，840px 隐藏侧栏、单列工单；输入口最小高度 44px。
- 不覆盖原生键盘行为；装饰层 `aria-hidden` + `pointer-events:none`。唯一的全局键是着陆页的裸键 `R`（换一句题词），输入框/可编辑元素内不接管、带修饰键不接管，disposer 里 `removeEventListener`。

---

## 8. 插件技术方案

### 8.1 为什么是 client-only skin

`ctx.theme.register()` 只能覆盖 `--dsw-alias-*` 颜色，无法实现背景巨构、铆接钢板、标题栏仪表、印章、状态动画，也不能持久化第三方主题 id。要替换 `maid-atelier` 这种完整皮肤，应沿用 DSH 的 **client-only skin 插件**：

- `package.json` 声明 `dsh.client = { platform: 'web', inject: [] }`；
- 导出 `./client`，在 `apply(ctx)` 中设置 `body[data-dsh-sector-07]`、注入 CSS、补 favicon/theme-color；
- 用 `ctx.effect()` 注册清理；卸载时完全还原；
- `skin.json` 的 `wiring.id` 与其它皮肤互斥；
- 不注入服务、不发 Cordis 事件、不触达模型请求。

### 8.2 实际包结构

```text
dsh-sector-07/
├─ package.json                 # dsh.client = { platform: 'web', inject: [] }
├─ skin.json                    # 默认皮肤清单：id/bodyAttr/wiring/preview/tags
├─ cordis.patch.yml             # insert ui-skin-sector-07
├─ tsconfig.json
├─ build/
│  └─ build.mjs                 # esbuild: host ESM + client closure factory
├─ src/
│  ├─ index.ts                  # host 半边：no-op
│  └─ client/
│     ├─ index.ts               # apply(): 作用域 + 样式 + chrome + 切换器 + 清理
│     ├─ skins.ts               # 三套皮肤的名称/字牌/色板/favicon
│     ├─ quotes.ts              # 22 条题词与出处
│     ├─ theme.css              # 共用界面解剖，body[data-dsh-sector-07] 作用域
│     ├─ skins/neon.css         # 霓虹夜行材质覆盖
│     ├─ skins/sunset.css       # 落日海岸材质覆盖
│     ├─ scene.html             # 照片背景 + 光效/HUD 叠层（内联注入）
│     ├─ assets/hall.webp       # 1920×1080 夜间城市 + 巨构合成底片（构建时内联）
│     ├─ assets/dusk.webp       # 1672×941 黄昏站台底片（构建时内联）
│     ├─ assets/neon.webp       # 霓虹雨夜街道底片（构建时内联）
│     ├─ assets/sunset.webp     # 落日海岸底片（构建时内联）
│     └─ assets.d.ts            # *.css / *.html / *.webp 文本模块声明
├─ lib/
│  ├─ index.js                  # host no-op
│  └─ client.js                 # 浏览器 closure-factory artifact
├─ docs/
│  └─ aetherworks.md            # 以太工造设计/技术文档
├─ tests/
│  └─ apply.test.mjs            # jsdom 生命周期/契约测试
├─ preview/
│  ├─ index.html                # Aetherworks 可交互设计预览
│  ├─ live-*.png                # 实际 DSH Web GUI 截图
│  ├─ neon-hero.png             # 霓虹夜行首屏
│  ├─ sunset-hero.png           # 落日海岸首屏
│  └─ dark/light/chat*.png      # 设计稿截图
├─ README.md
└─ README.en.md
```

### 8.3 生命周期

```ts
const ATTR = 'data-dsh-sector-07'

export function apply(ctx: ClientContext): void {
  // 先登记清理，再做任何 DOM/CSS 写入：后续初始化失败也能完全回退。
  ctx.effect(() => () => {
    disposed = true
    observer?.disconnect()
    themeColorObserver?.disconnect()
    titleObserver?.disconnect()
    sidebarObserver?.disconnect()
    ownedNodes.forEach(node => node.remove())
    if (styleCreated) styleElement?.remove()
    restoreThemeColor()
    restoreTitle()
    if (hadAttr) body.setAttribute(ATTR, previousAttr ?? '')
    else body.removeAttribute(ATTR)
  }, 'ui-skin-sector-07: scope, styles and chrome')

  body.setAttribute(ATTR, '')
  injectStyle()                 // style[data-plugin-css="sector-07/theme.css"]
  injectScene()                 // fixed .aw-scene-host + 照片底片/HUD，aria-hidden
  injectFaviconAndThemeColor()
  syncChrome()                  // hero plate
  observeBodyAndTitle()         // 相位、主题、挂载变化时补回 chrome
}
```

实现细节：

- **场景对齐**：`ResizeObserver` 跟随侧栏宽度，把 `.aw-scene-host.style.left` 设成侧栏宽度，让巨构画面与内容列同轴；侧栏收起时场景自动铺开。
- **hero 层**：把 `[data-skin-chrome="hero-copy"]` 插进 `[data-phase="hero"] [class*="composerStack"]` 的第一个位置；隐藏原生 `[class*="headline"]`，保留其可访问文本。
- **对话层**：用 `[data-chat-flow-kind='user'|'assistant']`、`[data-tool]`、`[data-testid='todo-panel']`、`[data-question]`、`[data-approval]` 着色；用户消息变成纸质投递单，助手/错误保留机器日志的左侧结构线。
- **传讯管**：真实 composer 是 **contenteditable** + `[data-composer-placeholder]`，不是 textarea；样式同时覆盖 `[data-composer-input]`、`[data-composer-placeholder]` 和 textarea 兼容路径。
- **标题投影**：`MutationObserver` 监听 `<title>`，把 `DeepSeek Harness` 投影成 `以太工造 · DeepSeek Harness`，会话标题保留为 `会话 — 以太工造`。
- **互斥**：`skin.json.wiring.id = ui-skin-sector-07`；不注入服务、不发 Cordis 事件、不触达模型请求。

约束：

- 只移除自己创建的节点；不删除同名外来节点。
- 重复激活时复用同一条 `style[data-plugin-css]`，scene/favicon 先清理再注入；remount 后 hero plate 自动补回。
- 不读取/不修改模型请求；不依赖 `window.__DSH_*` 私有字段。
- 选择器优先用稳定 `data-*`：`data-phase`、`data-composer-card`、`data-input-mirror`、`data-conversation-scroll`、`data-chat-flow-kind`、`data-testid="todo-panel"`；类名只做 `[class*=...]` 兜底。
- 所有装饰层 `aria-hidden="true"` + `pointer-events:none`；`aria-hidden` 会连带藏掉内部控件，所以换句圆钮被移到 `.aw-quote-body` 之外单独暴露，换句结果通过 `role="status"` 的视觉隐藏行播报（「换到下一句：…，出自…。」）。

### 8.4 Token 层

```css
body[data-dsh-sector-07] {
  --dsw-alias-bg-base: #0b0806;
  --dsw-alias-bg-layer-1: #15100c;
  --dsw-alias-bg-layer-2: #1e1711;
  --dsw-alias-bg-layer-3: #241b13;
  --dsw-alias-bg-overlay: #1b130d;
  --dsw-alias-label-primary: #eadfc8;
  --dsw-alias-label-secondary: #b9a98e;
  --dsw-alias-label-tertiary: #8b7b64;
  --dsw-alias-label-caption: #6b5b46;
  --dsw-alias-border-l1: rgba(234, 223, 200, .10);
  --dsw-alias-border-l2: rgba(234, 223, 200, .18);
  --dsw-alias-border-l3: rgba(199, 154, 75, .34);
  --dsw-alias-brand-primary: #c79a4b;
  --dsw-alias-interactive-bg-hover: rgba(199, 154, 75, .10);
  --dsw-alias-interactive-bg-active: rgba(95, 143, 124, .12);
  --dsw-alias-state-success-primary: #5f8f7c;
  --dsw-alias-state-warn-primary: #f0b45e;
  --dsw-alias-state-error-primary: #a85435;
  --dsw-specific-sidebar-fill: #15100c;
  --dsw-specific-input-major: #0a0806;
  --dsw-alias-scrollbar-bg-l1: rgba(234, 223, 200, .12);
  --dsw-alias-scrollbar-hover-l1: #c79a4b;
}
```

亮色模式给 `body[data-dsh-sector-07]:not([data-ds-dark-theme])` 一套对应值。

用户消息这张便签的“纸”不是固定的：霓虹与落日把同一块底板重画成背光玻璃。纸面墨色 `#241c13` 落到深色玻璃上就是黑字黑底（实测对比度 1.1:1）。因此这块底板的正文、链接、引用 chip 单独走四个 token，和材质一起换：

| token | 以太工造（纸） | 霓虹（玻璃） | 落日（玻璃） |
| --- | --- | --- | --- |
| `--aw-note-ink` | `#241c13` | `#ffe6f1` | `#fff0e8` |
| `--aw-note-link` | `#6f2f1c` | `#ff9ecb` | `#ffc6a4` |
| `--aw-note-chip-bg` | `rgba(142, 59, 34, .08)` | `rgba(255, 61, 139, .12)` | `rgba(255, 143, 107, .12)` |
| `--aw-note-chip-line` | `rgba(142, 59, 34, .35)` | `rgba(255, 61, 139, .38)` | `rgba(255, 143, 107, .38)` |

新增材质只要重画底板的底色，就必须同时给这四个 token 一套在这块底上读得清的墨——只换底不换墨的改法会被 `tests/apply.test.mjs` 的 “the user-message plate re-inks every material that repaints it” 用例拦下。

组件层只覆盖有材质的部件：`[class*=sidebarCol]`、`[data-phase]`（对话根）、`[data-composer-card]`、`[data-composer-input]`、`[data-composer-placeholder]`、`[data-input-scroll]`、`[data-input-mirror]`、`[data-chat-flow-kind]`、`[data-tool]`、`[data-testid="todo-panel"]`、`[data-question]`、`[data-approval]`、`[role=dialog]`、`[role=menu]`、`[data-conversation-tabs]`、`[data-open-target]`（只作用于 `[class*=headerUtilities]` 内的 compact 实例）。

### 8.5 skin.json

```json
{
  "id": "aetherworks",
  "name": "以太工造",
  "nameEn": "Aetherworks",
  "author": "Evan1987",
  "tagline": "一座未完工的蒸汽巨构，仍在替不在的人运转",
  "taglineEn": "An unfinished steam megastructure, still running for the people who left",
  "accent": "#c79a4b",
  "bodyAttr": "data-dsh-sector-07",
  "package": "@zcm/dsh-client-ui-skin-sector-07",
  "wiring": { "id": "ui-skin-sector-07", "bundleWired": false },
  "preview": { "light": "preview/live-light.png", "dark": "preview/live-dark.png" },
  "tags": ["retrofuturism", "steampunk", "megastructure", "ruin", "industrial", "sepia"],
  "order": 6,
  "dshCompatibility": "0.2.1rc2"
}
```

### 8.6 构建、测试与安装

```bash
# 安装构建/测试依赖（esbuild + jsdom + typescript）
pnpm install

# 类型检查、构建、测试
pnpm typecheck
pnpm build
pnpm test
```

- `pnpm build` 运行 `build/build.mjs`：esbuild 产出 `lib/index.js`（ESM host no-op）和 `lib/client.js`（CJS closure factory）。CSS、HTML 与 WebP 通过 text/data loader 内联，浏览器端零运行时依赖、零资源请求。
- `pnpm test` 先构建，再运行 `tests/apply.test.mjs`：覆盖 body 属性、样式注入、场景/hero/侧栏 chrome、remount 补回、dark 切换、title 投影、卸载还原、初始化失败回退、manifest 一致性和 bundle 形态。
- 已在隔离的 `DSH_HOME` 中通过 `dsh plugin --profile web add` 安装；本次改版使用本地 DSH DOM 夹具逐屏渲染验证，真实 GUI 刷新后会加载同一份 `lib/client.js`。没有修改默认 profile。

安装到实际 profile：

```bash
# GitHub main
dsh plugin --profile web add 'github:Evan1987/dsh-sector-07#main'

# 或本地工作副本（先 pnpm build）
dsh plugin --profile web add "$PWD"
```

装好后重启一次 DSH。DSH 会把包加入 `~/.dsh/profiles/web/package.json` 的 `dsh.profile.bundles`。若仍保留 `@smalltailqwq/dsh-client-ui-skin-maid-atelier`，请移除它：

```bash
dsh plugin --profile web remove @smalltailqwq/dsh-client-ui-skin-maid-atelier
```

两套 skin 的 `bodyAttr` 与 `wiring.id` 不同；同时启用会叠加两套皮肤，不建议。

---

## 9. 验收清单

- [x] 亮/暗两套模式下，正文、次级文字、按钮、聚焦环均达到对比度要求（实际截图检查；正文/次级使用独立 token，非 filter 反色）。
- [x] 1440×900、1280×800、1024×768、390×844 不溢出、不遮挡（Chrome 实测 `scrollWidth === clientWidth`）。
- [x] 侧栏展开/收起、窄屏 rail（56px）、宽屏（280px）均正常；NEW SURVEY 退化为图标。
- [x] 着陆页、对话页、设置页、菜单、错误态已实际截图。
- [ ] Todo、审批、代码块、工具行：选择器与 token 已覆盖，尚未在真实事件流中逐项截图。
- [x] 卸载后 body 属性、style、hero plate、favicon、theme-color、title 全部还原（jsdom 测试）。
- [x] 重复激活/HMR 不重复注入：style 复用、scene/favicon 先清理再注入；remount 后 hero plate 自动补回。
- [x] 不修改任何 DSH 服务、事件或模型请求；无远程资源（仅内联 WebP 与 SVG data URI）。
- [x] `prefers-reduced-motion` 下关闭全部动画/过渡；无 >3Hz 闪烁。
- [ ] 与 maid-atelier 在真实 profile 中的互斥切换尚未执行（需要用户确认后移除旧 skin）。
- [x] 叙事标签不遮挡功能文案；当前默认开启，尚未提供关闭开关。

---

## 10. 下一步

v0.1 已交付。名称 `AETHERWORKS / 以太工造` 已确认，不再保留备选。

后续可选：

1. **叙事层开关**：在设置里增加 `NARRATIVE LAYER` 拨杆，关闭后隐藏 `PLATE VII`、`SURVEY 014`、`CREW 00`、`03:17` 等标签，只保留材质。
2. **ruin level 滑杆**：0 = 完整如新，100 = 断桥/藤蔓/更多锈迹；通过 body 上的 `data-aw-ruin` 驱动 HUD 与光效图层透明度。
3. **真实事件覆盖**：跑一轮带工具调用、Todo、审批、代码块的真实会话，补上这些状态的截图和细节。
4. **桌面 shell titlebar**：如果桌面端渲染 `[class*=titlebar]`，再补 42px 铆接钢板、停摆钟与压力表；Web GUI 目前没有这个区域。
5. **可选铜版画小徽章**：只做导航员/操作员徽章，不做立绘。

---

## 11. 运行状态

- 1440×900 与 1918×876 的暗/亮双主题已在本地 DSH DOM 夹具逐屏渲染验证；`pnpm test` 全部通过（含题词换句、皮肤切换不换句、标点悬挂、重挂载与 R 键用例）。
- 霓虹/落日这两套玻璃材质在真实 GUI 里逐屏量过对比度：用户便签正文最差 7.7:1（霓虹）/ 8.9:1（落日），整页正文无低于 4.5:1 的段落；以太工造的纸面墨色不变。
- 截图见本文开头的 `../preview/live-dark.png` / `../preview/live-light.png`。

---

## 12. 许可与边界

- 本实现的文字、配色、UI 结构、SVG 光效与 HUD 叠层均为原创。
- 例外：着陆页主标题引用 22 条经典台词与哲学名句（12 条影视台词 + 10 条中西哲学名句，逐条见 §5.3）。
- 每条在牌面下方用中文落款（作者/作品/年份）与英文小字双重标注出处；引用仅为文字，不含剧照、角色形象、标识或字体文件。
- 背景底片中的城市照片来自 Pexels（[photo 34945401](https://www.pexels.com/photo/34945401/)，Pexels License，可免费使用与修改，无需署名）；阶梯巨构、光效与 HUD 为原创 SVG，合成后裁切、调色并压缩为 WebP。
- 不包含、不复用任何第三方封面、肖像、标识或字体文件。
- 场景是原创合成，视觉语言参考《银翼杀手》等作品的夜间巨构/企业塔楼，但不包含任何电影剧照、角色或受版权保护的画面；不暗示与任何品牌、产品或具体项目的关联。
