import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Trash2, MousePointer, Save } from 'lucide-react';

export default function ZoneEditor({ cameras, selectedCameraId, onSaveZone, onDeleteZone, existingZones }) {
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
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
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

      if (points.length >= 3) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
      }

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#06b6d4' : '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }
  }, [points, existingZones, activeCamId]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setPoints([...points, { x, y }]);
  };

  const handleClearPoints = () => {
    setPoints([]);
  };

  const handleSave = () => {
    if (points.length < 3) {
      alert('Please click at least 3 points on the feed to define perimeter boundary.');
      return;
    }

    const canvas = canvasRef.current;
    const normalizedCoords = points.map(p => [
      Number((p.x / canvas.width).toFixed(3)),
      Number((p.y / canvas.height).toFixed(3))
    ]);

    const zoneData = {
      camera_id: activeCamId,
      name: zoneName,
      zone_type: zoneType,
      coordinates: normalizedCoords,
      sensitivity: Number(sensitivity),
      is_active: true
    };

    onSaveZone(zoneData);
    setPoints([]);
  };

  return (
    <div className="p-4 md:p-6 font-sans bg-[#f8fafc] text-slate-900 min-h-screen">
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* Header */}
        <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Detection Zone Configurator
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Store polygon boundaries for camera feeds. This prototype does not run detection against them.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-xs font-semibold text-slate-600">Select Stream:</span>
            <select
              value={activeCamId}
              onChange={(e) => {
                setActiveCamId(Number(e.target.value));
                setPoints([]);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location || 'Sector'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Stream Canvas */}
          <div className="lg:col-span-2 space-y-2">
            <div className="relative aspect-video rounded-2xl border border-slate-300 bg-slate-900 overflow-hidden shadow-sm">
              {activeCamera?.stream_url ? (
                <video
                  src={activeCamera.stream_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  Stream Feed Offline
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                onClick={handleCanvasClick}
                className="absolute inset-0 w-full h-full cursor-crosshair"
              />

              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white font-sans text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-blue-400" />
                {points.length === 0 
                  ? "Click feed to set boundary vertices" 
                  : `Points: ${points.length} (Need 3+ to enclose zone)`}
              </div>

              {points.length > 0 && (
                <button
                  onClick={handleClearPoints}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Clear Points
                </button>
              )}
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-4">
            <div className="light-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Define Zone Rules
              </h3>

              <div className="space-y-3.5 text-xs font-medium">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Zone Identifier / Name</label>
                  <input
                    type="text"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Detection Zone Type</label>
                  <select
                    value={zoneType}
                    onChange={(e) => setZoneType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="INTRUSION_ZONE">Intrusion Zone (Perimeter Breach)</option>
                    <option value="RESTRICTED_AREA">Restricted Area (No Access)</option>
                    <option value="FENCE_LINE">Fence Line (Approach Warning)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Sensitivity Threshold:</span>
                    <span className="text-blue-600 font-bold">{(sensitivity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="0.99"
                    step="0.05"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value)}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={points.length < 3 || !activeCamera}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    points.length >= 3 && activeCamera
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save Detection Zone
                </button>
              </div>
            </div>

            {/* Saved List */}
            <div className="light-card p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Active Zones ({existingZones?.length || 0})
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {!existingZones || existingZones.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No active zones configured on this feed.
                  </div>
                ) : (
                  existingZones.map((z) => (
                    <div key={z.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{z.name}</p>
                        <p className="text-[11px] text-slate-500">{z.zone_type} • {((z.sensitivity || 0.8) * 100).toFixed(0)}% Sens</p>
                      </div>
                      <button onClick={() => onDeleteZone(z.id)} className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer">
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
    </div>
  );
}
