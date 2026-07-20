import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 30000;

function parsePlaygroundConfig(raw: unknown): any {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

// POST proxy a playground request to the model's configured API endpoint.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const model = await queryOne(
      `SELECT id, name, playground_config FROM ai_models WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const playgroundConfig = parsePlaygroundConfig(model.playground_config);
    const apiUrl = playgroundConfig?.api_url;

    if (!apiUrl) {
      return NextResponse.json(
        { error: 'No playground API is configured for this model yet.' },
        { status: 400 }
      );
    }

    let requestBody: any = {};
    try {
      requestBody = await request.json();
    } catch {
      requestBody = {};
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const startedAt = Date.now();

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(playgroundConfig?.api_key ? { Authorization: `Bearer ${playgroundConfig.api_key}` } : {}),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (error: any) {
      clearTimeout(timeoutHandle);
      const latency_ms = Date.now() - startedAt;
      if (error?.name === 'AbortError') {
        return NextResponse.json(
          { error: `Playground request timed out after ${TIMEOUT_MS / 1000}s`, latency_ms },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to reach the playground API', details: error?.message, latency_ms },
        { status: 502 }
      );
    }
    clearTimeout(timeoutHandle);
    const latency_ms = Date.now() - startedAt;

    const rawText = await upstreamResponse.text();
    let raw: any = rawText;
    try {
      raw = rawText ? JSON.parse(rawText) : null;
    } catch {
      raw = rawText;
    }

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Playground API returned HTTP ${upstreamResponse.status}`, raw, latency_ms },
        { status: upstreamResponse.status }
      );
    }

    const output = raw && typeof raw === 'object'
      ? raw.output ?? raw.result ?? raw.generated_text ?? raw.text ?? raw.response ?? raw.data ?? raw
      : raw;
    const confidence = raw && typeof raw === 'object' ? raw.confidence ?? raw.score ?? undefined : undefined;
    const memory = raw && typeof raw === 'object' ? raw.memory ?? raw.memory_usage ?? undefined : undefined;

    return NextResponse.json({
      output,
      latency_ms,
      confidence,
      memory,
      raw,
    });
  } catch (error: any) {
    console.error('Playground proxy error:', error);
    return NextResponse.json(
      { error: 'Playground request failed', details: error?.message },
      { status: 500 }
    );
  }
}
