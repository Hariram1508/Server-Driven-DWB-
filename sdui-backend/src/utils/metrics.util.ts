type RequestSample = {
  ts: number;
  durationMs: number;
  statusCode: number;
  route: string;
  method: string;
};

const REQUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_SAMPLES = 5000;

const samples: RequestSample[] = [];

export const recordRequestMetric = (sample: RequestSample): void => {
  samples.push(sample);

  if (samples.length > MAX_SAMPLES) {
    samples.splice(0, samples.length - MAX_SAMPLES);
  }

  const cutoff = Date.now() - REQUEST_WINDOW_MS;
  while (samples.length && samples[0].ts < cutoff) {
    samples.shift();
  }
};

const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
};

export const getMetricsSnapshot = () => {
  const now = Date.now();
  const last5m = samples.filter((s) => s.ts >= now - 5 * 60 * 1000);
  const last1h = samples.filter((s) => s.ts >= now - 60 * 60 * 1000);

  const apiErrors5m = last5m.filter((s) => s.statusCode >= 500);

  const byRouteMap = new Map<
    string,
    { count: number; total: number; errors: number }
  >();

  for (const sample of last1h) {
    const key = `${sample.method} ${sample.route}`;
    const existing = byRouteMap.get(key) || { count: 0, total: 0, errors: 0 };
    existing.count += 1;
    existing.total += sample.durationMs;
    if (sample.statusCode >= 500) {
      existing.errors += 1;
    }
    byRouteMap.set(key, existing);
  }

  const slowRoutes = Array.from(byRouteMap.entries())
    .map(([route, value]) => ({
      route,
      requests: value.count,
      avgLatencyMs: Number((value.total / value.count).toFixed(2)),
      errorRate: Number(((value.errors / value.count) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.avgLatencyMs - a.avgLatencyMs)
    .slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    traffic: {
      requestsLast5m: last5m.length,
      requestsLast1h: last1h.length,
    },
    api: {
      avgLatencyMs5m: Number(
        average(last5m.map((s) => s.durationMs)).toFixed(2),
      ),
      p95LatencyMs5m:
        last5m.length === 0
          ? 0
          : Number(
              [...last5m]
                .map((s) => s.durationMs)
                .sort((a, b) => a - b)
                [Math.max(0, Math.floor(last5m.length * 0.95) - 1)].toFixed(2),
            ),
      errorRate5m:
        last5m.length === 0
          ? 0
          : Number(((apiErrors5m.length / last5m.length) * 100).toFixed(2)),
    },
    slowRoutes,
  };
};
