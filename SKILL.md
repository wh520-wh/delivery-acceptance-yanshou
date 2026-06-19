---
name: delivery-acceptance
description: Accept a completed implementation plan end-to-end — verify plan-completion, code quality, and bug-audit, then close the loop by writing a TDD polish plan, dispatching a subagent to fix it, and re-auditing. Also answers to the alias YANSHOU (验收). Use this skill whenever the user asks to "验收一次交付/accept a delivery/verify a completed plan/review this implementation against its plan", or invokes /delivery-acceptance or /YANSHOU, or after a developer (or subagent) finishes executing a TDD/Superpowers implementation plan and someone needs to adversarially confirm the work actually meets the plan. Always use when the user mentions 验收, YANSHOU, acceptance, or hands you a plan file path saying the work is done. This skill is mandatory before merging any plan-driven delivery — never let a plan's "all green" self-claim substitute for independent acceptance.
---

# delivery-acceptance (YANSHOU · 验收)

> 一句话：你把"已写好的计划 + 程序员/子代理交付的代码"交给它，它以**独立验收师傅**视角对抗性核验——不只出报告，而是闭环到「发现改进点 → 写 TDD 改进计划 → 派子代理修复 → 最终复审」，直到交付可信、可合并。

## 这个 skill 解决什么

Plan-driven 工作流（superpowers / writing-plans）有个系统性盲区：**执行者会自我宣称"全部完成、测试全绿"，但没人独立对账**。验证证据常常是假的或片面的——"代码看起来绑了事件"替代了真实点击验证、"测试通过"掩盖了边界漏测、"计划要求 X"被悄悄降级成"近似做了 X"。

delivery-acceptance 把"验收"做成一条对抗性流水线：以**不知道计划怎么产生、不知道代码怎么写**的陌生视角，逐 Task 对照计划核实交付，跑真实测试、写探针脚本验证边界，再把发现的缺口闭环修掉。它不是"再 review 一遍"，而是"假设交付是错的，去证明它错"。

## 何时触发

用户说出任何以下意图时触发（斜杠 `/delivery-acceptance` 或 `/acceptance`，或自然语言）：

- "验收一下这次交付 / 帮我验收 docs/plans/xxx 这个计划"
- "程序员说做完了，你核实一下"
- "这个 plan 执行完了，做一次 acceptance"
- "审查一下交付质量 / 这次改动有没有 bug"
- 交付后合并前的最后一道闸

## 输入（只认计划文件）

**唯一必需输入：实施计划文件路径**（如 `docs/superpowers/plans/2026-06-19-xxx.md`）。

- 如果用户消息里**没有**计划文件路径 → **立即停下来问用户**："请给我需要验收的计划文件路径。" 不要猜测、不要扫目录猜一个。
- 计划文件是 ground truth：从中抽取 Task 清单、每 Task 要求改/建的文件、关键函数签名、关键测试、提交信息预期、Self-Review 声明。
- git 历史从 `git log` 自动取（计划文件提到的提交或最近 feat 提交），不需要用户提供 commit hash——但如果用户给了，以用户给的为准。

## 输出（三件落盘 + 一份对话内总结）

每次验收必须产出三样东西，缺一不算完成：

1. **验收报告**（markdown，落盘到 `<计划文件同目录>/<计划名>-acceptance-report.md`）：三维度结论 + 证据 + 评分 + 执行者水平评价。
2. **改进计划**（TDD，落盘到 `<计划文件同目录>/<计划名>-polish.md`，复用 superpowers/writing-plans 的 plan 格式）：每个改进点一个 Fix，先失败测试→改实现→跑绿。
3. **commit hash 记录**：报告里贴出修复提交的 base/head SHA，形成「计划→代码→bug→修复→复审」可审计链。

最后在对话里给用户一份简短总结（三维度一句话结论 + 报告路径 + 是否可合并）。

## 核心原则（不能违背）

