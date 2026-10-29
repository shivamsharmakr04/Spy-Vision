// IBVAP API Client & WebSocket Service

const API_BASE = '/api/v1';

export const authStorage = {
  getToken: () => localStorage.getItem('ibvap_auth_token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('ibvap_auth_token', token);
    } else {
      localStorage.removeItem('ibvap_auth_token');
    }
  },
  clearToken: () => localStorage.removeItem('ibvap_auth_token'),
  getUser: () => {
    try {
      const data = localStorage.getItem('ibvap_operator');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem('ibvap_operator', JSON.stringify(user));
    } else {
      localStorage.removeItem('ibvap_operator');
    }
  },
  clearUser: () => localStorage.removeItem('ibvap_operator'),
};

async function fetchJSON(endpoint, options = {}) {
  try {
    const { headers: requestHeaders = {}, ...requestOptions } = options;
    const token = authStorage.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...requestHeaders,
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers,
      ...requestOptions,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }

    if (res.status === 204) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API Warning] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication & Operator Verification
  register: async (userData) => {
    const res = await fetchJSON('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  login: async (credentials) => {
    const res = await fetchJSON('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  getMe: () => fetchJSON('/auth/me'),

  logout: async () => {
    try {
      await fetchJSON('/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
      authStorage.clearUser();
    }
  },

  // Dashboard
  getStats: () => fetchJSON('/dashboard/stats'),

  // Cameras
  getCameras: () => fetchJSON('/cameras'),
  getCamera: (id) => fetchJSON(`/cameras/${id}`),
  createCamera: (data) => fetchJSON('/cameras', { method: 'POST', body: JSON.stringify(data) }),
  updateCamera: (id, data) => fetchJSON(`/cameras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCamera: (id) => fetchJSON(`/cameras/${id}`, { method: 'DELETE' }),
  sendHeartbeat: (id) => fetchJSON(`/cameras/${id}/heartbeat`, { method: 'POST' }),

  // Zones
  getZones: async (cameraId) => {
    const zones = await fetchJSON(cameraId === undefined ? '/zones' : `/cameras/${cameraId}/zones`);
    return zones.map((zone) => ({
      ...zone,
      zone_type: zone.zone_type || zone.type,
      is_active: zone.is_active ?? zone.enabled,
    }));
  },
  createZone: (cameraId, data) => {
    const payload = {
      name: data.name,
      type: data.zone_type || data.type || 'INTRUSION_ZONE',
      coordinates: data.coordinates || [],
      enabled: data.is_active !== undefined ? data.is_active : true,
      sensitivity: data.sensitivity ?? 0.85,
    };
    return fetchJSON(`/cameras/${cameraId}/zones`, { method: 'POST', body: JSON.stringify(payload) });
  },
  updateZone: (zoneId, data) => fetchJSON(`/zones/${zoneId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteZone: (zoneId) => fetchJSON(`/zones/${zoneId}`, { method: 'DELETE' }),

  // Alerts
  getAlerts: () => fetchJSON('/alerts'),
  acknowledgeAlert: (alertId) => fetchJSON(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  resolveAlert: (alertId) => fetchJSON(`/alerts/${alertId}/resolve`, { method: 'POST' }),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const search = query.toString();
    return fetchJSON(search ? `/events?${search}` : '/events');
  },

  // Watchlist - Persons
  getPersons: async () => (await fetchJSON('/watchlist/persons')).map((person) => ({
    ...person,
    full_name: person.full_name || person.name,
    suspect_id: person.suspect_id || person.external_reference,
    photo_url: person.photo_url || person.image_path,
    notes: person.notes || person.description,
  })),
  createPerson: (data) => {
    const payload = {
      name: data.full_name || data.name,
      external_reference: data.suspect_id || data.external_reference || null,
      image_path: data.photo_url || data.image_path || null,
      description: data.notes || data.description || null,
      enabled: true,
    };
    return fetchJSON('/watchlist/persons', { method: 'POST', body: JSON.stringify(payload) });
  },
  updatePerson: (id, data) => fetchJSON(`/watchlist/persons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePerson: (id) => fetchJSON(`/watchlist/persons/${id}`, { method: 'DELETE' }),

  // Watchlist - Vehicles
  getVehicles: async () => (await fetchJSON('/watchlist/vehicles')).map((vehicle) => ({
    ...vehicle,
    notes: vehicle.notes || vehicle.description,
  })),
  createVehicle: (data) => {
    const payload = {
      plate_number: data.plate_number,
      vehicle_type: data.vehicle_type || null,
      description: data.notes || data.description || null,
      enabled: true,
    };
    return fetchJSON('/watchlist/vehicles', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateVehicle: (id, data) => fetchJSON(`/watchlist/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => fetchJSON(`/watchlist/vehicles/${id}`, { method: 'DELETE' }),
};

// WebSocket Alert Manager
export class AlertWebSocketManager {
  constructor(onMessage, onStatusChange) {
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.reconnectTimer = null;
    this.isConnecting = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    this.onStatusChange('CONNECTING');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/alerts`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.onStatusChange('CONNECTED');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (e) {
          console.warn('[WS Parse Error]', e);
        }
      };

      this.ws.onerror = () => {
        this.onStatusChange('ERROR');
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.onStatusChange('DISCONNECTED');
        this.scheduleReconnect();
      };
    } catch {
      this.isConnecting = false;
      this.onStatusChange('ERROR');
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
