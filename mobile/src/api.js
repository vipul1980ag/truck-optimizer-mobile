// ---------------------------------------------------------------------------
// WARNING: Change BASE_URL to your computer's local IP address.
//     On Windows: open Command Prompt -> run ipconfig -> find IPv4 Address
//     Example: 'http://192.168.1.105:3000'
//     Your iPhone and computer must be on the same Wi-Fi network.
// ---------------------------------------------------------------------------
export const BASE_URL = 'http://192.168.178.60:3000';

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