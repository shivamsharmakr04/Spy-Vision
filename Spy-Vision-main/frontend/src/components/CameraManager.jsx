import React, { useState } from 'react';
import { Server, Plus, Video, Trash2, Activity } from 'lucide-react';

export default function CameraManager({ cameras, onCreateCamera, onUpdateCamera, onDeleteCamera, onHeartbeat }) {
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
    <div className="p-4 md:p-6 space-y-6 max-w-[1920px] mx-auto font-sans text-slate-900 select-none">
      {/* Header */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            CCTV Camera Registry
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Register surveillance video streams and active AI detection model pipelines.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Register Camera
        </button>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => (
          <div key={cam.id} className="light-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cam.name}</h3>
                  <p className="text-xs text-slate-500">{cam.location || 'Main Sector'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                  cam.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {cam.status}
                </span>

                <button
                  onClick={() => onDeleteCamera(cam.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete Camera"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-blue-600 font-mono font-bold truncate">
              URL: {cam.stream_url}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400 font-mono">ID #{cam.id}</span>
              <button
                onClick={() => onHeartbeat(cam.id)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Ping Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Register Camera Node</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Camera Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Main Sector Gate Cam"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Browser-playable stream URL (MP4 / HLS)</label>
                <input
                  type="text"
                  required
                  value={form.stream_url}
                  onChange={(e) => setForm({...form, stream_url: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/camera/stream.m3u8"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location / Sector Zone</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Sector 4 Alpha"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors mt-2">
                Save Camera Node
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
