<sub>🌐 <b>中文</b> · <a href="README.en.md">English</a></sub>

<div align="center">

# delivery-acceptance · YANSHOU（验收）

> *「"测试全绿"不是验收，是自述。」*

[![Agent Skills](https://img.shields.io/badge/Agent-Skills-blueviolet)](SKILL.md)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-green)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**superpowers 计划交付后的独立验收闸——假设交付是错的，用探针证明它真假，再闭环修到可合并。**

![三维度验收](https://img.shields.io/badge/亮点-三维度验收-blue) ![必跑探针](https://img.shields.io/badge/亮点-必跑探针-orange) ![全闭环修复](https://img.shields.io/badge/亮点-全闭环修复-red) ![零Key](https://img.shields.io/badge/亮点-零Key-success) ![无人值守](https://img.shields.io/badge/亮点-无人值守-9cf)

> 同类 skill 只在 PR diff 上 review；本 skill 拿**已写好的计划 + 交付代码**逐 Task 对账，用探针挖出"测试全绿"掩盖的隐藏 bug，再闭环修到可合并。

[它解决什么](#它解决什么) · [效果示例](#效果示例) · [快速开始](#快速开始) · [触发方式](#触发方式) · [和同类有什么不同](#和同类有什么不同) · [安全边界](#安全边界)

</div>

---

## 它解决什么

事情是这样的：你用 superpowers / writing-plans 写了一份 TDD 实施计划，程序员（或子代理）跑完说"全部完成、测试全绿"。**你敢直接合并吗？**

验证证据常常是假的或片面的——"代码看起来绑了事件"替代了真实点击验证、"测试通过"掩盖了边界漏测、"计划要求 X"被悄悄降级成"近似做了 X"。这是 plan-driven 工作流的系统性盲区：**执行者会自我宣称完成，但没人独立对账。**

delivery-acceptance 把"验收"做成一条对抗性流水线：以**不知道计划怎么产生、不知道代码怎么写**的陌生视角，逐 Task 对照计划核实交付，跑真实测试、写探针脚本验证边界，再把发现的缺口闭环修掉。它不是"再 review 一遍"，而是"假设交付是错的，去证明它错"。

> 启动时用 `AskUserQuestion` 一次性问完四个问题（修复策略 / 补充维度 / 提交授权 / 验收深度），然后无人值守跑完整个验收闭环。

---

## 效果示例

> 下表为验收报告的结构形态。真实运行产物以你项目里的 `<计划名>-acceptance-report.md` 为准。结构示例见 [`examples/sample-acceptance-report.md`](examples/sample-acceptance-report.md)，**真实闭环案例**（脱敏）见 [`examples/real-loop-case-b1.md`](examples/real-loop-case-b1.md)。

**输入**：「验收这份计划，程序员说做完了」

**执行过程**：抽取计划 Task 清单 → 三维度验收（git log 核对提交↔Task；读核心新文件评质量；跑真实测试 + 写边界探针）→ 探针挖出隐藏缺口 → 写 TDD 改进计划 → 派子代理修复 → 最终复审。

**输出片段**（验收报告节选）：

```
## 三、Bug 审计：0 个确认功能性 Bug，2 个低风险健壮性缺口
| 编号 | 严重度 | 位置       | 描述           | 影响           | 状态     |
|------|--------|------------|----------------|----------------|----------|
| B7   | 低     | store.mjs:15 | 透传字段不校验 | 外部污染时畸形透传 | 已验证   |
```

---

## 快速开始

```bash
npx skills add wh520-wh/delivery-acceptance-yanshou
```

装完对 Agent 说：

```text
帮我验收 docs/plans/你的计划文件.md，程序员说做完了
```

> 也支持手动克隆到 `~/.claude/skills/delivery-acceptance/`。

---

## 触发方式

- "验收一下这次交付 / 帮我验收 `<计划路径>`"
- "程序员说做完了，你核实一下"
- "这个 plan 执行完了，做一次 acceptance"
- "审查一下交付质量 / 这次改动有没有 bug"
- 合并前的最后一道闸
- 斜杠：`/delivery-acceptance <计划文件路径>`

---

## 它会交付什么

三件落盘产物 + 一份对话内总结：

| 产物 | 路径 | 内容 |
|------|------|------|
| 验收报告 | `<计划名>-acceptance-report.md` | 三维度结论 + 证据 + 评分 + 执行者水平评价 |
| TDD 改进计划 | `<计划名>-polish.md` | 每个改进点一个 Fix，先失败测试→改实现→跑绿 |
| commit 记录 | 报告内贴 base/head SHA | 形成「计划→代码→bug→修复→复审」可审计链 |

---

## 和同类有什么不同

| 维度 | 普通 code-review skill | review-forge | verify-plan-skill | **delivery-acceptance** |
|------|----------------------|--------------|-------------------|------------------------|
| 验收对象 | PR diff | PR diff | 计划项↔diff 对账 | **计划文件 + git 历史** |
| 维度 | 单维（找 bug） | review→fix→verify | 完成度单维 | **三维度（完成度+质量+bug）** |
| 闭环 | 只报告 | fix+verify | 只报告 | **写计划→派子代理修→复审** |
| 边界探针 | ❌ | ❌ | ❌ | **✅ 硬要求** |
| 决策前置无人值守 | ❌ | ❌ | ❌ | **✅ Step 0 一次性问完** |
| 保护既有契约 | — | 部分 | — | **✅ 原则明写** |
| API Key | — | — | — | **✅ 零 Key** |

差异化：**三维度验收 × 必跑探针 × 全闭环 × 零 Key**——这条细分赛道目前是草创期、无王者，没有任何 skill 把"计划完成度 + 代码质量 + Bug 审计"跑完再闭环到改进计划并派子代理执行。

---

## 安全边界

- 只读核验；修复必须在 Step 0 授权后才派子代理，不擅自重写交付。
- 子代理只能改 polish 计划列出的文件，禁止 `git reset --hard`、`force push`、合并默认分支、打 tag——这些要祈使句授权。
- 修复用显式 `git add <文件>`，不把工作树垃圾塞进提交。
- 探针脚本跑完即删，不污染被测项目。
- 不泄露 API key、私有路径、个人配置。

---

## 文件结构

```
delivery-acceptance/
├── SKILL.md                              # 主指令：八步工作流 + 7 条核心原则
├── README.md                             # 本文件
├── references/
│   ├── acceptance-dimensions.md          # 三维度检查清单与探针套路
│   ├── report-template.md                # 验收报告章节结构
│   ├── polish-plan-format.md             # TDD polish 计划 Fix 模板
│   └── dispatch-fix-subagent.md          # 派修复子代理 prompt + 降级 + 诚实披露核查
├── scripts/
│   └── probe-template.mjs                # 边界探针起手模板（通用）
├── examples/
│   ├── sample-acceptance-report.md       # 验收报告结构示例（明标示例，非真实运行）
│   └── real-loop-case-b1.md              # 真实闭环案例（脱敏）：探针挖 B1 + 保护契约 + 731→733
└── evals/
    └── evals.json                        # 测试 prompt
```

---

## 验证与测试

见 `evals/evals.json`：3 个测试 prompt，覆盖全闭环验收、缺计划路径要问、子代理不可用降级。合格表现：真跑 `node --test`、写边界探针、产出三件落盘产物、闭环到修复而非止于报告。

**真实闭环案例**：[`examples/real-loop-case-b1.md`](examples/real-loop-case-b1.md) 记录了一次真实验收——探针挖出既有 731 测试挖不到的 B1（混合粒度日期误报），修复时守住 `comparable` 契约（对比 baseline 改契约引入回归的做法），TDD 红绿，全量回归 731→733 全绿。这条"探针证明交付有假 → 保护契约修复 → 复审全绿"的链路是 skill 价值的核心实证。

---

## 致谢

- 方法论建立在 [obra/superpowers](https://github.com/obra/superpowers) 的 writing-plans / TDD 工作流之上。
- 闭环形态借鉴 [vikingmute/review-forge](https://github.com/vikingmute/review-forge) 的 review→fix→verify 思路。
- 同行生态调研参考 [datastone-inc/verify-plan-skill](https://github.com/datastone-inc/verify-plan-skill)（"幻象完成"）、[avelikiy/great_cto](https://github.com/avelikiy/great_cto)（对抗式验收）。

---

## License

[MIT](LICENSE)
