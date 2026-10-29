const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const API_ENABLED = BASE_URL !== '';

const TOKEN_KEY = 'auth:token';

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
    }
  },
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const unauthorizedListeners = new Set();

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export async function api(path, { method = 'GET', body, token = tokenStorage.get(), captcha } = {}) {
  const headers = {};
  if (captcha) headers['X-Turnstile-Token'] = captcha;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Não foi possível falar com o servidor. Confira sua conexão.');
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
  }

  if (!response.ok) {
    const error = payload?.error;
    if (response.status === 401 && token) unauthorizedListeners.forEach((listener) => listener());
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Algo deu errado. Tente novamente.',
      error?.details
    );
  }
  return payload;
}

export const googleLoginUrl = (next = '/') =>
  `${BASE_URL}/v1/auth/google/start?redirect=${encodeURIComponent(next)}`;
