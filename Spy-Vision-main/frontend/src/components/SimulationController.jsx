import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, Car, Zap, CheckCircle2, Smile, Package } from 'lucide-react';

export default function SimulationController({ cameras, onTriggerEvent }) {
  const [selectedCamId, setSelectedCamId] = useState(cameras[0]?.id || 1);
  const [lastTriggered, setLastTriggered] = useState(null);

  useEffect(() => {
    if (cameras[0] && !cameras.some((camera) => camera.id === selectedCamId)) {
      setSelectedCamId(cameras[0].id);
    }
  }, [cameras, selectedCamId]);

  const presets = [
    {
      id: 'INTRUSION',
      title: 'Perimeter Intrusion Event',
      icon: ShieldAlert,
      color: 'bg-rose-600 hover:bg-rose-500 text-white',
      description: 'Simulates 2 unauthorized targets crossing virtual fence boundary.',
      data: {
        camera_id: selectedCamId,
        event_type: 'INTRUSION',
        severity: 'CRITICAL',
        confidence: 0.96,
        snapshot_path: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
        message: 'Critical Perimeter Intrusion detected at Gate 4! 2 targets crossing virtual fence.'
      }
    },
    {
      id: 'ANPR_MATCH',
      title: 'Plate Watchlist Hit',
      icon: Car,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      description: 'Simulates ANPR reading plate "JK-02-AB-9981" matching vehicle watchlist.',
      data: {
        camera_id: selectedCamId,
        event_type: 'ANPR_MATCH',
        severity: 'HIGH',
        plate_number: 'JK-02-AB-9981',
        confidence: 0.98,
        snapshot_path: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        message: 'Watchlist Plate Match: JK-02-AB-9981 detected entering checkpost.'
      }
    },
    {
      id: 'OBJECT_DETECTED',
      title: 'Unattended Object Detection',
      icon: Package,
      color: 'bg-amber-600 hover:bg-amber-500 text-white',
      description: 'Simulates unattended bag or parcel detected in restricted zone.',
      data: {
        camera_id: selectedCamId,
        event_type: 'OBJECT_DETECTED',
        severity: 'HIGH',
        confidence: 0.94,
        snapshot_path: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        message: 'Object Alert: Unattended Backpack detected inside Restricted Zone Alpha.'
      }
    },
    {
      id: 'REACTION_ANALYSIS',
      title: 'Target Suspicious Behavior',
      icon: Smile,
      color: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      description: 'Simulates suspicious behavior pattern detected near perimeter.',
      data: {
        camera_id: selectedCamId,
        event_type: 'REACTION_ANALYSIS',
        severity: 'CRITICAL',
        confidence: 0.97,
        person_name: 'Target #101',
        snapshot_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        message: 'Reaction Alert: Target exhibiting suspicious behavior near fence.'
      }
    }
  ];

  const handleTrigger = async (preset) => {
    const eventPayload = {
      ...preset.data,
      camera_id: selectedCamId,
      timestamp: new Date().toISOString()
    };
    const saved = await onTriggerEvent(eventPayload);
    if (saved) setLastTriggered(preset.title + ' at ' + new Date().toLocaleTimeString());
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1920px] mx-auto font-sans text-slate-900 select-none">
      {/* Header */}
      <div className="light-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              AI Intrusion Alert Simulator
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Inject synthetic surveillance alert events to test real-time notification feeds and response protocols.
            </p>
          </div>
        </div>

        {lastTriggered && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Simulated Event Triggered: <strong>{lastTriggered}</strong></span>
          </div>
        )}
      </div>

      {/* Camera Target Selector */}
      <div className="light-card p-4 flex items-center gap-3 text-xs">
        <span className="font-semibold text-slate-700">Target Camera Node:</span>
        <select
          value={selectedCamId}
          onChange={(e) => setSelectedCamId(Number(e.target.value))}
          disabled={!cameras.length}
          className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {cameras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.location || 'Gate'})
            </option>
          ))}
        </select>
      </div>

      {!cameras.length && (
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add a camera in Camera Manager before simulating an event.
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="light-card p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.description}</p>
              </div>

              <button
                onClick={() => handleTrigger(p)}
                disabled={!cameras.length}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50 ${p.color}`}
              >
                <Zap className="w-4 h-4 fill-current" />
                Trigger {p.title}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
