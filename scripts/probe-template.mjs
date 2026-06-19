// 边界探针起手模板
//
// 用法（两种）：
//   1. 内联（推荐，临时性）：
//      node --input-type=module -e '<把下面 import + 断言粘进去>'
//   2. 落文件（要复用/归档时）：cp 此模板到项目临时目录，改 import 与用例后跑。
//
// 探针的目的：把"疑似 bug"变成"确认 bug"或"排除"。每个疑点一个探针，给 yes/no。
// 跑完即可删，不要污染项目；若要归档证据，把输出粘进验收报告。

import assert from "node:assert/strict";
// 按实际项目改 import 路径：
// import { targetFunction } from "./src/core/target.mjs";

// === 探针 1：边界输入（计划测试没覆盖的中间态）===
// 例：验证 "只有年份" 是否误判
// const r = targetFunction("2021年");
// console.log("只有年份 comparable:", r.comparable, "(预期 false)");
// assert.equal(r.comparable, false, "只有年份不应参与裁决");

// === 探针 2：状态序列（倒退后又继续，基准是否被污染）===
// 例：构造倒退序列，看后续判断是否相对正确基准
// const seq = [an(3, "2021年3月10日"), an(5, "2021年3月5日"), an(7, "2021年3月8日")];
// console.log("倒退序列:", JSON.stringify(checkTimeline(seq).violations.map(v => ({ ch: v.chapter_no, prior: v.prior_chapter }))));

// === 探针 3：乱序输入（排序假设是否成立）===
// const unordered = [an(5, "..."), an(3, "...")];
// console.log("乱序:", JSON.stringify(checkTimeline(unordered).violations));

// === 探针 4：畸形透传（旧数据/外部污染是否一路透传）===
// 构造畸形字段，喂下游，看不崩 + 看是否被静默降级

// === 探针 5：同章重复（是否重复累加/重复比较）===

// === 探针 6：依赖方向（grep 核查无循环依赖，在 shell 里跑）===
//   grep -n "import" src/core/A.mjs  →  A 依赖谁
//   grep -c "A" src/core/B.mjs       →  B 是否反向依赖 A

console.log("探针模板：取消上方注释，按实际项目改 import 与用例后跑。");
