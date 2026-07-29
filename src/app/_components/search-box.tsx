"use client";

import { useMemo, useState, useRef, useEffect } from "react";

type SearchItem = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  readingTime?: string;
};

export function SearchBox() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);

  // 首次聚焦时才加载搜索索引,避免每页 HTML 都携带全量文章数据
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || items) return;
    // 标记已请求,避免重复 fetch
    loadedRef.current = true;
    fetch("/search-index")
      .then((r) => r.json())
      .then((data: SearchItem[]) => setItems(data))
      .catch(() => setItems([]));
  }, [items]);

  const hits = useMemo(() => {
    if (!items || !q.trim()) return [];
    const query = q.trim().toLowerCase();
    return items.filter((p) => p.title.toLowerCase().includes(query));
  }, [q, items]);

  const show = focused && q.trim().length > 0;

  return (
    <div className="search-box">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="搜索文章..."
        value={q}
        autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {show && (
        <div className="search-results">
          {!items ? (
            <div className="sr-empty">加载中...</div>
          ) : hits.length === 0 ? (
            <div className="sr-empty">没有匹配「{q}」的文章</div>
          ) : (
            hits.map((p) => (
              <a
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="sr-item"
              >
                <span
                  className="sr-title"
                  dangerouslySetInnerHTML={{
                    __html: highlight(p.title, q.trim()),
                  }}
                />
                <span className="sr-meta">
                  {p.tags?.[0] && (
                    <span className="tag tag-meta">{p.tags[0]}</span>
                  )}
                  {p.date} · {p.readingTime}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function highlight(title: string, q: string) {
  const idx = title.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return escapeHtml(title);
  return (
    escapeHtml(title.slice(0, idx)) +
    '<mark class="sr-mark">' +
    escapeHtml(title.slice(idx, idx + q.length)) +
    "</mark>" +
    escapeHtml(title.slice(idx + q.length))
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