1. **刨子和尺子不握在同一只手。** 验收视角必须假设自己完全不知道交付过程——像第一次看到这个仓库的陌生人。不要因为"我看着它写出来的"就放水。
2. **evidence before assertions。** 任何"完成/通过/无 bug"的结论，必须先有跑过的命令、写过的探针、看过的 diff 作为证据。禁止"看起来没问题"式断言。
3. **跑真实测试 + 写探针 + 边界用例是硬要求。** 不能只读代码 + git log 就出报告。边界用例（如"十岁"解析、"只有年份"误报）是验收的价值所在——只跑既有测试永远绿，挖不出隐藏 bug。
4. **闭环而非止于报告。** 发现改进点后必须写 polish 计划 + 派子代理修复 + 复审。纯报告模式（只指出问题不动手）是 skill 的失败状态——那是给上游添堵，不是验收。闭环的默认终点是"修复已提交、复审通过"，不是"报告写完"。
5. **context-free 子代理。** 派出去做审计/修复的子代理，prompt 里只给"任务 + 文件路径 + 计划摘要"，**不继承会话上下文**，杜绝确认偏差。
6. **最小改动、保护既有契约。** 修复一个 bug 时，优先在"问题发生的局部"做最小修改，不要顺手改写一个已被对抗性评审过的既有契约/设计（如 `comparable` 字段的语义）。改既有契约会波及所有依赖它的路径（render/fact-check/迁移），引入回归。如果真要改契约，必须在 polish 计划里显式声明"本 Fix 改动既有契约 X，影响路径 Y/Z"，并让复审重点核查这些路径。
7. **决策前置、不中途打断。** 所有需要用户定夺的决策（修复策略/补充维度/提交授权/验收深度）必须在 Step 0 一次性问完。之后除非撞上强制停手点的高风险动作，否则一路跑到底，不要在验收中途或报告写完才回头问用户——那样无法长时间无人值守运行。

## 工作流（八步）

### Step 0 · 前置决策问卷（启动即问，问完无人值守跑到底）

**这是最重要的设计原则：所有需要用户定夺的决策，必须在 skill 一启动、刚加载完时就一次性问完。** 不要跑到验收一半或写完报告才问——那样会中途打断用户、无法长时间无人值守运行。问完这四项后，后续 Step 1-7 全部按用户已定的参数自动执行，中途不再停下问用户（除非遇到强制停手点里的高风险动作）。

拿到计划文件路径后，立即用 `AskUserQuestion` **一次性**问以下四项（可合并成一次多问题调用）：

1. **闭环修复策略**：发现改进点后怎么处理？
   - 派子代理 TDD 修复 + 复审（默认推荐）
   - 主 agent 本人接管修复 + 复审
   - 只出验收报告 + polish 计划，不修复（报告标注"未闭环"）

2. **补充维度**：除默认三维度（计划完成度 / 代码质量 / Bug 审计）外，是否追加？
   - 不追加（默认三维度）
   - 追加性能 / 安全 / 文档完整性 / 可访问性 等（用户勾选）

3. **修复后提交/合并授权**（仅当用户选了"要修复"时相关）：
   - 修完直接 git commit，但不合并（默认推荐，提交等你审）
   - 修完直接 commit + 合并到当前分支
   - 只改工作区文件，不 commit（等你 review 后自己提交）

4. **验收深度**：
   - 标准（跑真实测试 + 写探针 + 边界用例，默认推荐）
   - 快速（只读代码 + git log + 跑既有测试，不写探针）——仅当用户明确说"快速看一眼"才用，报告须标注"浅验"

> 把用户的四个答案记下来，作为后续所有 Step 的执行参数。Step 6 的"派不派子代理/能不能提交"全部照此执行，不再二次询问。

### Step 1 · 建任务追踪

多步骤任务必须用 TaskCreate 建列表（CLAUDE.md 铁律）：三维度验收（+ 用户追加的补充维度各一个 task）+ 写 polish 计划 + 修复 + 最终复审，各一个 task。每完成一步 TaskUpdate。

### Step 2 · 抽取计划基线

读计划文件，建一张「验收对照表」：每个 Task → 要求的文件/函数/测试/提交信息。同时读计划末尾的 Self-Review 段（它声明了哪些"本期不做"的取舍——这些不是遗漏，但要核实声明与实现一致）。

### Step 3 · 三维度验收（并行或串行，每个维度独立出证据）

详见 `references/acceptance-dimensions.md`。摘要：

- **① 计划完成度**：逐 Task 对照「验收对照表」核实。git log 的提交是否与 Task 一一对应；每个要求的文件/函数/测试是否真存在；评审硬伤（计划里标注的 A1/A2…）是否真被修掉。
- **② 代码质量**：读核心新文件 + 改动部分。看分层（纯函数 vs IO）、命名跨模块一致性、误报防护是否到位、注释解释 why。给 1-5 分各维度。
- **③ Bug 审计**：先跑真实测试拿基线，再写探针脚本验证边界（null/非法输入/中文数字/跨年/同章重复/数据流不对称等）。区分"确认 Bug"与"疑似需确认"。

> 关键：第②③维度必须真跑测试 + 写探针。只读代码会漏掉「计划没覆盖的中间态」（如"只有年份"这种计划测试没写、但实际会误报的输入）。

### Step 4 · 汇总验收报告

落盘验收报告（结构见 `references/report-template.md`）：三维度结论 + 评分 + 改进点清单（按 P1/P2/P3 排序，每条带 file:line + 一句话 + 是否已验证复现）+ 执行者水平评价。

### Step 5 · 写 TDD polish 计划

