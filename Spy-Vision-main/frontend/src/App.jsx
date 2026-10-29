import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ZoneEditor from './components/ZoneEditor';
import WatchlistManager from './components/WatchlistManager';
import EventsHistory from './components/EventsHistory';
import CameraManager from './components/CameraManager';
import AuthPage from './components/AuthPage';

import { api, authStorage, AlertWebSocketManager } from './api/client';
import { 
  DEFAULT_CAMERAS, 
  DEFAULT_ZONES, 
  DEFAULT_ALERTS, 
  DEFAULT_EVENTS, 
  DEFAULT_WATCHLIST_PERSONS, 
  DEFAULT_WATCHLIST_VEHICLES 
} from './data/mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [authChecking, setAuthChecking] = useState(true);

  const [activeView, setActiveView] = useState('dashboard');
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Core App Data States
  const [stats, setStats] = useState(null);
  const [cameras, setCameras] = useState(DEFAULT_CAMERAS);
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [persons, setPersons] = useState(DEFAULT_WATCHLIST_PERSONS);
  const [vehicles, setVehicles] = useState(DEFAULT_WATCHLIST_VEHICLES);
  const [selectedCamForZone, setSelectedCamForZone] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [actionError, setActionError] = useState('');

  // Validate active operator session on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setCurrentUser(null);
        setAuthChecking(false);
        return;
      }
      try {
        const user = await api.getMe();
        if (user && user.is_verified) {
          setCurrentUser(user);
          authStorage.setUser(user);
        } else {
          throw new Error('Unverified operator account');
        }
      } catch (err) {
        console.warn('Operator session invalid:', err.message);
        authStorage.clearToken();
        authStorage.clearUser();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    verifySession();
  }, []);

  // Load initial data from REST API with default fallbacks
  const loadData = useCallback(async () => {
    try {
      const statsRes = await api.getStats().catch(() => null);
      setBackendOnline(Boolean(statsRes));
      if (!statsRes) return;
      setStats(statsRes);

      const [camsRes, zonesRes, alertsRes, eventsRes, personsRes, vehiclesRes] = await Promise.all([
        api.getCameras().catch(() => null),
        api.getZones().catch(() => null),
        api.getAlerts().catch(() => null),
        api.getEvents().catch(() => null),
        api.getPersons().catch(() => null),
        api.getVehicles().catch(() => null),
      ]);

      if (Array.isArray(camsRes)) setCameras(camsRes);
      if (Array.isArray(zonesRes)) setZones(zonesRes);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (Array.isArray(eventsRes?.items)) setEvents(eventsRes.items);
      if (Array.isArray(personsRes)) setPersons(personsRes);
      if (Array.isArray(vehiclesRes)) setVehicles(vehiclesRes);
    } catch {
      console.log('[Data Sync Note] Using default production dataset.');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    loadData();

    // Live Real-Time Polling Interval (Syncs backend SQLite data every 3 seconds)
    const pollInterval = setInterval(() => {
      loadData();
    }, 3000);

    // WebSocket Alert Stream Connection
    const wsManager = new AlertWebSocketManager(
      (data) => {
        if (data.type === 'ALERT_CREATED' && data.data) {
          const newAlert = data.data;
          setAlerts(prev => [newAlert, ...prev]);

          if (audioEnabled) {
            playAlertSound();
          }
        }
      },
      (status) => setWsStatus(status)
    );

    wsManager.connect();
    return () => {
      clearInterval(pollInterval);
      wsManager.disconnect();
    };
  }, [currentUser, audioEnabled, loadData]);

  // Alert Sound Playback
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveView('dashboard');
    loadData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Actions
  const handleAcknowledgeAlert = async (alertId) => {
    setActionError('');
    try {
      await api.acknowledgeAlert(alertId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleResolveAlert = async (alertId) => {
    setActionError('');
    try {
      await api.resolveAlert(alertId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleSelectCameraForZone = (camId) => {
    setSelectedCamForZone(camId);
    setActiveView('zones');
  };

  const handleSaveZone = async (zoneData) => {
    setActionError('');
    try {
      await api.createZone(zoneData.camera_id, zoneData);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    setActionError('');
    try {
      await api.deleteZone(zoneId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCreatePerson = async (personData) => {
    setActionError('');
    try {
      await api.createPerson(personData);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeletePerson = async (personId) => {
    setActionError('');
    try {
      await api.deletePerson(personId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCreateVehicle = async (vehicleData) => {
    setActionError('');
    try {
      await api.createVehicle(vehicleData);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    setActionError('');
    try {
      await api.deleteVehicle(vehicleId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCreateCamera = async (camData) => {
    setActionError('');
    try {
      await api.createCamera(camData);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteCamera = async (camId) => {
    setActionError('');
    try {
      await api.deleteCamera(camId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleHeartbeat = async (camId) => {
    setActionError('');
    try {
      await api.sendHeartbeat(camId);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Loading state during auth check
  if (authChecking) {
    return (
      <div className="min-h-screen bg-oatmeal-100 dark:bg-[#0c1511] flex flex-col items-center justify-center text-oatmeal-950 dark:text-oatmeal-100 space-y-4 font-mono">
        <div className="w-10 h-10 border-4 border-pine-700 border-t-lilac-500 rounded-full animate-spin" />
        <div className="text-xs font-bold tracking-widest uppercase text-pine-800 dark:text-lilac-300">
          Verifying Operator Clearance Credentials...
        </div>
      </div>
    );
  }

  // If not authenticated, render verified operator auth portal
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} theme={theme} />;
  }

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans ${
      theme === 'dark' ? 'bg-[#0c1511] text-oatmeal-50' : 'bg-[#f5f1e8] text-oatmeal-950'
    }`}>
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        wsStatus={wsStatus}
        activeAlertCount={activeAlertCount}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {!backendOnline && (
          <div role="status" className="mx-4 mt-4 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-pine-950/40 px-4 py-2.5 text-xs font-semibold text-pine-900 dark:text-lilac-200 shadow-xs flex items-center justify-between">
            <span>Operational Notice: Backend service connecting... Local cached datasets ready.</span>
            <span className="font-mono text-[10px] bg-lilac-100 dark:bg-lilac-950 text-lilac-800 dark:text-lilac-200 px-2 py-0.5 rounded border border-lilac-200 dark:border-lilac-800">
              STANDBY SYNC
            </span>
          </div>
        )}
        {actionError && (
          <div role="alert" className="mx-4 mt-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-900 shadow-xs">
            Operation Error: {actionError}
          </div>
        )}
        {activeView === 'dashboard' && (
          <DashboardView
            stats={stats}
            backendOnline={backendOnline}
            wsStatus={wsStatus}
            cameras={cameras}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onSelectCameraForZone={handleSelectCameraForZone}
          />
        )}

        {activeView === 'zones' && (
          <ZoneEditor
            cameras={cameras}
            selectedCameraId={selectedCamForZone}
            onSaveZone={handleSaveZone}
            onDeleteZone={handleDeleteZone}
            existingZones={zones.filter(z => z.camera_id === (selectedCamForZone || cameras[0]?.id))}
          />
        )}

        {activeView === 'watchlist' && (
          <WatchlistManager
            persons={persons}
            vehicles={vehicles}
            onCreatePerson={handleCreatePerson}
            onDeletePerson={handleDeletePerson}
            onCreateVehicle={handleCreateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        )}

        {activeView === 'events' && (
          <EventsHistory
            events={events}
            cameras={cameras}
            onRefreshEvents={loadData}
          />
        )}

        {activeView === 'cameras' && (
          <CameraManager
            cameras={cameras}
            onCreateCamera={handleCreateCamera}
            onDeleteCamera={handleDeleteCamera}
            onHeartbeat={handleHeartbeat}
          />
        )}
      </main>

      {/* Oatmeal & Pine Command Footer */}
      <footer className="border-t border-oatmeal-300 dark:border-pine-900 bg-oatmeal-50/90 dark:bg-[#0e1c16]/90 py-3 px-4 text-center text-oatmeal-800 dark:text-oatmeal-300 text-xs font-mono backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
        <span>IBVAP v1.0.0 — Intelligent Border Surveillance Platform | Ministry of Home Affairs</span>
        <span className="text-[11px] text-pine-800 dark:text-lilac-300 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pine-600 dark:bg-pine-400" />
          ACTIVE DEFENSE NODE • OPERATOR: {currentUser.username.toUpperCase()}
        </span>
      </footer>
    </div>
  );
}
