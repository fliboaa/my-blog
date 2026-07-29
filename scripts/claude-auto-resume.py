#!/usr/bin/env python3
"""
claude-auto-resume.py — 自动续跑被 rate limit / 额度耗尽中断的 Claude Code 任务

原理:
  启动 claude -p "task" --output-format json
    → 解析退出结果
      ├─ success  → 输出结果,退出
      ├─ rate_limited / 异常退出 / 无完整 JSON → 提取 session_id
      │     → 指数退避等待 (60s→120s→240s... 上限 30min)
      │     → claude -p "继续" --resume <session_id> → 回到解析退出结果
      └─ 重试次数耗尽 → 报错退出

不靠预测"额度何时恢复"(无法可靠预测),而是指数退避 + 直接重试:
额度恢复那一次重试自然成功,失败就继续等。

用法:
  python3 claude-auto-resume.py "你的任务描述"
  python3 claude-auto-resume.py "任务描述" --workdir /path/to/project
  python3 claude-auto-resume.py "任务" --max-turns 20 --max-retries 10

环境变量:
  CLAUDE_BIN       claude 可执行文件路径 (默认从 PATH 查找)
  CLAUDE_MIN_WAIT  单次等待下限秒数 (默认 1200 = 20min)
  CLAUDE_MAX_WAIT  单次等待上限秒数 (默认 1800 = 30min)
"""
from __future__ import annotations

import argparse
import json
import os
import random
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path


# ── 配置 ────────────────────────────────────────────────
# 每次重试前等待随机时间,区间 [MIN_WAIT, MAX_WAIT],默认 20~30min
MIN_WAIT = int(os.environ.get("CLAUDE_MIN_WAIT", "1200"))  # 20 min
MAX_WAIT = int(os.environ.get("CLAUDE_MAX_WAIT", "1800"))  # 30 min
DEFAULT_MAX_RETRIES = 6  # 6 次 × (20~30min) ≈ 2~3 小时

# claude -p 输出的 JSON 里,以下 subtype/字段组合代表"任务未完成,值得重试"
RETRY_SUBTYPES = {"error_max_turns", "error_budget", "error_rate_limit", "error_api"}
# is_error=true 或 api_error_status 非 null 也视为可重试


def log(msg: str) -> None:
    """带时间戳的单行日志,输出到 stderr(不污染 stdout 的 JSON 结果)"""
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", file=sys.stderr, flush=True)


def find_claude_bin() -> str:
    """定位 claude 可执行文件"""
    env_bin = os.environ.get("CLAUDE_BIN")
    if env_bin and Path(env_bin).exists():
        return env_bin
    found = shutil.which("claude")
    if found:
        return found
    sys.exit("错误: 找不到 claude 可执行文件,请安装 @anthropic-ai/claude-code 或设置 CLAUDE_BIN")


def extract_session_id(stdout: str, stderr_text: str, workdir: str) -> str | None:
    """
    多策略提取 session_id:
    1. 从 stdout 的 JSON result.session_id
    2. 从 stderr 中正则匹配 session ID (UUID 格式)
    3. 从 ~/.claude/projects/<encoded-workdir>/ 找最近修改的 .jsonl 文件名
    """
    # 策略1: stdout JSON
    if stdout.strip():
        try:
            data = json.loads(stdout)
            sid = data.get("session_id")
            if sid:
                return sid
        except json.JSONDecodeError:
            pass

    # 策略2: stderr 正则匹配 UUID
    uuid_pattern = re.compile(
        r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b",
        re.IGNORECASE,
    )
    for text in (stderr_text, stdout):
        m = uuid_pattern.search(text)
        if m:
            return m.group(0)

    # 策略3: 扫描 ~/.claude/projects/ 找最近 jsonl
    if workdir:
        # claude 把 workdir 路径编码成目录名: /path/to/x → -path-to-x
        encoded = workdir.replace("/", "-")
        if encoded.startswith("-"):
            encoded = encoded  # 保留前导 -
        projects_dir = Path.home() / ".claude" / "projects"
        candidates = [projects_dir / encoded, projects_dir / encoded.lstrip("-")]
        for d in candidates:
            if d.is_dir():
                jsonl_files = sorted(d.glob("*.jsonl"), key=lambda f: f.stat().st_mtime, reverse=True)
                if jsonl_files:
                    return jsonl_files[0].stem

    return None


def classify_result(stdout: str, exit_code: int) -> tuple[str, dict | None]:
    """
    分类 claude 进程的退出结果。

    返回 (status, parsed_json):
      status ∈ {"success", "retryable", "fatal"}
      parsed_json 为解析出的 JSON dict (可能为 None)
    """
    # 尝试解析 stdout 为 JSON
    parsed = None
    if stdout.strip():
        try:
            parsed = json.loads(stdout)
        except json.JSONDecodeError:
            pass

    if parsed:
        subtype = parsed.get("subtype", "")
        is_error = parsed.get("is_error", False)
        api_error = parsed.get("api_error_status")

        # 明确成功
        if subtype == "success" and not is_error:
            return "success", parsed

        # 可重试的错误 subtype
        if subtype in RETRY_SUBTYPES:
            return "retryable", parsed

        # API 错误 (rate_limit, overloaded, server_error 等)
        if api_error in ("rate_limit", "overloaded", "server_error", "billing_error"):
            return "retryable", parsed

        # is_error=true 但没明确分类 → 保守起见也重试
        if is_error:
            return "retryable", parsed

        # 其他已知 subtype 但不是 success
        return "fatal", parsed

    # 没有 JSON 输出
    # exit_code 非 0 通常意味着进程被中断 (rate limit 导致 API 报错退出)
    if exit_code != 0:
        return "retryable", None

    # exit_code=0 但没输出,异常情况
    return "fatal", None


