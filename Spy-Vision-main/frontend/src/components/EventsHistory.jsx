import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  AlertTriangle, 
  Car, 
  Users, 
  Calendar,
  ShieldAlert,
  X
} from 'lucide-react';

export default function EventsHistory({ events = [], cameras = [], onRefreshEvents }) {
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  const getCameraName = (camId) => {
    const found = cameras.find(c => c.id === camId);
    return found ? found.name : `Camera #${camId}`;
  };

  const filteredEvents = events.filter(e => {
    if (selectedType && e.event_type !== selectedType) return false;
    if (selectedSeverity && e.severity !== selectedSeverity) return false;
    if (searchPlate && (!e.plate_number || !e.plate_number.toLowerCase().includes(searchPlate.toLowerCase()))) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Camera', 'Event Type', 'Severity', 'Confidence', 'Plate Number'];
    const rows = filteredEvents.map(e => [
      e.id,
      new Date(e.timestamp || Date.now()).toISOString(),
      getCameraName(e.camera_id),
      e.event_type,
      e.severity,
      e.confidence,
      e.plate_number || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spyvision_surveillance_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Surveillance Telemetry & Historical Event Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Complete audit trail of security trips, vehicle plate recognition scans, and verified boundary alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshEvents}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            Sync Logs
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4 text-white" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Classification</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Types</option>
            <option value="INTRUSION">INTRUSION</option>
            <option value="ANPR_MATCH">ANPR MATCH</option>
            <option value="FACE_RECOGNITION">FACE RECOGNITION</option>
            <option value="LOITERING">LOITERING</option>
            <option value="OBJECT_DETECTED">OBJECT DETECTED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Severity Level</label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Filter License Plate</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              placeholder="e.g. JK-02"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Events Table / Card List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recorded Surveillance Events ({filteredEvents.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Camera Node</th>
                <th className="px-5 py-3">Event Classification</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3">Details / Plate</th>
                <th className="px-5 py-3 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-medium">
                    No surveillance events matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(evt.timestamp || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {getCameraName(evt.camera_id)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        evt.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                        evt.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                        'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-700 dark:text-cyan-400 font-bold">
                      {evt.confidence ? `${Math.round(evt.confidence * 100)}%` : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {evt.plate_number ? (
                        <span className="bg-slate-950 text-cyan-300 px-2.5 py-0.5 rounded text-[11px] font-bold border border-slate-800">
                          {evt.plate_number}
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Perimeter Zone</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {evt.snapshot_path ? (
                        <button
                          onClick={() => setSelectedEventModal(evt)}
                          className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors border border-cyan-200 dark:border-cyan-800 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-mono">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Snapshot Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
                Snapshot Evidence Frame #{selectedEventModal.id}
              </h3>
              <button 
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={selectedEventModal.snapshot_path}
                alt="Event Evidence Frame"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
              <p className="text-slate-800 dark:text-slate-200">
                <strong>Camera:</strong> {getCameraName(selectedEventModal.camera_id)}
              </p>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>Event:</strong> {selectedEventModal.event_type} ({selectedEventModal.severity})
              </p>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>Timestamp:</strong> {new Date(selectedEventModal.timestamp || Date.now()).toLocaleString()}
              </p>
              {selectedEventModal.plate_number && (
                <p className="text-cyan-700 dark:text-cyan-400 font-bold">
                  <strong>Recognized Plate:</strong> {selectedEventModal.plate_number}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
