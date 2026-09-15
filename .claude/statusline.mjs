#!/usr/bin/env node
// Status line: live context size vs the compaction window, plus plan quota.
// Runs locally, costs no API tokens. Reads session JSON on stdin.
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let j = {};
  try { j = JSON.parse(raw); } catch {}
  const k = n => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'k');
  const cw = j.context_window || {};
  const cu = cw.current_usage;
  const ctx = cu
    ? (cu.input_tokens || 0) + (cu.cache_creation_input_tokens || 0) + (cu.cache_read_input_tokens || 0)
    : cw.total_input_tokens || 0;
  const win = Number(process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW) || cw.context_window_size || 200000;
  const pct = win ? Math.round((ctx / win) * 100) : 0;
  const warn = ctx > 250000 ? '  (heavy: update state file, consider /compact)' : '';
  const parts = [`${j.model?.display_name || 'Claude'}`, `ctx ${k(ctx)}/${k(win)} (${pct}%)${warn}`];
  const rl = j.rate_limits;
  if (rl?.five_hour?.used_percentage != null) parts.push(`5h ${Math.round(rl.five_hour.used_percentage)}%`);
  if (rl?.seven_day?.used_percentage != null) parts.push(`7d ${Math.round(rl.seven_day.used_percentage)}%`);
  process.stdout.write(parts.join('  |  '));
});
