// In development: set BASE_URL to your computer's local IP (e.g. http://192.168.1.x:3000)
// In production:  EXPO_PUBLIC_API_URL is injected automatically via eas.json env vars
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://truck-capacity-optimizer.onrender.com';

async function request(method, path, body, token) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
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
  geocode:      (query)            => request('POST', '/api/geocode', { query }),
  getRoutes:    (from, to)         => request('POST', '/api/routes',  { from, to }),
  getTolls:     (geometry, vehicleType) => request('POST', '/api/tolls', { geometry, vehicleType }),
  getAvailableTrucks: (fromLat, fromLng, toLat, toLng, neededWeight, neededVol) =>
    request('POST', '/api/bookings/available-trucks', { fromLat, fromLng, toLat, toLng, neededWeight, neededVol }),
  createBooking: (body) => request('POST', '/api/bookings', body),
};

export const authApi = {
  register: (email, password, phone, address) =>
    request('POST', '/api/auth/register', { email, password, phone, address }),
  login: (email, password) =>
    request('POST', '/api/auth/login', { email, password }),
  logout: (token) =>
    request('POST', '/api/auth/logout', undefined, token),
  me: (token) =>
    request('GET', '/api/auth/me', undefined, token),
};
