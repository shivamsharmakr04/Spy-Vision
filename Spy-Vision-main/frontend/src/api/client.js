// IBVAP API Client & WebSocket Service

const API_BASE = '/api/v1';

async function fetchJSON(endpoint, options = {}) {
  try {
    const { headers: requestHeaders, ...requestOptions } = options;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
      },
      ...requestOptions,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    // Handle 204 No Content (e.g. DELETE responses)
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
    // Transform frontend zone_type -> backend "type" field
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
    // Transform frontend person fields -> backend WatchlistPersonCreate schema
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
    // Transform frontend vehicle fields -> backend WatchlistVehicleCreate schema
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

  // Development-only endpoint; the backend rejects it when DEBUG is disabled.
  triggerSimulatedEvent: (eventData) => {
    // Transform frontend event -> backend EventCreate schema
    const payload = {
      camera_id: eventData.camera_id,
      event_type: eventData.event_type,
      timestamp: eventData.timestamp || new Date().toISOString(),
      confidence: eventData.confidence || null,
      severity: eventData.severity || 'LOW',
      metadata: eventData.metadata || null,
      plate_number: eventData.plate_number || null,
      snapshot_path: eventData.snapshot_path || null,
      clip_path: eventData.clip_path || null,
    };
    return fetchJSON('/events/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// WebSocket Alert Manager
export class AlertWebSocketManager {
  constructor(onMessage, onStatusChange) {
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.reconnectTimer = null;
    this.isConnecting = false;
    this.shouldReconnect = true;
  }

  connect() {
    this.shouldReconnect = true;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/alerts`;

    this.isConnecting = true;
    this.onStatusChange?.('CONNECTING');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.onStatusChange?.('CONNECTED');
        console.log('[WebSocket] Connected to alert stream');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch (err) {
          console.error('[WebSocket Error] Failed to parse message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.onStatusChange?.('DISCONNECTED');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        this.isConnecting = false;
        this.onStatusChange?.('ERROR');
        console.warn('[WebSocket Error] Connection error, fallback active.');
      };
    } catch (err) {
      this.isConnecting = false;
      this.onStatusChange?.('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (!this.shouldReconnect) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
    }
  }
}
