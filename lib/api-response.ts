import { NextResponse } from 'next/server';

export function successResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status: number = 500, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ success: false, error, ...extra }, { status });
}

/**
 * Handle unknown errors consistently across all API routes.
 * Replaces `catch (err: any) { err.message }` pattern.
 */
export function handleApiError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
