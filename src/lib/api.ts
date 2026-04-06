/**
 * WordPress REST API wrapper — replaces EmDash usePluginAPI.
 * Uses @wordpress/api-fetch with the nonce injected by PHP.
 */

declare const wpApiFetch: (options: {
  path?: string;
  url?: string;
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}) => Promise<unknown>;

const apiFetch = (typeof window !== 'undefined' && (window as any).wp?.apiFetch)
  ? (window as any).wp.apiFetch as typeof wpApiFetch
  : wpApiFetch;

function getBase(): string {
  return window.roiInsights?.apiBase ?? '/wp-json/roi-insights/v1/';
}

function getNonce(): string {
  return window.roiInsights?.nonce ?? '';
}

export const api = {
  get<T>(path: string): Promise<T> {
    return apiFetch({
      url: getBase() + path,
      method: 'GET',
      headers: { 'X-WP-Nonce': getNonce() },
    }) as Promise<T>;
  },

  post<T>(path: string, data: unknown): Promise<T> {
    return apiFetch({
      url: getBase() + path,
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': getNonce(),
      },
    }) as Promise<T>;
  },
};
