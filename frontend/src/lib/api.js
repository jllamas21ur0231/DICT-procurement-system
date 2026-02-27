const API_BASE = '/api';

async function request(path, options = {}) {
  const { body, method = 'GET', ...rest } = options;
  const isFormData = body instanceof FormData;
  const headers = { Accept: 'application/json' };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { ...headers, ...options.headers },
    ...(body != null ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    ...rest,
  });
  const text = await res.text();
  if (!res.ok) {
    const data = text ? (() => { try { return JSON.parse(text); } catch { return { message: text }; } })() : { message: res.statusText };
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return text ? JSON.parse(text) : null;
}

export const api = {
  createProcurement(data) {
    return request('/procurements', { method: 'POST', body: data });
  },
  uploadAttachment(procurementId, formData) {
    return request(`/procurements/${procurementId}/attachments`, { method: 'POST', body: formData });
  },
};
