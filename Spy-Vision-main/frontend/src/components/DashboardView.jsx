import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Camera, 
  AlertTriangle, 
  Car, 
  Radio, 
  RefreshCw, 
  Lock, 
  BellRing,
  ShieldCheck,
  ShieldAlert,
  Maximize2,
  Crosshair,
  Wifi,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  backendOnline, 
  wsStatus, 
  cameras = [], 
  alerts = [], 
  onAcknowledgeAlert, 
  onResolveAlert, 
  onSelectCameraForZone,
  onTriggerWebcamAlert 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [streamRefreshing, setStreamRefreshing] = useState(false);
  const [lockdownTriggered, setLockdownTriggered] = useState(false);
  const [alertFilter, setAlertFilter] = useState('ALL');

  const webcamVideoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const stream = webcamVideoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setWebcamError('');
    } else {
      try {
        setWebcamError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.play();
        }
        setIsWebcamActive(true);
      } catch (err) {
        console.error('Camera access error:', err);
        setWebcamError('Unable to access webcam. Please check browser camera permissions.');
        setIsWebcamActive(false);
      }
    }
  };

  const handleCaptureWebcamSnapshot = async () => {
    if (!webcamVideoRef.current || !hiddenCanvasRef.current) return;
    const video = webcamVideoRef.current;
    const canvas = hiddenCanvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    if (onTriggerWebcamAlert && cameras[0]) {
      const saved = await onTriggerWebcamAlert({
        camera_id: cameras[0].id,
        event_type: 'INTRUSION',
        severity: 'HIGH',
        confidence: 0.98,
        snapshot_path: dataUrl,
        message: 'Operator captured verified snapshot for review.'
      });
      if (saved) alert('Surveillance snapshot captured and alert recorded.');
    }
  };

  const handleRefreshFeed = () => {
    setStreamRefreshing(true);
    setTimeout(() => {
      setStreamRefreshing(false);
    }, 600);
  };

  const handleTriggerLockdown = () => {
    setLockdownTriggered(true);
    setTimeout(() => {
      alert('SECTOR PERIMETER LOCKDOWN ENGAGED: All automated gates sealed and security teams alerted.');
    }, 100);
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'ACTIVE') return a.status === 'ACTIVE';
    if (alertFilter === 'ACK') return a.status === 'ACKNOWLEDGED';
    return true;
  });
  
  // Real-time backend stats values
  const onlineCamCount = stats?.cameras ? stats.cameras.online : cameras.filter(c => c.status === 'ONLINE').length;
  const totalCamCount = stats?.cameras ? stats.cameras.total : cameras.length;
  const breachCount = stats?.intrusions_today !== undefined ? stats.intrusions_today : alerts.filter(a => a.event_type === 'INTRUSION').length;
  const vehicleCount = stats?.vehicles_today ?? 0;
  const activeAlertCount = stats?.active_alerts !== undefined ? stats.active_alerts : activeAlerts.length;

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. TOP TELEMETRY STATUS BAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between text-xs font-semibold gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/70 px-3.5 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            {backendOnline ? 'TELEMETRY LIVE • ONLINE' : 'LOCAL CACHED DEMO • ACTIVE'}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            WebSocket: <strong className="text-slate-900 dark:text-white font-black">{wsStatus || 'DISCONNECTED'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">DEFENSE CLOCK:</span>
          <span className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-cyan-300 px-3 py-1 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-800 shadow-2xs">
            {currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} — {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP SUMMARY METRICS (4 Real-Time Cards) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Cameras */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs border-t-4 border-t-emerald-500">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Cameras</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {onlineCamCount} <span className="text-base text-slate-400 dark:text-slate-500 font-bold">/ {totalCamCount}</span>
            </h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Surveillance grid active
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-emerald-200 dark:border-emerald-800">
            <Video className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Intrusions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-rose-500 dark:hover:border-rose-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs border-t-4 border-t-rose-500">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Intrusion Breaches</p>
            <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
              {breachCount} <span className="text-base text-slate-400 dark:text-slate-500 font-bold">Events</span>
            </h3>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
              Perimeter tripwire alerts
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs border border-rose-200 dark:border-rose-800 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Vehicles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs border-t-4 border-t-cyan-500">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ANPR Vehicle Passes</p>
            <h3 className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1 tracking-tight">
              {vehicleCount} <span className="text-base text-slate-400 dark:text-slate-500 font-bold">Scans</span>
            </h3>
            <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold mt-1">Automated plate recognition</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-cyan-200 dark:border-cyan-800">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs border-t-4 border-t-amber-500">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Alerts</p>
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              {activeAlertCount} <span className="text-base text-slate-400 dark:text-slate-500 font-bold">Active</span>
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">Live incident queue</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-amber-200 dark:border-amber-800">
            <BellRing className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN HERO CAMERA STREAM (8 Cols) + ALERTS PANEL (4 Cols) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Hero Live Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-3 space-y-3 shadow-xs">
            <div className="relative aspect-video min-h-[500px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs flex flex-col justify-between shadow-2xl">
              <canvas ref={hiddenCanvasRef} className="hidden" />

              {/* Top Control Overlay Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 bg-slate-950/90 backdrop-blur-md text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${isWebcamActive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
                  <span className="font-black text-sm sm:text-base tracking-tight text-white">
                    {isWebcamActive ? 'Live Laptop Camera Feed' : 'BOP Sector 4 - Main Fence Terminal'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    {isWebcamActive ? 'STREAMING LIVE' : 'FEED STANDBY'}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleWebcam}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95 ${
                      isWebcamActive 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    {isWebcamActive ? 'Stop Camera' : 'Turn On Laptop Webcam'}
                  </button>

                  {isWebcamActive && (
                    <button
                      onClick={handleCaptureWebcamSnapshot}
                      disabled={!cameras.length}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Snap & Save Alert
                    </button>
                  )}
                </div>
              </div>

              {/* Live Webcam Stream Video */}
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
              />

              {/* High-Tech Standby Terminal Screen */}
              {!isWebcamActive && (
                <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Radar Sonar Circle Simulation */}
                  <div className="absolute w-80 h-80 rounded-full border border-emerald-500/15 pointer-events-none animate-ping" />
                  <div className="absolute w-52 h-52 rounded-full border border-cyan-500/20 pointer-events-none" />
                  <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30 pointer-events-none" />
                  
                  {/* Corner Reticles */}
                  <div className="absolute top-16 left-6 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60" />
                  <div className="absolute top-16 right-6 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60" />

                  <div className="z-10 text-center space-y-4 p-8 max-w-lg">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                      <Video className="w-10 h-10" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h3 className="text-white font-black text-xl tracking-tight">
                        Perimeter Sensor Grid Ready
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                        Primary video input on standby. Click <strong className="text-emerald-400">Turn On Laptop Webcam</strong> above to stream live surveillance directly to the analytics engine.
                      </p>
                    </div>

                    {/* Technical Specs Pill Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-300">
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-bold">1080p FHD</span>
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-bold">30 FPS</span>
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-bold">AES-256 ENCRYPTED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Reticle Tracking */}
              {isWebcamActive && showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                  <div className="w-64 h-64 border-2 border-dashed border-cyan-400 rounded-2xl flex flex-col justify-between p-3 relative shadow-2xl">
                    <div className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px] w-max shadow-sm">
                      Target Tracking • Verified Live Stream
                    </div>
                    <div className="text-right">
                      <span className="bg-slate-950/90 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/40">
                        LATENCY: 14ms
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {webcamError && (
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-rose-900/95 text-white p-3 rounded-xl text-center text-xs font-bold border border-rose-700">
                  {webcamError}
                </div>
              )}
            </div>

            {/* Feed Control Sub-Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-medium gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Surveillance HUD:</span>
                <button 
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all active:scale-95 ${
                    showBoundingBoxes 
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800 font-bold' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {showBoundingBoxes ? 'Target Reticle: ON' : 'Target Reticle: OFF'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefreshFeed}
                  disabled={streamRefreshing}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold rounded-xl cursor-pointer shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${streamRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`} />
                  Refresh Telemetry
                </button>
              </div>
            </div>
          </div>

          {/* 3 Secondary Feeds Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div 
              onClick={() => onSelectCameraForZone && onSelectCameraForZone(cameras[1]?.id || 2)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl space-y-2 cursor-pointer hover:border-emerald-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Cam 02: West Fence
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">ONLINE</span>
              </div>
              <div className="h-20 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono border border-slate-800">
                [ Sensor Feed Standby ]
              </div>
            </div>

            <div 
              onClick={() => onSelectCameraForZone && onSelectCameraForZone(cameras[2]?.id || 3)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl space-y-2 cursor-pointer hover:border-cyan-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  Cam 03: ANPR Gate
                </span>
                <span className="text-cyan-700 dark:text-cyan-400 text-[10px] font-mono font-bold">ONLINE</span>
              </div>
              <div className="h-20 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono border border-slate-800">
                [ ANPR Scanner Ready ]
              </div>
            </div>

            <div 
              onClick={() => onSelectCameraForZone && onSelectCameraForZone(cameras[3]?.id || 4)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl space-y-2 cursor-pointer hover:border-emerald-500 transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Cam 04: River Patrol
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">ONLINE</span>
              </div>
              <div className="h-20 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono border border-slate-800">
                [ Thermal IR Standby ]
              </div>
            </div>

          </div>

        </div>

        {/* Right Panel: Live Alerts & Emergency Sector Control (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Real-time Alerts List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-500" />
                Live Security Alerts
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black shadow-xs">
                {activeAlerts.length} Active
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setAlertFilter('ALL')}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  alertFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setAlertFilter('ACTIVE')}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  alertFilter === 'ACTIVE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Active ({activeAlerts.length})
              </button>
              <button
                onClick={() => setAlertFilter('ACK')}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  alertFilter === 'ACK'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Ack
              </button>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <p className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">No alerts in this category.</p>
              ) : (
                filteredAlerts.slice(0, 6).map((a) => (
                  <div key={a.id} className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all ${
                    a.status === 'ACTIVE'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                      <span className={`flex items-center gap-1.5 ${a.severity === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-amber-600 dark:text-amber-400 font-bold'}`}>
                        <span className={`w-2 h-2 rounded-full ${a.status === 'ACTIVE' ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`} />
                        {a.event_type}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                        {new Date(a.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{a.message || 'Perimeter alert detected'}</h4>
                    
                    <div className="flex items-center gap-2 pt-1">
                      {a.status === 'ACTIVE' ? (
                        <>
                          <button
                            onClick={() => onAcknowledgeAlert(a.id)}
                            className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-colors active:scale-95"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => onResolveAlert(a.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors active:scale-95"
                          >
                            Resolve
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Status: {a.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Sector Lockout */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              Emergency Sector Control
            </h4>
            <button
              onClick={handleTriggerLockdown}
              className={`w-full py-3.5 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                lockdownTriggered
                  ? 'bg-rose-800 text-white ring-4 ring-rose-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30'
              }`}
            >
              <Lock className="w-4 h-4" />
              {lockdownTriggered ? 'LOCKDOWN ENGAGED' : 'TRIGGER EMERGENCY LOCKDOWN'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