把验收报告里的改进点写成 `references/polish-plan-format.md` 格式的 TDD 计划，落盘到 `<计划名>-polish.md`。每个 Fix：先写失败测试（贴可粘贴代码）→ 跑红 → 写实现 → 跑绿。报告里引用该计划文件路径。

### Step 6 · 执行修复（按 Step 0 已定策略，不二次询问）

**按 Step 0 用户已定的"闭环修复策略"执行，不再二次询问。** 三种情况：

- **派子代理修复**（默认）：派一个 general-purpose 子代理，prompt 里包含 polish 计划文件路径 + 要求（严格 TDD、每 Fix 红绿、全量回归、单次提交、**最小改动不动既有契约**、发现计划 bug 时做等价修正并在报告里披露）。详见 `references/dispatch-fix-subagent.md`。提交与否按 Step 0 的"修复后提交/合并授权"执行。
- **主 agent 本人接管修复**：自己跑 TDD 红→绿→回归，在报告里声明"本环节由主 agent 执行而非独立子代理"。
- **只出报告不修复**：跳过 Step 6-7，报告醒目标注"交付未闭环、不可合并"，在对话里明确告知用户。polish 计划仍要落盘交付。

> 设计原则：修复决策已在 Step 0 一次性问完，这里直接执行。**不要在验收跑到一半或报告写完才回头问用户"要不要修"**——那会打断长时间无人值守运行。唯一例外是强制停手点（见下）里的高风险动作。

**降级处理**（仅当用户选了"派子代理修复"但子代理失败时）：若子代理因模型不可用失败（如模型名拼错、无权限），不要卡住、也不要回头问用户——按以下顺序自动降级：
1. 重试一次（换 agentType 或显式 model）；
2. 仍失败 → **本人（主 agent）直接接管执行** polish 计划，在报告里声明"本环节因子代理不可用，由主 agent 接管"。

### Step 7 · 最终复审

修复提交后，以**独立验收师傅视角**复审（不是修复者自评）：

- **逐 Fix 独立验证**：写探针脚本，确认每个 Fix 实际生效（如"2021年" 现在返回 comparable:false）；
- **全量回归**：跑 `node --test tests/*.test.mjs`（或项目对应测试命令），确认全绿、无回归；
- **依赖方向核查**：若 Fix 引入了模块间新依赖，用 grep 核查无循环依赖；
- **核查子代理的"诚实披露"**：若子代理报告里说自己做了"等价修正"或"跳过某 Fix"，核实其合理性。

复审结论写进验收报告的"最终审查"章节，给最终可合并判定。

## 强制停手点

Step 0 已经把主要决策前置问完，正常情况下后续无人值守跑到底。但以下**真正高风险**的节点仍必须停下问用户（这些是无法在开头预判、必须看到具体情况才能定夺的）：

1. polish 计划里某个 Fix 会**大幅改变交付的语义/架构**（超出"最小改动修 bug"范畴）时——停下来让用户确认方向，而不是直接改；
2. 修复涉及 Step 0 未授权的**合并到默认分支、打 tag、对外部署、force push**时——每次都要拿到祈使句授权（"merge 吧"才算授权，"都解决了吧？"只是问状态）；
3. 验收中发现交付有**严重数据损坏/安全漏洞**这类需立即人工介入的问题，不能等流程跑完。

> 注意：普通的"派子代理修复 / commit 到当前分支"不属于强制停手点——这些已在 Step 0 授权。不要借"安全"之名重新引入中途打断。

## 反例黑名单（不要做这些）

- 不要只读代码 + git log 就出报告，必须跑测试 + 写探针。
- 不要把交付者的"测试全绿"自述当证据，自己跑一遍。
- 不要让验收视角和修复视角是同一个上下文——派子代理时切断会话上下文。
- 不要纯报告模式收场——发现改进点不闭环修掉，是验收的失败。
- 不要为凑改进点而堆冗余 Fix；宁缺毋滥，每个 Fix 必须过验证门。
- 不要把私有路径、API key、个人配置写进报告或 polish 计划。
- 不要用 `git reset --hard` 当默认回退；涉及 git 优先可审计的 revert/diff。

## 进阶参考（按需读取，不必全读）

- `references/acceptance-dimensions.md` — 三维度各自的检查清单与探针套路（边界用例从哪几类挖）。
- `references/report-template.md` — 验收报告的章节结构与评分表。
- `references/polish-plan-format.md` — TDD polish 计划的 Fix 模板（复用 superpowers/writing-plans 风格）。
- `references/dispatch-fix-subagent.md` — 派修复子代理的 prompt 模板 + 降级路径 + 诚实披露核查。
- `scripts/probe-template.mjs` — 边界探针脚本的起手模板（`node --input-type=module -e` 内联或落临时文件）。
