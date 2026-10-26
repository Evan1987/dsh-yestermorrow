# YESTERMORROW · 昨日之明日

**简体中文** · [English](README.en.md)

> 昨日想象的明日，今天的工作界面。

面向 **DeepSeek Harness Web GUI** 的复古未来主义皮肤合集。一个插件，三套风格：黄昏列车、霓虹雨夜、落日太空港。保留不同年代的材质与生活气息，把过去的人所想象的未来带进工作界面。

切换只改变视觉材质、场景与字牌，不重载页面，也不改变当前会话、输入内容和题词。

## 三套皮肤

### 以太工造 · AETHERWORKS

黄昏列车驶向远方的未来城市。黄铜、工业仪表和暖色车窗；明暗模式共用列车底图，亮色模式叠加测绘纸质感。

![以太工造最新主页](preview/live-dark.png)

<details>
<summary>查看亮色模式</summary>

![以太工造亮色主页](preview/live-light.png)

</details>

### 霓虹夜行 · NEON DRIFT

旧式出租车悬浮在雨夜街道，多层空中交通穿过霓虹灯牌。保留湿沥青、行人与还亮着灯的拉面店；青色与品红搭配背光玻璃。暗色专用。

![霓虹夜行最新主页](preview/neon-hero.png)

### 落日海岸 · SUNSET COAST

棕榈树、镀铬车身和珊瑚色落日。远处是六十年代想象中的海上太空港、单轨交通和复古飞行器；保持海岸的开阔与宁静。暗色专用。

![落日海岸最新主页](preview/sunset-hero.png)

三套皮肤共用 22 条影视与哲学题词，逐条标注出处。切换皮肤保留当前题词，点击题词旁的圆钮或按 `R` 可换一句。

## 安装

要求：DSH Web **0.2.1-rc.2** 或兼容版本。

```bash
dsh plugin --profile web add 'github:Evan1987/dsh-yestermorrow#main'
```

安装完成后重启一次 DSH。之后切换皮肤即时生效，无须重启。

卸载本插件：

```bash
dsh plugin --profile web remove '@zcm/dsh-client-ui-skin-yestermorrow'
```

## 使用

点击侧栏底部的当前皮肤名打开切换器，或使用快捷键：

| 快捷键 | 操作 |
| --- | --- |
| `Alt+1` | 以太工造 |
| `Alt+2` | 霓虹夜行 |
| `Alt+3` | 落日海岸 |
| `R` | 更换题词；输入框内不触发 |

皮肤选择保存在浏览器本地，刷新后保留。调试时可使用 `?skin=aetherworks`、`?skin=neon` 或 `?skin=sunset`。

同一 DSH profile 建议只启用一个皮肤插件，避免样式相互覆盖。

## 本地开发

```bash
git clone https://github.com/Evan1987/dsh-yestermorrow.git
cd dsh-yestermorrow
pnpm install
pnpm typecheck
pnpm test
pnpm build
dsh plugin --profile web add "$PWD"
```

- `src/client/index.ts`：挂载、切换、浏览器偏好与卸载清理。
- `src/client/skins.ts`：三套皮肤的配置；`quotes.ts`：共享题词池。
- `src/client/theme.css` 与 `src/client/skins/`：共用布局与各皮肤材质。
- `src/client/assets/`：实际使用的 WebP 背景。
- `build/build.mjs`：生成 `lib/index.js` 和 `lib/client.js`。构建产物随仓库提交，从 GitHub 安装无须再次构建。
- `tests/apply.test.mjs`：生命周期、皮肤切换、偏好迁移、题词与模块注册回归测试。

CI 在 Node 22 + pnpm 11 下运行类型检查、测试，并验证提交的构建产物与源码一致。

## 边界与许可

插件仅作用于客户端界面，不修改模型请求，不收集使用数据。CSS、WebP 与 SVG 全部内联，运行时不请求远程图片或字体。卸载会移除插件注入的界面节点和样式。

代码采用 [MIT License](LICENSE)。霓虹与海岸主图以原有底图为基础，经 AI 辅助改绘；列车底图沿用已有素材。题词仅引用文字并标注出处，不包含影视剧照或字体文件。更详细的设计记录见 [Aetherworks 文档](docs/aetherworks.md)。
