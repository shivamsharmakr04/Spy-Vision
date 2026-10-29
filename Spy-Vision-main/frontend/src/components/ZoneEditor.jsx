import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Save, 
  Sliders, 
  Eye, 
  EyeOff, 
  MousePointer, 
  Check, 
  AlertCircle,
  Crosshair
} from 'lucide-react';

export default function ZoneEditor({
  cameras = [],
  selectedCameraId,
  onSaveZone,
  onDeleteZone,
  existingZones = []
}) {
  const [activeCamId, setActiveCamId] = useState(selectedCameraId || (cameras[0]?.id || 1));
  const [points, setPoints] = useState([]);
  const [zoneName, setZoneName] = useState('Sector-Alpha Tripwire');
  const [zoneType, setZoneType] = useState('INTRUSION_ZONE');
  const [sensitivity, setSensitivity] = useState(0.85);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (selectedCameraId) setActiveCamId(selectedCameraId);
  }, [selectedCameraId]);

  // Redraw canvas points and polygon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing zones in green/cyan
    existingZones.forEach(z => {
      if (z.coordinates && z.coordinates.length > 2) {
        ctx.beginPath();
        ctx.moveTo(z.coordinates[0][0], z.coordinates[0][1]);
        for (let i = 1; i < z.coordinates.length; i++) {
          ctx.lineTo(z.coordinates[i][0], z.coordinates[i][1]);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#10b981';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(z.name, z.coordinates[0][0] + 5, z.coordinates[0][1] + 15);
      }
    });

    // Draw current active editing points & polygon in cyan
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      if (points.length > 2) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fill();
      }
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw point markers
      points.forEach(([x, y], idx) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(String(idx + 1), x + 8, y + 3);
      });
    }
  }, [points, existingZones]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    if (points.length < 8) {
      setPoints([...points, [x, y]]);
    }
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleSave = () => {
    if (points.length < 3) {
      alert('A valid perimeter zone requires at least 3 points to form a polygon.');
      return;
    }
    onSaveZone({
      camera_id: activeCamId,
      name: zoneName,
      zone_type: zoneType,
      coordinates: points,
      sensitivity: parseFloat(sensitivity),
    });
    setPoints([]);
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* Header and Camera Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            AI Detection Zones & Perimeter Geofencing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Draw custom polygonal tripwires and sensitivity thresholds directly over surveillance feeds.
          </p>
        </div>

        {/* Camera Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Camera:</span>
          <select 
            value={activeCamId} 
            onChange={(e) => setActiveCamId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.location || 'Perimeter Sector'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Interactive Zone Canvas Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-3 shadow-xs">
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              
              {/* Standby Canvas Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#10b98120_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
              
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                onClick={handleCanvasClick}
                className="w-full h-full object-cover cursor-crosshair z-10"
              />

              {points.length === 0 && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-200 text-xs font-mono flex items-center gap-2">
                  <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Click anywhere to plot geofence boundary coordinates</span>
                </div>
              )}
            </div>

            {/* Canvas Actions Sub-Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-medium gap-3 mt-3">
              <span className="font-mono text-slate-600 dark:text-slate-400">
                Points Plotted: <strong className="text-emerald-700 dark:text-cyan-400 font-bold">{points.length}</strong> (min. 3 for polygon)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors shadow-2xs active:scale-95"
                >
                  Clear Points
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5 text-white" />
                  Save Polygon Zone
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Zone Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Zone Identifier
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Detection Classification
                </label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="INTRUSION_ZONE">Perimeter Tripwire (Intrusion)</option>
                  <option value="RESTRICTED_AREA">Restricted Security Buffer</option>
                  <option value="LOITERING_ZONE">Loitering Dwell Time Zone</option>
                  <option value="ANPR_LANE">ANPR Vehicle Inspection Lane</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between font-bold mb-1">
                  <label className="text-slate-800 dark:text-slate-200">AI Sensitivity Threshold</label>
                  <span className="text-cyan-700 dark:text-cyan-400 font-mono font-bold">{Math.round(sensitivity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Active Saved Zones List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              Active Zones for this Feed ({existingZones?.length || 0})
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {!existingZones || existingZones.length === 0 ? (
                <p className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs">No zones saved on this camera.</p>
              ) : (
                existingZones.map((z) => (
                  <div key={z.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{z.name}</p>
                      <p className="text-[10px] text-emerald-700 dark:text-cyan-400 font-mono font-bold">{z.zone_type} • Sens: {Math.round((z.sensitivity || 0.85) * 100)}%</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteZone(z.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                      title="Delete Zone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
