const BASE = '/api';

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
        throw new Error(json.message || `Request gagal (${res.status})`);
    }
    return json.data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    del: (path) => request(path, { method: 'DELETE' }),
};

// utilitas format uang untuk nanti persiapan dashboard, sekalian aja biar cepet
export function formatMoney(value, currency = '') {
    const num = Number(value ?? 0);
    const text = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return currency ? `${text} ${currency}` : `${text}$`;
}