---
title: "Transformer 到底在干什么：所有大模型的同一颗心脏"
excerpt: "GPT、Claude、Gemini 名字不同，底层都是 Transformer。我是怎么用需求评审会类比 attention 机制，一点点搞懂 token、embedding、注意力的——理解了它，产品决策的技术边界就清楚了。"
coverImage: "/assets/blog/preview/cover.jpg"
date: "2026-07-08"
author:
  name: Aaron
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
tags: ["LLM 基础"]
readingTime: "14 分钟"
---

前几天写那份《技术型 PM 转型 AI PM》的调研报告，RAG、微调、Agent 选型框架都搭好了，但写完之后一直觉得少了点什么。技术决策框架告诉你"什么时候用 RAG"，却没有告诉你"为什么 GPT 能理解你的问题"。

卡住我的就是 Transformer。它不是又一个流行概念，而是当今所有大语言模型的引擎——GPT、Claude、Gemini、GLM，名字不同，心脏都是同一颗。如果 PM 不理解 Transformer 在干什么，就只能把模型当成一个黑盒"喂进去文字、吐出来文字"，无法判断产品决策的技术边界。

## 先搞清楚一个问题：模型在"读"什么

你给模型发一段文字，模型做的第一件事不是"理解"，而是把文字切成小块——叫做 token。

token 不是词，也不是字，而是介于两者之间的碎片。token 化之后，每个 token 会变成一个向量（一串数字）。你可以把向量想象成这个 token 在一个高维空间里的坐标——意义相近的 token 坐标也相近。这一步叫 embedding（嵌入），是模型"看见"世界的方式。模型不认识文字，只认识数字。

## Attention——整个架构的灵魂

Transformer 的论文标题叫 "Attention Is All You Need"，attention 机制就是这个名字的来源。

> 你在开一个需求评审会，会议室里有 10 个人。你不会给每个人分配同样的注意力——你会根据谁在说什么，动态分配你的注意力权重。如果产品总监突然提到"测试覆盖率"，你会立刻把更多注意力转向负责 QA 的同事。

attention 机制做的事情一模一样：对于句子中的每个 token，模型会计算它和**所有其他 token** 的相关程度，然后按相关程度加权汇总信息。这个"相关程度"不是人教的，是训练出来的。

## Self-Attention 的具体机制

每个 token 会生成三个向量：

- **Query（查询）**：这个 token 想找什么信息
- **Key（键）**：这个 token 能提供什么信息
- **Value（值）**：这个 token 实际包含的信息

用搜索类比就很直观：你在飞书文档里搜一个关键词，Query 是你输入的搜索词，Key 是每篇文档的标题，Value 是文档的内容。self-attention 做的事情是——**每个 token 都同时扮演搜索者和被搜索的文档**。

伪代码描述这个计算：

```python
# 每个 token 生成 Q/K/V 三个向量
# attention(Q, K, V) = softmax(Q·K^T / √d_k) · V
attention_weights = softmax(query @ key.transpose() / sqrt(d_k))
output = attention_weights @ value
```

`√d_k` 这个缩放因子是为了防止点积结果过大导致 softmax 梯度消失。整个计算对所有 token 并行执行——这就是 Transformer 训练效率远高于 RNN 的原因。

## 这跟做产品有什么关系

**为什么模型会产生幻觉**：attention 机制是在计算 token 之间的统计相关性，不是在做事实核查。模型不"知道"一个事实，它只是根据上下文"猜"最可能的下一个 token。

**为什么 cost 是可变的**：每次 API 调用都在做 attention 计算，输入 token 越多、输出 token 越多，计算量越大。

**为什么有 context window 限制**：attention 的计算复杂度是 O(n²)，n 是 token 数。窗口翻倍，计算量变 4 倍。这不是软件工程问题，而是数学问题。

> PM 不需要自己实现，但需要知道边界：token 是计量单位、attention 是核心机制、训练目标决定了能力边界、概率性是本质特征不是 bug。