def run_claude(
    claude_bin: str,
    task: str,
    workdir: str,
    max_turns: int,
    session_id: str | None = None,
    extra_args: list[str] | None = None,
) -> tuple[str, str, int]:
    """
    执行一次 claude -p 调用。
    返回 (stdout, stderr, exit_code)。
    """
    cmd = [claude_bin, "-p", task, "--output-format", "json"]
    if session_id:
        cmd.extend(["--resume", session_id])
    if max_turns:
        cmd.extend(["--max-turns", str(max_turns)])
    if extra_args:
        cmd.extend(extra_args)

    log(f"执行: {' '.join(cmd[:4])}...{' --resume ' + session_id[:8] if session_id else ''}")
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=max_turns * 60 + 120,  # 每个 turn 给 60s + 启动余量
            cwd=workdir if workdir else None,
        )
        return proc.stdout, proc.stderr, proc.returncode
    except subprocess.TimeoutExpired as e:
        return "", (e.stderr.decode() if e.stderr else "") or "进程超时", -1


def main() -> None:
    parser = argparse.ArgumentParser(
        description="自动续跑被 rate limit / 额度耗尽中断的 Claude Code 任务"
    )
    parser.add_argument("task", help="任务描述 (首次执行的 prompt)")
    parser.add_argument("--workdir", "-w", default=".", help="Claude 工作目录 (默认当前目录)")
    parser.add_argument("--max-turns", type=int, default=15, help="每次调用最大 agentic loops (默认 15)")
    parser.add_argument("--max-retries", type=int, default=DEFAULT_MAX_RETRIES, help=f"最大重试次数 (默认 {DEFAULT_MAX_RETRIES})")
    parser.add_argument("--resume", dest="resume_session", help="直接从指定 session_id 续跑 (跳过首次启动)")
    parser.add_argument("--claude-args", default="", help="传给 claude 的额外参数 (如 '--allowedTools Read,Edit')")
    args = parser.parse_args()

    claude_bin = find_claude_bin()
    workdir = str(Path(args.workdir).resolve())
    extra_args = args.claude_args.split() if args.claude_args else []

    # 从指定 session 续跑,或首次启动
    session_id: str | None = args.resume_session
    task_prompt = args.task

    # 如果是续跑且没有自定义 prompt,用默认续跑指令
    if session_id and args.task == "__resume__":
        task_prompt = "继续完成之前的任务。请回顾之前的进度,从中断处接着做。"

    attempt = 0
    total_cost = 0.0

    while attempt <= args.max_retries:
        # ── 执行 claude ──────────────────────────────
        stdout, stderr_text, exit_code = run_claude(
            claude_bin, task_prompt, workdir, args.max_turns, session_id, extra_args
        )

        # ── 分类结果 ──────────────────────────────────
        status, parsed = classify_result(stdout, exit_code)

        # 累加费用
        if parsed and "total_cost_usd" in parsed:
            total_cost += parsed["total_cost_usd"]

        # ── 成功 ────────────────────────────────────
        if status == "success":
            log(f"✓ 任务完成 (第 {attempt + 1} 次调用, 累计费用 ${total_cost:.4f})")
            # 输出原始 JSON 到 stdout 供下游脚本使用
            print(stdout, end="")
            return

        # ── 不可重试的致命错误 ────────────────────────
        if status == "fatal":
            log(f"✗ 致命错误,无法重试 (exit_code={exit_code})")
            if parsed:
                log(f"  subtype={parsed.get('subtype')} is_error={parsed.get('is_error')}")
                if parsed.get("result"):
                    log(f"  result={parsed['result'][:200]}")
            if stderr_text:
                log(f"  stderr: {stderr_text[:500]}")
            print(stdout, end="" if stdout else "")
            sys.exit(1)

        # ── 可重试 (rate limit / 额度耗尽) ───────────
        # 提取 session_id 用于下次 resume
        if not session_id:
            session_id = extract_session_id(stdout, stderr_text, workdir)

        if not session_id:
            log("✗ 无法提取 session_id,无法续跑")
            log(f"  stdout: {stdout[:300]}")
            log(f"  stderr: {stderr_text[:300]}")
            sys.exit(1)

        attempt += 1
        if attempt > args.max_retries:
            log(f"✗ 重试次数耗尽 ({args.max_retries} 次),放弃")
            log(f"  最后的 session_id: {session_id}")
            log(f"  可手动续跑: claude -p '继续' --resume {session_id}")
            sys.exit(1)

        # 等待时间: 随机 20~30min,6 次共覆盖约 2~3 小时
        wait = random.randint(MIN_WAIT, MAX_WAIT)
        error_detail = ""
        if parsed:
            error_detail = f" subtype={parsed.get('subtype')}, api_error_status={parsed.get('api_error_status')}"
        elif exit_code != 0:
            error_detail = f" exit_code={exit_code}"

        log(
            f"⚠ 任务中断{error_detail}\n"
            f"  提取到 session_id: {session_id[:12]}...\n"
            f"  第 {attempt}/{args.max_retries} 次重试,等待 {wait}s 后续跑..."
        )

        time.sleep(wait)

        # 续跑用默认 prompt
        task_prompt = "继续完成之前的任务。请回顾之前的进度,从中断处接着做。"

    log(f"✗ 循环结束,未完成。session_id={session_id}")


if __name__ == "__main__":
    main()
