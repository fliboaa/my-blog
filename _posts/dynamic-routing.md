---
title: "ReAct 到底在干什么：让 LLM 从\"说\"到\"做\""
excerpt: "今天几乎所有 AI Agent 产品的底层都是 ReAct 的后代。Thought-Action-Observation 循环如何压缩幻觉表面积？为什么最常见的失败不是观察错误而是选错工具？"
coverImage: "/assets/blog/dynamic-routing/cover.jpg"
date: "2026-07-08"
author:
  name: Aaron
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/dynamic-routing/cover.jpg"
tags: ["智能体"]
readingTime: "12 分钟"
toc: true
---

调研报告里反复出现"Agent""工具调用""自主决策"这些词，但什么让一个 LLM 从"回答问题"变成"完成任务"？Transformer 解释了模型怎么理解输入和生成输出，但模型本身是封闭的——它只会"说"，不会"做"。ReAct 就是补上"做"这一半的框架。

论文名字叫 `ReAct: Synergizing Reasoning and Acting in Language Models`，Yao 等人 2022 年发表。名字来自 **Rea**soning + Ac**t**ing。今天几乎所有 AI Agent 产品——编程助手、研究机器人、自动浏览网页的 Agent——底层都是 ReAct 的后代。

## 先看问题：纯推理为什么不够用

上一篇文章讲到，Transformer 的训练目标是"预测下一个 token"。这意味着模型所有"知识"都来自训练数据。这就是 chain-of-thought（思维链）的做法——让模型"一步一步想"。

问题在于：模型"想"出来的中间数据可能是错的。更关键的是——**模型没有任何办法验证自己的记忆**。它只能越想越远，一个错误的数据被后续推理反复使用，错误逐层放大。

> 用 PM 的场景类比：chain-of-thought 就像你关在会议室里，只凭记忆写竞品分析。你能写出一份看起来合理的报告，但里面每个数据点都是你"觉得"的数字，没有一个是你查过的。

## Thought、Action、Observation——三个动作构成的循环

ReAct 的核心机制简单到让人意外：让模型交替执行三种动作，循环往复，直到得出最终答案。

- **Thought（思考）**：模型用自然语言推理
- **Action（行动）**：模型决定调用一个外部工具：搜索、查数据库、运行代码
- **Observation（观察）**：工具返回的结果被送回给模型

每一步都基于上一步的真实数据，而不是凭记忆猜。这就是 ReAct 和 chain-of-thought 的根本区别：**推理过程被外部事实锚定，不再是封闭的记忆回放**。

## 真正的失败模式：不是观察错误，是行动选择错误

研究中发现一个反直觉的结论：ReAct 最常见的失败不是"工具返回了错误数据"，而是"模型选错了工具"。

模型该用计算器的时候用了搜索引擎，该查数据库的时候用了通用搜索。这个发现对产品设计的意义很大——当你评估一个 Agent 产品时，注意力往往放在"模型推理能力强不强"上，但真正的瓶颈往往是**工具设计和工具描述质量**。

> 与其花时间纠结用哪个模型，不如把工具描述写得清楚、把工具粒度设计得合理。一个配了 5 个精准工具的中等模型，实际表现往往好过一个配了模糊工具的最强模型。

## 这跟做产品有什么关系

**为什么 Agent 比 Chatbot 贵得多。** ReAct 是一个循环，每一轮都是一次完整的 LLM 调用，而且每一轮都要把之前所有的 Thought 和 Observation 重新发给模型，token 消耗加速增长。

**为什么 Agent 不是万能的。** 如果一个任务可以用一次 API 调用完成，就没必要套 Agent 循环。先问"需不需要 Agent"，而不是默认所有任务都上 Agent。

**为什么 Agent 的可靠性很难评估。** 同一个任务跑两次，结果可能不完全一样。这意味着 Agent 产品需要全新的评估方法——不是 pass/fail，而是成功率分布、平均轮数、失败模式的分类统计。
