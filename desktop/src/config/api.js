const API_URL = 'https://securechat-production-d857.up.railway.app';
const SOCKET_URL = 'https://securechat-production-d857.up.railway.app';

class ApiService {
  constructor() {
    this.baseURL = `${API_URL}/api`;
    this.token = null;
  }

  async setToken(token) {
    this.token = token;
    await window.ipcRenderer.invoke('store-set', 'token', token);
  }

  async getToken() {
    if (!this.token) {
      this.token = await window.ipcRenderer.invoke('store-get', 'token');
    }
    return this.token;
  }

  async clearToken() {
    this.token = null;
    await window.ipcRenderer.invoke('store-delete', 'token');
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiService();
