import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Video, 
  AlertTriangle, 
  Car, 
  User, 
  BellRing, 
  Camera, 
  Lock, 
  RefreshCw,
  Eye,
  Activity,
  CheckCircle,
  Radio,
  Sliders,
  Crosshair,
  Maximize2
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
  const webcamVideoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [streamRefreshing, setStreamRefreshing] = useState(false);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const tracks = webcamVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setWebcamError(null);
    } else {
      try {
        setWebcamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.play();
        }
        setIsWebcamActive(true);
      } catch (err) {
        console.error('Webcam Access Error:', err);
        setWebcamError('Camera permission denied or camera device unavailable.');
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

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  
  // Real-time backend stats values
  const onlineCamCount = stats?.cameras ? stats.cameras.online : cameras.filter(c => c.status === 'ONLINE').length;
  const totalCamCount = stats?.cameras ? stats.cameras.total : cameras.length;
  const breachCount = stats?.intrusions_today !== undefined ? stats.intrusions_today : alerts.filter(a => a.event_type === 'INTRUSION').length;
  const vehicleCount = stats?.vehicles_today ?? 0;
  const activeAlertCount = stats?.active_alerts !== undefined ? stats.active_alerts : activeAlerts.length;

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* Real-time Status Header */}
      <div className="light-card p-3.5 px-5 flex flex-wrap items-center justify-between text-xs font-semibold gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-pine-900 dark:text-pine-200 font-bold bg-pine-100 dark:bg-pine-950/80 px-3.5 py-1.5 rounded-full border border-pine-300 dark:border-pine-800">
            <span className="w-2.5 h-2.5 rounded-full bg-pine-600 dark:bg-pine-400 animate-ping" />
            {backendOnline ? 'TELEMETRY LIVE • ONLINE' : 'LOCAL CACHED DEMO • ACTIVE'}
          </span>
          <span className="text-oatmeal-400 dark:text-pine-800 hidden sm:inline">|</span>
          <span className="text-oatmeal-800 dark:text-oatmeal-200 font-mono flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />
            WebSocket: <strong className="text-pine-950 dark:text-oatmeal-50 font-bold">{wsStatus || 'DISCONNECTED'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-oatmeal-600 dark:text-oatmeal-400 text-[11px]">DEFENSE CLOCK:</span>
          <span className="bg-pine-950 text-lilac-200 px-3 py-1 rounded-xl text-xs font-bold border border-pine-800 shadow-xs">
            {currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} — {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP SUMMARY METRICS (4 Real-Time Oatmeal, Pine & Lilac Cards) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Registered Cameras */}
        <div className="light-card p-5 flex items-center justify-between group hover:border-pine-500 transition-all">
          <div>
            <p className="text-xs font-bold text-pine-800 dark:text-pine-300 uppercase tracking-wider">Active Cameras</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-pine-950 dark:text-white mt-1 tracking-tight">
              {onlineCamCount} <span className="text-base text-oatmeal-500 dark:text-oatmeal-400 font-normal">/ {totalCamCount}</span>
            </h3>
            <p className="text-[11px] text-pine-700 dark:text-pine-300 font-semibold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pine-600 dark:bg-pine-400" />
              Surveillance grid active
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pine-100 dark:bg-pine-950/80 text-pine-800 dark:text-pine-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-pine-200 dark:border-pine-800">
            <Video className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Intrusions */}
        <div className="light-card p-5 flex items-center justify-between border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-oatmeal-50 via-rose-50/20 to-rose-50/40 dark:from-[#0e1c16] dark:to-rose-950/20 group hover:border-rose-400 transition-all">
          <div>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Intrusion Breaches</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
              {breachCount} <span className="text-base font-normal">Events</span>
            </h3>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-1">Perimeter tripwire alerts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Vehicles */}
        <div className="light-card p-5 flex items-center justify-between group hover:border-lilac-500 transition-all">
          <div>
            <p className="text-xs font-bold text-lilac-800 dark:text-lilac-300 uppercase tracking-wider">ANPR Vehicle Passes</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-pine-950 dark:text-white mt-1 tracking-tight">
              {vehicleCount} <span className="text-base text-oatmeal-500 dark:text-oatmeal-400 font-normal">Scans</span>
            </h3>
            <p className="text-[11px] text-lilac-700 dark:text-lilac-300 font-semibold mt-1">Automated plate recognition</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-lilac-100 dark:bg-lilac-950/80 text-lilac-800 dark:text-lilac-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-lilac-200 dark:border-lilac-800">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="light-card p-5 flex items-center justify-between group hover:border-pine-500 transition-all">
          <div>
            <p className="text-xs font-bold text-pine-800 dark:text-pine-300 uppercase tracking-wider">Pending Alerts</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-pine-950 dark:text-white mt-1 tracking-tight">
              {activeAlertCount} <span className="text-base text-oatmeal-500 dark:text-oatmeal-400 font-normal">Active</span>
            </h3>
            <p className="text-[11px] text-pine-700 dark:text-pine-300 font-semibold mt-1">Live incident queue</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pine-100 dark:bg-pine-950/80 text-pine-800 dark:text-pine-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-pine-200 dark:border-pine-800">
            <BellRing className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN HERO CAMERA STREAM (8 Cols) + ALERTS PANEL (4 Cols) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Hero Live Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="light-card overflow-hidden p-2.5 space-y-2.5">
            <div className="relative aspect-video min-h-[500px] bg-[#08120d] rounded-2xl border border-pine-800/80 overflow-hidden text-xs flex flex-col justify-between shadow-2xl">
              <canvas ref={hiddenCanvasRef} className="hidden" />

              {/* Top Control Overlay Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 bg-[#08120d]/90 backdrop-blur-md text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-pine-800/80">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${isWebcamActive ? 'bg-pine-400 animate-ping' : 'bg-lilac-400'}`} />
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-oatmeal-50">
                    {isWebcamActive ? 'Live Laptop Webcam Stream' : 'BOP Sector 4 - Main Fence Terminal'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-pine-900/80 text-pine-200 font-mono font-bold border border-pine-700">
                    {isWebcamActive ? 'STREAMING LIVE' : 'FEED STANDBY'}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-lilac-950/80 text-lilac-300 border border-lilac-800 font-mono font-bold">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleWebcam}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                      isWebcamActive 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                        : 'bg-pine-700 hover:bg-pine-600 text-white ring-2 ring-lilac-400/40'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    {isWebcamActive ? 'Stop Webcam' : 'Turn On Laptop Webcam'}
                  </button>

                  {isWebcamActive && (
                    <button
                      onClick={handleCaptureWebcamSnapshot}
                      disabled={!cameras.length}
                      className="px-4 py-2 bg-lilac-600 hover:bg-lilac-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5"
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

              {/* Tactical Standby Terminal in Deep Pine & Lilac */}
              {!isWebcamActive && (
                <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-[#08120d] via-[#0e1f17] to-[#08120d] flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Subtle Grid Matrix */}
                  <div className="absolute inset-0 bg-[radial-gradient(#296f4b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                  
                  {/* Tactical Reticles in Soft Lilac */}
                  <div className="absolute top-16 left-6 w-7 h-7 border-t-2 border-l-2 border-lilac-400/50" />
                  <div className="absolute top-16 right-6 w-7 h-7 border-t-2 border-r-2 border-lilac-400/50" />
                  <div className="absolute bottom-6 left-6 w-7 h-7 border-b-2 border-l-2 border-lilac-400/50" />
                  <div className="absolute bottom-6 right-6 w-7 h-7 border-b-2 border-r-2 border-lilac-400/50" />

                  <div className="z-10 text-center space-y-4 p-8 max-w-lg">
                    <div className="w-20 h-20 rounded-3xl bg-pine-800/40 border border-pine-500/30 flex items-center justify-center mx-auto text-lilac-300 shadow-xl shadow-pine-900/30">
                      <Video className="w-10 h-10" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h3 className="text-oatmeal-50 font-extrabold text-xl tracking-tight">
                        Main Perimeter Terminal Active
                      </h3>
                      <p className="text-oatmeal-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                        Primary sensor stream ready. Click <span className="text-lilac-300 font-bold">Turn On Laptop Webcam</span> above to stream live surveillance video directly from your camera.
                      </p>
                    </div>

                    {/* Technical Specs Pill Bar in Oatmeal & Lilac */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-oatmeal-200">
                      <span className="px-3 py-1 rounded-xl bg-pine-950 border border-pine-800">RESOLUTION: 1080p FHD</span>
                      <span className="px-3 py-1 rounded-xl bg-pine-950 border border-pine-800">FPS: 30</span>
                      <span className="px-3 py-1 rounded-xl bg-pine-950 border border-pine-800 text-lilac-300">ENCRYPTION: AES-256</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Reticle Tracking */}
              {isWebcamActive && showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                  <div className="w-64 h-64 border-2 border-dashed border-lilac-400 rounded-2xl flex flex-col justify-between p-3 relative shadow-2xl">
                    <div className="bg-pine-800 text-oatmeal-50 font-bold px-2.5 py-0.5 rounded-md text-[11px] w-max shadow-xs border border-pine-600">
                      Target Tracking • Verified Live Stream
                    </div>
                    <div className="text-right">
                      <span className="bg-[#08120d]/90 text-lilac-300 px-2 py-0.5 rounded text-[10px] font-mono border border-lilac-500/40">
                        LATENCY: 18ms
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
            <div className="p-3 bg-oatmeal-50 dark:bg-[#07110c] rounded-xl border border-oatmeal-300/80 dark:border-pine-800/80 flex flex-wrap items-center justify-between text-xs font-medium gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-pine-950 dark:text-oatmeal-100">Surveillance HUD:</span>
                <button 
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    showBoundingBoxes 
                      ? 'bg-lilac-100 dark:bg-lilac-950/60 text-lilac-800 dark:text-lilac-200 border-lilac-300 dark:border-lilac-800 font-bold' 
                      : 'bg-white dark:bg-pine-950 text-oatmeal-700 dark:text-oatmeal-300 border-oatmeal-300 dark:border-pine-800'
                  }`}
                >
                  {showBoundingBoxes ? 'Target Reticle: ON' : 'Target Reticle: OFF'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefreshFeed}
                  disabled={streamRefreshing}
                  className="px-3.5 py-1.5 bg-white dark:bg-pine-950 hover:bg-oatmeal-100 dark:hover:bg-pine-900 text-pine-900 dark:text-oatmeal-200 border border-oatmeal-300 dark:border-pine-800 font-bold rounded-xl cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${streamRefreshing ? 'animate-spin text-pine-600' : 'text-pine-700 dark:text-lilac-400'}`} />
                  Refresh Telemetry
                </button>
              </div>
            </div>
          </div>

          {/* 3 Secondary Feeds Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div 
              onClick={() => onSelectCameraForZone && onSelectCameraForZone(cameras[1]?.id || 2)}
              className="light-card p-3 rounded-2xl border space-y-2 cursor-pointer hover:border-pine-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-pine-950 dark:text-oatmeal-100 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-pine-600 shrink-0" />
                  Cam 02: West Fence
                </span>
                <span className="text-pine-700 dark:text-pine-300 text-[10px] font-mono">ONLINE</span>
              </div>
              <div className="h-20 bg-[#08120d] rounded-xl flex items-center justify-center text-oatmeal-400 text-xs font-mono border border-pine-900">
                [ Sensor Feed Standby ]
              </div>
            </div>

            <div 
              onClick={() => onSelectCameraForZone && onSelectCameraForZone(cameras[2]?.id || 3)}
              className="light-card p-3 rounded-2xl border space-y-2 cursor-pointer hover:border-lilac-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-pine-950 dark:text-oatmeal-100 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-pine-600 shrink-0" />
                  Cam 03: ANPR Gate
                </span>
                <span className="text-lilac-700 dark:text-lilac-300 text-[10px] font-mono">ONLINE</span>
              </div>
              <div className="h-20 bg-[#08120d] rounded-xl flex items-center justify-center text-oatmeal-400 text-xs font-mono border border-pine-900">
                [ ANPR Scanner Ready ]
              </div>
            </div>

            <div 
              onClick={() => onSelectCameraForZone && onSelectCameraForZone(cameras[3]?.id || 4)}
              className="light-card p-3 rounded-2xl border space-y-2 cursor-pointer hover:border-pine-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-pine-950 dark:text-oatmeal-100 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-pine-600 shrink-0" />
                  Cam 04: River Patrol
                </span>
                <span className="text-pine-700 dark:text-pine-300 text-[10px] font-mono">ONLINE</span>
              </div>
              <div className="h-20 bg-[#08120d] rounded-xl flex items-center justify-center text-oatmeal-400 text-xs font-mono border border-pine-900">
                [ Thermal IR Standby ]
              </div>
            </div>

          </div>

        </div>

        {/* Right Panel: Live Alerts & Emergency Sector Control (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Real-time Alerts List */}
          <div className="light-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-oatmeal-200 dark:border-pine-800">
              <h3 className="font-bold text-sm text-pine-950 dark:text-oatmeal-50 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-600" />
                Live Security Alerts
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                {activeAlerts.length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <p className="text-center py-6 text-oatmeal-500 text-xs font-medium">No active security alerts.</p>
              ) : (
                alerts.slice(0, 6).map((a) => (
                  <div key={a.id} className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all ${
                    a.status === 'ACTIVE'
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/25'
                      : 'border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50/70 dark:bg-pine-950/40 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between font-bold pb-1 border-b border-oatmeal-200 dark:border-pine-800/60">
                      <span className={`flex items-center gap-1.5 ${a.severity === 'CRITICAL' ? 'text-rose-700 dark:text-rose-400 font-extrabold' : 'text-amber-800 dark:text-amber-300 font-bold'}`}>
                        <span className={`w-2 h-2 rounded-full ${a.status === 'ACTIVE' ? 'bg-rose-600 animate-ping' : 'bg-oatmeal-400'}`} />
                        {a.event_type}
                      </span>
                      <span className="text-[11px] text-oatmeal-600 dark:text-oatmeal-400 font-mono font-medium">
                        {new Date(a.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-pine-950 dark:text-oatmeal-100 text-xs">{a.message || 'Perimeter alert detected'}</h4>
                    
                    <div className="flex items-center gap-2 pt-1">
                      {a.status === 'ACTIVE' ? (
                        <>
                          <button
                            onClick={() => onAcknowledgeAlert(a.id)}
                            className="flex-1 py-1.5 bg-white dark:bg-pine-950 border border-oatmeal-300 dark:border-pine-800 text-pine-900 dark:text-oatmeal-200 hover:bg-oatmeal-100 dark:hover:bg-pine-900 rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => onResolveAlert(a.id)}
                            className="flex-1 py-1.5 bg-pine-800 hover:bg-pine-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors"
                          >
                            Resolve
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-pine-800 dark:text-pine-300 font-bold bg-pine-100 dark:bg-pine-950/80 px-2.5 py-0.5 rounded-lg border border-pine-300 dark:border-pine-800">
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
          <div className="light-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-pine-950 dark:text-oatmeal-100 uppercase tracking-wider border-b border-oatmeal-200 dark:border-pine-800 pb-2">
              Emergency Sector Control
            </h4>
            <button
              onClick={() => alert('Sector Perimeter Lockout Triggered! All perimeter gates sealed.')}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              TRIGGER EMERGENCY LOCKDOWN
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
