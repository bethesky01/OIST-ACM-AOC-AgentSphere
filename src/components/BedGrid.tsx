import React, { useState } from 'react';
import { Bed } from '../types';
import { BedDouble, CheckCircle, AlertTriangle, Clock, RefreshCw, Filter, ShieldAlert, UserCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BedGridProps {
  beds: Bed[];
  onToggleBed: (id: string, status: 'available' | 'occupied' | 'reserved', patientName?: string) => Promise<void>;
  onResetBeds: () => Promise<void>;
  loading: boolean;
}

export default function BedGrid({ beds, onToggleBed, onResetBeds, loading }: BedGridProps) {
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [admitBedId, setAdmitBedId] = useState<string | null>(null);
  const [patientNameInput, setPatientNameInput] = useState<string>('');

  // Extract unique wards
  const wards = ['All', ...Array.from(new Set(beds.map((b) => b.ward)))];

  // Filtered beds
  const filteredBeds = beds.filter((bed) => {
    const wardMatch = selectedWard === 'All' || bed.ward === selectedWard;
    const statusMatch = selectedStatus === 'All' || bed.status === selectedStatus;
    return wardMatch && statusMatch;
  });

  // Calculate statistics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const reservedBeds = beds.filter((b) => b.status === 'reserved').length;
  const availableBeds = beds.filter((b) => b.status === 'available').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitBedId) return;
    await onToggleBed(admitBedId, 'occupied', patientNameInput || 'Admitted Patient');
    setAdmitBedId(null);
    setPatientNameInput('');
  };

  const getStatusColor = (status: 'available' | 'occupied' | 'reserved') => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20';
      case 'occupied':
        return 'bg-amber-50/40 dark:bg-amber-950/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20';
      case 'reserved':
        return 'bg-blue-50/40 dark:bg-blue-950/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20';
    }
  };

  const getStatusBadge = (status: 'available' | 'occupied' | 'reserved') => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Occupied
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
            Reserved (AI)
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BedDouble className="text-blue-600 dark:text-blue-400" size={24} />
            Real-Time Bed Availability
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic bed allocation synchronized with our multi-agent symptom triage pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetBeds}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reset Ward Data
          </button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/25 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Available Beds</span>
            <span className="font-display text-2xl font-bold text-emerald-900 dark:text-emerald-100">{availableBeds}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 block mt-0.5">Ready for admission</span>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2.5 rounded-lg text-emerald-700 dark:text-emerald-300">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100/50 dark:border-amber-900/25 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Occupied Beds</span>
            <span className="font-display text-2xl font-bold text-amber-900 dark:text-amber-100">{occupiedBeds}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-500 block mt-0.5">{occupancyRate}% occupancy rate</span>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/50 p-2.5 rounded-lg text-amber-700 dark:text-amber-300">
            <BedDouble size={20} />
          </div>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/50 dark:border-blue-900/25 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider block">AI Reserved</span>
            <span className="font-display text-2xl font-bold text-blue-900 dark:text-blue-100">{reservedBeds}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-500 block mt-0.5">Assigned by triage</span>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-lg text-blue-700 dark:text-blue-300">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Total Ward Beds</span>
            <span className="font-display text-2xl font-bold text-slate-800 dark:text-slate-200">{totalBeds}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block mt-0.5">Across 5 departments</span>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300">
            <Filter size={20} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl mb-6 border border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mr-2">
          <Filter size={14} className="text-slate-400 dark:text-slate-500" />
          Filter:
        </div>
        
        {/* Ward Filters */}
        <div className="flex flex-wrap gap-1.5">
          {wards.map((ward) => (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedWard === ward
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {ward === 'All' ? 'All Wards' : ward}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>

        {/* Status Filters */}
        <div className="flex gap-1.5 ml-auto">
          {['All', 'available', 'occupied', 'reserved'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                selectedStatus === status
                  ? 'bg-slate-700 dark:bg-slate-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {status === 'All' ? 'All Statuses' : status === 'reserved' ? 'AI Reserved' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Ward Layout Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredBeds.map((bed) => {
          const isICU = bed.ward === 'ICU';
          return (
            <motion.div
              layout
              key={bed.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`relative border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 min-h-[110px] cursor-pointer ${getStatusColor(
                bed.status
              )}`}
              onClick={() => {
                if (bed.status === 'available') {
                  setAdmitBedId(bed.id);
                } else if (bed.status === 'occupied') {
                  if (confirm(`Would you like to discharge patient "${bed.patientName || 'Admitted Patient'}" and release bed ${bed.name}?`)) {
                    onToggleBed(bed.id, 'available');
                  }
                } else if (bed.status === 'reserved') {
                  if (confirm(`Accept patient and fully admit them into ${bed.name}?`)) {
                    onToggleBed(bed.id, 'occupied', bed.patientName || 'Triage Emergency Patient');
                  } else if (confirm(`Release AI reservation for ${bed.name}?`)) {
                    onToggleBed(bed.id, 'available');
                  }
                }
              }}
            >
              {/* Top Row: Bed Name + Ward Tag */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {bed.name}
                    {isICU && (
                      <span className="text-[9px] font-bold tracking-wider uppercase px-1 py-0.2 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-sm">
                        ICU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{bed.ward}</div>
                </div>
                <div className="text-slate-400 dark:text-slate-500">
                  <BedDouble size={16} />
                </div>
              </div>

              {/* Bottom Row: Patient Name / Action or Status Badge */}
              <div className="mt-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                {bed.status !== 'available' ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                      <UserCheck size={10} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      {bed.patientName || 'Anonymous'}
                    </span>
                    {bed.assignedAt && (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-0.5">
                        <Clock size={8} />
                        {new Date(bed.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 flex items-center gap-1">
                    + Click to Admit
                  </span>
                )}
              </div>

              {/* Status Badge Pin */}
              <div className="absolute -top-2 -right-1">
                {getStatusBadge(bed.status)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40">
          <ShieldAlert className="mx-auto text-slate-400 dark:text-slate-500 mb-2" size={32} />
          <h3 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300">No beds found matching filters</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try switching to "All Wards" or "All Statuses".</p>
        </div>
      )}

      {/* Admission Dialog Modal Overlay */}
      <AnimatePresence>
        {admitBedId && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full overflow-hidden p-6"
            >
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Admit Patient</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Assign a patient name to {beds.find((b) => b.id === admitBedId)?.name} in {beds.find((b) => b.id === admitBedId)?.ward}.
              </p>
              
              <form onSubmit={handleAdmitSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient name..."
                    value={patientNameInput}
                    onChange={(e) => setPatientNameInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:border-blue-500 focus:dark:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAdmitBedId(null);
                      setPatientNameInput('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-md shadow-blue-100/10 dark:shadow-none"
                  >
                    Confirm Admission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
