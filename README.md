# delivery-acceptance (YANSHOU · 验收)

> 一句话钩子：程序员说"做完了、测试全绿"——你敢直接合并吗？delivery-acceptance 替你做对抗性验收：不只出报告，而是闭环到「发现改进点 → 写 TDD 修复计划 → 派子代理修 → 最终复审」，直到交付可信、可合并。

[![Agent Skills](https://img.shields.io/badge/Agent-Skills-blue)]() [![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-green)]() [![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

## 你什么时候需要它？

- 程序员（或子代理）执行完一份 TDD/Superpowers 实施计划，宣称"全部完成"——你要在合并前独立核验。
- 计划的"测试全绿"自述不可信，需要有人以陌生视角对账"计划要求 X，代码里 X 真的有吗"。
- 交付里藏着只读代码挖不出的边界 bug（如"只有年份"误报、"十岁"解析失败），需要真跑测试 + 写探针才能暴露。
- 验收完不想止于报告——希望把发现的改进点直接闭环修掉，拿到可合并的最终交付。

## 它会交付什么？

三件落盘产物 + 一份对话内总结：

1. **验收报告** `<计划名>-acceptance-report.md`：三维度（计划完成度 / 代码质量 / Bug 审计）结论 + 证据 + 评分 + 执行者水平评价。
2. **TDD 改进计划** `<计划名>-polish.md`：每个改进点一个 Fix，先失败测试→改实现→跑绿。
3. **commit hash 记录**：报告里贴修复提交的 base/head SHA，形成「计划→代码→bug→修复→复审」可审计链。

## 快速开始

把 skill 装到 `~/.claude/skills/delivery-acceptance/`，然后：

```
/delivery-acceptance docs/superpowers/plans/2026-06-19-story-clock-part-a.md
```

或自然语言：「帮我验收 docs/plans/xxx 这个计划的交付」。

## 触发方式

用户说出以下任一意图时触发：

- "验收一下这次交付 / 帮我验收 <计划路径>"
- "程序员说做完了，你核实一下"
- "这个 plan 执行完了，做一次 acceptance"
- "审查一下交付质量 / 这次改动有没有 bug"
- 合并前的最后一道闸

## 示例

**输入**：「验收 docs/superpowers/plans/2026-06-19-story-clock-part-a.md，程序员说做完了」

**执行摘要**：
1. 抽取计划 9 个 Task 的「验收对照表」
2. 三维度验收：git log 核对 8 提交→Task 一一对应；读 timeline-check.mjs 评代码质量；跑 725 测试全绿 + 写 8 组边界探针
3. 探针挖出 2 个 P1（"只有年份"误报、time 字段透传不校验）+ 4 个新点
4. 写成 TDD polish 计划 → 派子代理 TDD 修复 → 最终复审逐 Fix 验证 + 全量回归 731 全绿
5. 输出报告 + 可合并判定

**输出片段**（验收报告）：
```
## 三、Bug 审计：0 个确认功能性 Bug，2 个低风险健壮性缺口
| B7 | 低 | continuity-store.mjs:15 | 透传 time 不校验 | 外部污染时畸形透传 | 已验证 |
```

## 它和同类有什么不同？

| 维度 | 普通 code-review skill | review-forge | **delivery-acceptance** |
|------|----------------------|--------------|------------------------|
| 验收对象 | PR diff | PR diff | **已写好的 TDD 计划 + git 历史** |
| 维度 | 单维（找 bug） | review→fix→verify | **三维度（完成度+质量+bug）** |
| 闭环 | 只报告 | fix+verify | **写 polish 计划→派子代理修→复审** |
| 边界探针 | ❌ | ❌ | **✅ 硬要求** |
| context-free | 部分 | ✅ | **✅** |

差异化：**三维度验收 × 全闭环 × 必跑探针**——目前没有任何 skill 把"计划完成度 + 代码质量 + Bug 审计"跑完再闭环到改进计划并派子代理执行。

## 安全边界

- 只读核验 + 在用户授权后才派子代理修复（不擅自自动重写交付）。
- 子代理只能改 polish 计划列出的文件，禁止 `git reset --hard`、`force push`、合并默认分支、打 tag——这些都要祈使句授权。
- 修复用显式 `git add <文件>`，不把工作树垃圾塞进提交。
- 不泄露 API key、私有路径、个人配置。

## 文件结构

```
delivery-acceptance/
├── SKILL.md                              # 主指令（七步工作流 + 核心原则）
├── README.md                             # 本文件
├── references/
│   ├── acceptance-dimensions.md          # 三维度检查清单与探针套路
│   ├── report-template.md                # 验收报告章节结构
│   ├── polish-plan-format.md             # TDD polish 计划 Fix 模板
│   └── dispatch-fix-subagent.md          # 派修复子代理 prompt + 降级 + 诚实披露核查
├── scripts/
│   └── probe-template.mjs                # 边界探针起手模板
└── evals/
    └── evals.json                        # 测试 prompt
```

## 验证与测试

见 `evals/evals.json`：3 个真实测试 prompt，对比 with-skill vs baseline（无 skill）。核心断言：是否跑了真实测试、是否写了探针、是否产出三件落盘产物、是否闭环到修复。

## License

MIT
