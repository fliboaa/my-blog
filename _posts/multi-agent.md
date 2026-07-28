---
title: "多 Agent 编排：从单兵到协作团队"
excerpt: "一个主管 Agent 把任务分给多个专职子 Agent（规划者、执行者、验证者）。Anthropic 内部评估显示多 Agent 系统比单 Agent 高 90% 表现，代价是 token 消耗暴涨。"
coverImage: "/assets/blog/preview/cover.jpg"
date: "2026-06-20"
author:
  name: Aaron
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
tags: ["智能体"]
readingTime: "11 分钟"
toc: true
---

多 Agent 编排是一个主管把任务分给多个专职子 Agent，自己协调而不执行。

## 收益与代价

Anthropic 内部评估：多 Agent 系统比单 Agent 高 90.2% 表现。代价是 token 消耗——单 Agent 约 4 倍于普通对话，多 Agent 约 15 倍。

## 什么时候该用

- 任务可并行拆解
- 需要不同视角交叉验证
- 单 Agent 的 context window 装不下

任务简单、可一次调用完成时，多套一层 Agent 编排只是增加成本和延迟。
