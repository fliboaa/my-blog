---
title: "Hermes Skill 设计原则与避坑指南"
excerpt: "Skill = 触发条件 + 仅团队特有逻辑 + 避坑清单。description 是触发器不是功能清单，渐进式披露三层结构，以及\"装到错误的 venv\"等实战踩坑。"
coverImage: "/assets/blog/preview/cover.jpg"
date: "2026-06-16"
author:
  name: Aaron
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
tags: ["实战工程"]
readingTime: "10 分钟"
toc: true
---

Skill 是封装好的程序化记忆。一句话总结：**Skill = 触发条件 + 仅团队特有逻辑 + 避坑清单**。

## 渐进式披露

Skill 的三层结构，每层服务不同决策：

| 层级 | 内容 | Token 预算 | 作用 |
|------|------|-----------|------|
| Frontmatter | name + description | ~100 token | 模型决定"要不要加载" |
| SKILL.md 正文 | 操作步骤、避坑 | <5k token | 模型决定"怎么执行" |
| references/ | 详细参考 | 按需加载 | 执行中需要时才读 |

## Description 是触发器不是功能清单

写成"能做 A/B/C"模型就不知道何时触发；写成"当用户发来 URL 需要剪藏时"模型一击即中。

判断标准：读完 description，模型能否在不看正文的情况下决定"现在该不该用它"。
