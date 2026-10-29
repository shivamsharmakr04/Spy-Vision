import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Trash2, MousePointer, Save, ShieldAlert, Sliders } from 'lucide-react';

export default function ZoneEditor({ cameras = [], selectedCameraId, onSaveZone, onDeleteZone, existingZones }) {
  const [activeCamId, setActiveCamId] = useState(selectedCameraId || (cameras[0]?.id || 1));
  const [points, setPoints] = useState([]);
  const [zoneName, setZoneName] = useState('INTRUSION_ZONE_SECTOR_07W');
  const [zoneType, setZoneType] = useState('INTRUSION_ZONE');
  const [sensitivity, setSensitivity] = useState(0.85);
  const canvasRef = useRef(null);

  const activeCamera = cameras.find(c => c.id === activeCamId) || cameras[0];

  useEffect(() => {
    if (selectedCameraId) setActiveCamId(selectedCameraId);
  }, [selectedCameraId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (existingZones && existingZones.length > 0) {
      existingZones.forEach((z) => {
        if (!z.coordinates || z.coordinates.length < 2) return;
        ctx.beginPath();
        const firstPt = z.coordinates[0];
        ctx.moveTo(firstPt[0] * canvas.width, firstPt[1] * canvas.height);
        
        for (let i = 1; i < z.coordinates.length; i++) {
          const pt = z.coordinates[i];
          ctx.lineTo(pt[0] * canvas.width, pt[1] * canvas.height);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(141, 102, 185, 0.25)'; // Soft lilac tint
        ctx.fill();
        ctx.strokeStyle = '#8d66b9';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#c5b0df';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(`[SAVED] ${z.name}`, z.coordinates[0][0] * canvas.width + 5, z.coordinates[0][1] * canvas.height + 15);
      });
    }

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = '#59a67d'; // Pine green accent
      ctx.lineWidth = 2;
      ctx.stroke();

      points.forEach((pt, index) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = index === 0 ? '#8d66b9' : '#388a5e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [points, existingZones]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints([...points, { x, y }]);
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleSave = () => {
    if (points.length < 3) {
      alert('A perimeter zone requires at least 3 points to create a polygon.');
      return;
    }
    const canvas = canvasRef.current;
    const normalizedCoords = points.map(p => [
      Number((p.x / canvas.width).toFixed(3)),
      Number((p.y / canvas.height).toFixed(3))
    ]);

    onSaveZone({
      camera_id: activeCamId,
      name: zoneName,
      zone_type: zoneType,
      coordinates: normalizedCoords,
      sensitivity: Number(sensitivity),
      is_active: true
    });

    setPoints([]);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* Top Header Card */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-pine-950 dark:text-oatmeal-50 flex items-center gap-2">
            <Layers className="w-5 h-5 text-pine-800 dark:text-lilac-300" />
            AI Detection Zones & Perimeter Geofencing
          </h2>
          <p className="text-xs text-pine-800/80 dark:text-oatmeal-300 font-medium mt-1">
            Draw custom polygonal tripwires and sensitivity thresholds directly over surveillance feeds.
          </p>
        </div>

        {/* Camera Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-pine-950 dark:text-oatmeal-200">Target Camera:</span>
          <select 
            value={activeCamId} 
            onChange={(e) => setActiveCamId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-white dark:bg-[#0e1c16] text-xs font-bold text-pine-950 dark:text-oatmeal-50 focus:outline-hidden focus:ring-2 focus:ring-lilac-500 cursor-pointer shadow-xs"
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
          <div className="light-card overflow-hidden p-2.5">
            <div className="relative aspect-video bg-[#08120d] rounded-2xl overflow-hidden border border-pine-800 shadow-2xl flex items-center justify-center">
              
              {/* Standby Canvas Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#296f4b_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
              
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                onClick={handleCanvasClick}
                className="w-full h-full object-cover cursor-crosshair z-10"
              />

              {points.length === 0 && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none bg-[#08120d]/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-pine-700 text-oatmeal-100 text-xs font-mono flex items-center gap-2">
                  <MousePointer className="w-3.5 h-3.5 text-lilac-300" />
                  <span>Click anywhere to plot geofence boundary coordinates</span>
                </div>
              )}
            </div>

            {/* Canvas Actions Sub-Bar */}
            <div className="p-3 bg-oatmeal-50 dark:bg-[#07110c] rounded-xl border border-oatmeal-300 dark:border-pine-800 flex flex-wrap items-center justify-between text-xs font-medium gap-3 mt-2.5">
              <span className="font-mono text-oatmeal-700 dark:text-oatmeal-300">
                Points Plotted: <strong className="text-pine-800 dark:text-lilac-300 font-bold">{points.length}</strong> (min. 3 for polygon)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-1.5 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-white dark:bg-pine-950 text-pine-950 dark:text-oatmeal-200 hover:bg-oatmeal-100 dark:hover:bg-pine-900 font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Clear Points
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl bg-pine-800 hover:bg-pine-700 text-white font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5 ring-2 ring-lilac-400/30"
                >
                  <Save className="w-3.5 h-3.5 text-lilac-300" />
                  Save Polygon Zone
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="light-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-pine-950 dark:text-oatmeal-50 pb-3 border-b border-oatmeal-200 dark:border-pine-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pine-800 dark:text-lilac-300" />
              Zone Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                  Zone Identifier
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-pine-950 dark:text-oatmeal-50 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-lilac-500"
                />
              </div>

              <div>
                <label className="block font-bold text-pine-950 dark:text-oatmeal-200 mb-1">
                  Detection Classification
                </label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] text-pine-950 dark:text-oatmeal-50 font-bold focus:outline-hidden focus:ring-2 focus:ring-lilac-500 cursor-pointer"
                >
                  <option value="INTRUSION_ZONE">Perimeter Tripwire (Intrusion)</option>
                  <option value="RESTRICTED_AREA">Restricted Security Buffer</option>
                  <option value="LOITERING_ZONE">Loitering Dwell Time Zone</option>
                  <option value="ANPR_LANE">ANPR Vehicle Inspection Lane</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between font-bold mb-1">
                  <label className="text-pine-950 dark:text-oatmeal-200">AI Sensitivity Threshold</label>
                  <span className="text-lilac-700 dark:text-lilac-300 font-mono font-bold">{Math.round(sensitivity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  className="w-full accent-pine-800 dark:accent-lilac-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Active Saved Zones List */}
          <div className="light-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-pine-950 dark:text-oatmeal-50 uppercase tracking-wider pb-2 border-b border-oatmeal-200 dark:border-pine-800">
              Active Zones for this Feed ({existingZones?.length || 0})
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {!existingZones || existingZones.length === 0 ? (
                <p className="text-center py-4 text-oatmeal-500 text-xs">No zones saved on this camera.</p>
              ) : (
                existingZones.map((z) => (
                  <div key={z.id} className="p-3 rounded-xl border border-oatmeal-300 dark:border-pine-800 bg-oatmeal-50 dark:bg-[#08120d] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-pine-950 dark:text-oatmeal-100">{z.name}</p>
                      <p className="text-[10px] text-lilac-700 dark:text-lilac-300 font-mono font-bold">{z.zone_type} • Sens: {Math.round((z.sensitivity || 0.85) * 100)}%</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteZone(z.id)}
                      className="p-1 text-oatmeal-500 hover:text-rose-600 cursor-pointer transition-colors"
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
