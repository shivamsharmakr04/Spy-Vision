import React, { useState } from 'react';
import { Users, Car, Plus, Trash2, Search, ShieldAlert, X } from 'lucide-react';

export default function WatchlistManager({ 
  persons, 
  vehicles, 
  onCreatePerson, 
  onDeletePerson,
  onCreateVehicle,
  onDeleteVehicle
}) {
  const [activeTab, setActiveTab] = useState('persons');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [personForm, setPersonForm] = useState({
    full_name: '',
    suspect_id: '',
    threat_level: 'HIGH',
    status: 'WANTED',
    notes: '',
    photo_url: ''
  });

  const [vehicleForm, setVehicleForm] = useState({
    plate_number: '',
    vehicle_type: 'SUV / OFF-ROAD',
    color: 'DARK GREY',
    threat_level: 'HIGH',
    notes: ''
  });

  const filteredPersons = persons.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.suspect_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v => 
    v.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSavePerson = (e) => {
    e.preventDefault();
    if (!personForm.full_name || !personForm.suspect_id) {
      alert('Please enter Full Name and Suspect ID');
      return;
    }
    onCreatePerson({
      ...personForm,
      photo_url: personForm.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
    });
    setShowModal(false);
    setPersonForm({ full_name: '', suspect_id: '', threat_level: 'HIGH', status: 'WANTED', notes: '', photo_url: '' });
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!vehicleForm.plate_number) {
      alert('Please enter a License Plate Number');
      return;
    }
    onCreateVehicle(vehicleForm);
    setShowModal(false);
    setVehicleForm({ plate_number: '', vehicle_type: 'SUV / OFF-ROAD', color: 'DARK GREY', threat_level: 'HIGH', notes: '' });
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1920px] mx-auto font-sans transition-colors">
      
      {/* Top Header Card */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Watchlist & Threat Recognition Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Maintain high-priority suspects, POIs, and blacklisted license plates for automated matching.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'persons' ? 'Add Person to Watchlist' : 'Add Vehicle to Watchlist'}
        </button>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('persons')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'persons'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Flagged Persons ({persons.length})
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'vehicles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Flagged Vehicles ({vehicles.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'persons' ? 'suspects, IDs...' : 'plates, models...'}`}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Persons Cards Grid */}
      {activeTab === 'persons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersons.map((p) => (
            <div key={p.id} className="light-card p-5 space-y-4 hover:border-blue-400 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img 
                      src={p.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'} 
                      alt={p.full_name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.full_name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">{p.suspect_id}</p>
                  </div>
                </div>

                <button
                  onClick={() => onDeletePerson(p.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  p.threat_level === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                  p.threat_level === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                }`}>
                  THREAT: {p.threat_level}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  STATUS: {p.status || 'WANTED'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                {p.notes || 'No reconnaissance notes recorded.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Vehicles Cards Grid */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => (
            <div key={v.id} className="light-card p-5 space-y-4 hover:border-blue-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-block bg-slate-900 text-amber-400 font-mono font-extrabold text-sm px-3 py-1 rounded-xl border border-slate-800 shadow-xs mb-1.5">
                    {v.plate_number}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{v.vehicle_type || 'Unspecified Vehicle'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Color: {v.color || 'Standard'}</p>
                </div>

                <button
                  onClick={() => onDeleteVehicle(v.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                  title="Remove Vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  v.threat_level === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}>
                  THREAT: {v.threat_level || 'HIGH'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                {v.notes || 'No vehicle surveillance remarks filed.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {activeTab === 'persons' ? 'Register Suspect on Watchlist' : 'Add Vehicle to ANPR Watchlist'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'persons' ? (
              <form onSubmit={handleSavePerson} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={personForm.full_name}
                    onChange={(e) => setPersonForm({...personForm, full_name: e.target.value})}
                    placeholder="e.g. Tariq Mahmood"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Suspect File / POI ID</label>
                  <input
                    type="text"
                    required
                    value={personForm.suspect_id}
                    onChange={(e) => setPersonForm({...personForm, suspect_id: e.target.value})}
                    placeholder="e.g. POI-2026-9041"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Threat Level</label>
                    <select
                      value={personForm.threat_level}
                      onChange={(e) => setPersonForm({...personForm, threat_level: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={personForm.status}
                      onChange={(e) => setPersonForm({...personForm, status: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="WANTED">WANTED</option>
                      <option value="MONITORED">MONITORED</option>
                      <option value="DETAINED">DETAINED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Field Intelligence Notes</label>
                  <textarea
                    rows={3}
                    value={personForm.notes}
                    onChange={(e) => setPersonForm({...personForm, notes: e.target.value})}
                    placeholder="Reconnaissance and activity history..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md mt-2"
                >
                  Save Person to Watchlist
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">License Plate Number</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.plate_number}
                    onChange={(e) => setVehicleForm({...vehicleForm, plate_number: e.target.value.toUpperCase()})}
                    placeholder="e.g. JK-02-AB-9981"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle Classification</label>
                    <input
                      type="text"
                      value={vehicleForm.vehicle_type}
                      onChange={(e) => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                      placeholder="e.g. SUV, Cargo Truck"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Color</label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                      placeholder="e.g. Dark Grey"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Threat Level</label>
                  <select
                    value={vehicleForm.threat_level}
                    onChange={(e) => setVehicleForm({...vehicleForm, threat_level: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Surveillance Remarks</label>
                  <textarea
                    rows={3}
                    value={vehicleForm.notes}
                    onChange={(e) => setVehicleForm({...vehicleForm, notes: e.target.value})}
                    placeholder="Spotted near sector perimeter..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md mt-2"
                >
                  Save Vehicle to ANPR Watchlist
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
