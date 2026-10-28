import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Video, 
  CheckCircle, 
  AlertTriangle, 
  Car, 
  User, 
  Eye, 
  Zap, 
  Camera, 
  Smile, 
  Package,
  Radio,
  Sliders,
  Crosshair,
  Maximize2,
  Lock,
  Search,
  BellRing,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Volume2,
  RotateCcw,
  Bookmark,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  backendOnline,
  wsStatus,
  cameras, 
  alerts, 
  onAcknowledgeAlert, 
  onResolveAlert, 
  onSelectCameraForZone,
  onOpenSimulation,
  onTriggerWebcamAlert
}) {
  const webcamVideoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Overlay state toggles
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showAnprPlates, setShowAnprPlates] = useState(true);
  const [showEmotionMeters, setShowEmotionMeters] = useState(true);
  const [showFencePolygons, setShowFencePolygons] = useState(true);
  const [commandInput, setCommandInput] = useState('');

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
        setWebcamError('Camera permission denied or unavailable.');
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
        severity: 'CRITICAL',
        confidence: 0.99,
        snapshot_path: dataUrl,
        message: 'Operator captured a webcam image for review.'
      });
      if (saved) alert('Snapshot captured and alert saved.');
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  
  // Real-time backend stats values
  const onlineCamCount = stats?.cameras ? stats.cameras.online : cameras.filter(c => c.status === 'ONLINE').length;
  const totalCamCount = stats?.cameras ? stats.cameras.total : cameras.length;
  const breachCount = stats?.intrusions_today !== undefined ? stats.intrusions_today : alerts.filter(a => a.event_type === 'INTRUSION').length;
  const vehicleCount = stats?.vehicles_today ?? 0;
  const activeAlertCount = stats?.active_alerts !== undefined ? stats.active_alerts : activeAlerts.length;

  return (
    <div className="p-4 md:p-6 font-sans bg-[#f8fafc] text-slate-900 min-h-screen">
      <div className="max-w-[1920px] mx-auto space-y-5">
        
        {/* Real-time Status Header */}
        <div className="light-card p-3 px-5 flex flex-wrap items-center justify-between text-xs font-semibold bg-white text-slate-700 gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {backendOnline ? 'API CONNECTED' : 'API DISCONNECTED'}
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-600 font-mono">
              Alerts WebSocket: {wsStatus || 'DISCONNECTED'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-slate-500">SYSTEM TIME:</span>
            <span className="bg-slate-900 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold shadow-xs">
              {currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} — {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP SUMMARY METRICS (4 Clean Real-Time Cards) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="light-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Registered Cameras</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{onlineCamCount} / {totalCamCount} Online</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Status reported by the API</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="light-card p-4 flex items-center justify-between border-rose-200 bg-rose-50/30">
            <div>
              <p className="text-xs font-bold text-rose-700">Intrusion Events Today</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{breachCount} Breaches</h3>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">Recorded event count</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="light-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Vehicle Events Today</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{vehicleCount} Passes</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Recorded event count</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
          </div>

          <div className="light-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeAlertCount} Unresolved</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Live WebSocket Stream</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BellRing className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN SECTION: ENLARGED HERO CAMERA LIVE FEED (8 Cols) + ALERTS PANEL (4 Cols) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Main Enriched Camera Stream Box (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* HERO STREAM CONTAINER */}
            <div className="light-card overflow-hidden p-2 space-y-2">
              <div className="relative aspect-video min-h-[540px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs flex flex-col justify-between">
                <canvas ref={hiddenCanvasRef} className="hidden" />

                {/* Top Control Overlay Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-slate-950/80 backdrop-blur-md text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${isWebcamActive ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
                    <span className="font-extrabold text-base tracking-tight">
                      {isWebcamActive ? 'Browser Webcam Preview' : 'Camera Preview'}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold">LOCAL PREVIEW</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono font-bold">
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleWebcam}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                        isWebcamActive 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isWebcamActive ? '⏹ Stop Webcam' : '🎥 Turn On Laptop Webcam'}
                    </button>

                    {isWebcamActive && (
                      <button
                        onClick={handleCaptureWebcamSnapshot}
                        disabled={!cameras.length}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        📸 Snap & Alert
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

                {/* Clean Simulated Video Feed Graphics (NO Stock Images!) */}
                {!isWebcamActive && (
                  <div className="w-full h-full min-h-[500px] bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Animated Grid Lines */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
                    
                    <div className="z-10 text-center space-y-4 p-8">
                      <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-xl">
                        <Video className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-white font-extrabold text-lg">Main Gate Surveillance Feed Active</h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                          Click <strong className="text-blue-400 font-semibold">Turn On Laptop Webcam</strong> to stream live video directly from your camera!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Bounding Box Overlay */}
                {showBoundingBoxes && (
                  <div className="absolute top-1/3 left-1/4 w-56 h-36 border-2 border-blue-400 bg-blue-500/10 rounded-2xl p-3 flex flex-col justify-between pointer-events-none z-10 shadow-xl">
                    <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-xs w-max shadow-sm">
                      {isWebcamActive ? 'Human Face (99.4%)' : 'Vehicle Target (98%)'}
                    </div>
                    <div className="bg-slate-950/90 text-blue-300 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-blue-500/30">
                      {isWebcamActive ? 'Status: Live Webcam' : 'Plate: JK-02-AB-9981'}
                    </div>
                  </div>
                )}

                {webcamError && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 bg-rose-900/90 text-white p-3 rounded-xl text-center text-xs font-bold">
                    {webcamError}
                  </div>
                )}
              </div>

              {/* Feed Control Sub-Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-medium gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Display Overlay:</span>
                  <button 
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      showBoundingBoxes ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Target Bounding Box
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onTriggerWebcamAlert && cameras[0] && onTriggerWebcamAlert({
                      camera_id: cameras[0].id,
                      event_type: 'INTRUSION',
                      severity: 'CRITICAL',
                      message: 'Perimeter tripwire breach simulated on Main Feed!'
                    })}
                    disabled={!cameras.length}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ⚡ {cameras.length ? 'Test Breach Drill' : 'Add a camera to run a drill'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Secondary Feeds Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="light-card p-3 rounded-2xl border border-slate-200 bg-white space-y-2 cursor-pointer hover:border-blue-400 transition-all">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Cam 02: West Perimeter
                  </span>
                  <span className="text-rose-600 text-[10px]">Breach</span>
                </div>
                <div className="h-24 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono">
                  [ Live Stream ]
                </div>
              </div>

              <div className="light-card p-3 rounded-2xl border border-slate-200 bg-white space-y-2 cursor-pointer hover:border-blue-400 transition-all">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Cam 03: Checkpoint Booth
                  </span>
                  <span className="text-amber-600 text-[10px]">Biometric</span>
                </div>
                <div className="h-24 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono">
                  [ Live Stream ]
                </div>
              </div>

              <div className="light-card p-3 rounded-2xl border border-slate-200 bg-white space-y-2 cursor-pointer hover:border-blue-400 transition-all">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Cam 04: Buffer Zone
                  </span>
                  <span className="text-emerald-600 text-[10px]">Clear</span>
                </div>
                <div className="h-24 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono">
                  [ Live Stream ]
                </div>
              </div>

            </div>

          </div>

          {/* Right Panel: Alerts & Quick Lockdown (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Real-time Alerts List */}
            <div className="light-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-rose-600" />
                  Live Security Alerts
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                  {activeAlerts.length} Active
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No security alerts active.</p>
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <div key={a.id} className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all ${
                      a.status === 'ACTIVE'
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-200 bg-slate-50/60 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-200/50">
                        <span className={`flex items-center gap-1.5 ${a.severity === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
                          <span className={`w-2 h-2 rounded-full ${a.status === 'ACTIVE' ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`} />
                          {a.event_type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(a.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{a.message || 'Perimeter alert detected'}</h4>
                      
                      <div className="flex items-center gap-2 pt-1">
                        {a.status === 'ACTIVE' ? (
                          <>
                            <button
                              onClick={() => onAcknowledgeAlert(a.id)}
                              className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={() => onResolveAlert(a.id)}
                              className="flex-1 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Resolve
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Status: {a.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Emergency Action */}
            <div className="light-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Emergency Sector Control
              </h4>
              <button
                onClick={() => alert('Emergency Sector Barrier Lockout Triggered!')}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <Lock className="w-4 h-4" />
                TRIGGER EMERGENCY LOCKDOWN
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
