// In development: set BASE_URL to your computer's local IP (e.g. http://192.168.1.x:3000)
// In production:  EXPO_PUBLIC_API_URL is injected automatically via eas.json env vars
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.178.60:3000';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res  = await fetch(BASE_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
  return data;
}

export const api = {
  getData:      ()     => request('GET',  '/api/data'),
  saveData:     (body) => request('PUT',  '/api/data', body),
  optimize:     (body) => request('POST', '/api/optimize', body),
  paymentConfig:()     => request('GET',  '/api/payment/config'),
  createOrder:  (body) => request('POST', '/api/payment/create-order', body),
  captureOrder: (body) => request('POST', '/api/payment/capture-order', body),
};
