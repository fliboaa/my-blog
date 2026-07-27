---
title: "Agent Loop 到底在干什么：从 ReAct 到循环工程"
excerpt: "Claude Code 创作者说\"我不再 prompt，我写循环\"。这篇用 PM 场景讲清楚 agent loop 是什么、和 ReAct 什么关系，以及为什么\"什么时候停\"是产品设计问题不是技术问题。"
coverImage: "/assets/blog/hello-world/cover.jpg"
date: "2026-07-08"
author:
  name: Aaron
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/hello-world/cover.jpg"
tags: ["智能体"]
readingTime: "15 分钟"
featured: true
toc: true
---

写完 ReAct 那篇之后，我以为"Agent 怎么工作"这个话题已经收尾了。但最近半年行业里冒出一个新说法，热度远超 ReAct 本身，叫 loop engineering（循环工程），或者更通俗的说法：agent loop（Agent 循环）。

事情的起因是 Claude Code 的创作者 Boris Cherny 说了句话："我不再 prompt Claude 了。我有循环在跑，是循环在 prompt Claude，在决定该做什么。我的工作是写循环。" 紧接着 Peter Steinberger 发了条推文："每月提醒：你不应该再手动 prompt 编程 Agent 了。你应该设计循环来 prompt 你的 Agent。" 这条推文 24 小时内浏览量破 500 万。

## 先说清楚：loop 不是新东西，是 ReAct 的升级

上一篇讲到 ReAct 是 Thought → Action → Observation 的循环。你已经知道循环了，为什么还要单独讲 loop 模式？

区别在于**谁在控制循环**。

ReAct 里，控制循环的是人。你发一条消息，模型跑一轮 Thought-Action-Observation，返回结果，你看到结果后再发下一条消息。Agent loop 把这个控制权也交出去了——你不再逐轮发消息，而是给 Agent 一个目标，Agent 自己判断有没有完成，没完成就继续循环，完成了就停。

> 用 PM 的场景类比：ReAct 是你带一个实习生做事，每一步你都在旁边盯着。Agent loop 是你给实习生一个明确的任务定义和验收标准，然后去开别的会了，他自己干，干完来找你验收。

## 一个 Agent Loop 只需要两样东西

**触发器（trigger）**——什么启动这个循环。只有三种：事件触发（一个 PR 被打开）、定时触发（cron 任务）、人工触发。

**可验证的目标（verifiable goal）**——一个明确定义的完成状态。关键在"可验证"三个字。"让代码更好"不是可验证目标，Agent 永远可以找到"更好"的空间，循环永远不会停。"所有测试通过、type check 无报错、覆盖率高于 80%"才是可验证目标。

## 失败模式和护栏

没有护栏的循环不是工具，是事故：

- **无限循环**：没有客观目标验证，Agent 总觉得"还能更好"
- **目标漂移**：跑着跑着偏离了原始目标
- **上下文溢出**：长对话塞满 context window，推理质量退化
- **token 成本爆炸**：单 Agent 4 倍于普通对话，多 Agent 15 倍

生产级 agent loop 必须配置护栏：硬性迭代上限、token 预算、无进展检测、熔断器、终止条件、人工检查点。

> 记住一条原则：护栏的目的不是消除自主性，而是限制自主性的边界。

## 这对 PM 意味着什么

**"什么时候停"是产品设计问题，不是技术问题。** 前面反复强调的可验证目标，本质上是 PM 要回答的问题：用户给你的 Agent 一个任务，什么算完成？这个问题回答不清楚，再强的模型也救不了产品。

**成本结构变了。** 传统 SaaS 成本是固定的，Agent loop 产品的成本是可变的，且和用户使用强度正相关。定价模型需要重新设计。

**护栏就是产品功能。** 最大迭代次数、成本预算、人工检查点应该作为产品功能展示给用户，而不是藏在后台。好的 Agent 产品不是"尽量少打扰用户"，而是"在关键时刻给用户控制感"。
