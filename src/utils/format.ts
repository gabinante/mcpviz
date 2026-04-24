export function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toLocaleString();
}

export function formatPercentage(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

export function getContextHealthColor(percentage: number): string {
  if (percentage < 50) return 'var(--accent)';
  if (percentage < 75) return 'var(--warning)';
  return 'var(--danger)';
}

export function getContextHealthLabel(percentage: number): string {
  if (percentage < 25) return 'Healthy';
  if (percentage < 50) return 'Growing';
  if (percentage < 75) return 'Concerning';
  if (percentage < 90) return 'Critical';
  return 'Overflow Risk';
}
