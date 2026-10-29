import React, { useState } from 'react';
import { Server, Plus, Video, Trash2, Activity, X } from 'lucide-react';

export default function CameraManager({ cameras = [], onCreateCamera, onUpdateCamera, onDeleteCamera, onHeartbeat }) {
  const [showModal, setShowModal] = useState(false);
  const [editingCam, setEditingCam] = useState(null);

  const [form, setForm] = useState({
    name: '',
    location: '',
    stream_url: '',
    status: 'ONLINE',
    ai_models_enabled: ['PERSON_DETECTION', 'INTRUSION_DETECTION']
  });

  const handleOpenAdd = () => {
    setEditingCam(null);
    setForm({
      name: '',
      location: '',
      stream_url: '',
      status: 'ONLINE',
      ai_models_enabled: ['PERSON_DETECTION', 'INTRUSION_DETECTION']
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.stream_url) {
      alert('Please enter Camera Name and Stream URL');
      return;
    }
    if (editingCam) {
      onUpdateCamera(editingCam.id, form);
    } else {
      onCreateCamera(form);
    }
    setShowModal(false);
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* Top Header Card */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            CCTV & Sensor Camera Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Register surveillance video feeds, IP RTSP streams, and hardware sensors.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Register New Camera
        </button>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => (
          <div key={cam.id} className="light-card p-5 space-y-3.5 hover:border-blue-400 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cam.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cam.location || 'Perimeter Sector'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  cam.status === 'ONLINE'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}>
                  {cam.status}
                </span>

                <button
                  onClick={() => onDeleteCamera(cam.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                  title="Delete Camera"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-blue-600 dark:text-blue-400 font-mono font-bold truncate">
              STREAM: {cam.stream_url}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>HEARTBEAT: OK</span>
              </div>

              <button
                onClick={() => onHeartbeat && onHeartbeat(cam.id)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Send Ping
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Camera Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Register CCTV Camera</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Camera Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g. BOP Sector 5 - North Fence Line"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Geographic Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  placeholder="e.g. Outpost Bravo - Sector 5"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">RTSP Stream / MP4 URL</label>
                <input
                  type="text"
                  required
                  value={form.stream_url}
                  onChange={(e) => setForm({...form, stream_url: e.target.value})}
                  placeholder="rtsp://192.168.1.120:554/live/ch0 or https://..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md mt-2"
              >
                Add to Camera Network
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
