const baseUrl = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001'
).replace(/\/$/, '');

const apiServerClient = {
  async fetch(path, options = {}) {
    const response = await window.fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return response;
  },
};

export default apiServerClient;
