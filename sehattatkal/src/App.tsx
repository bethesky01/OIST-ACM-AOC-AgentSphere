import React, { useState, useEffect } from 'react';
import BedGrid from './components/BedGrid';
import TriageFlow from './components/TriageFlow';
import DoctorList from './components/DoctorList';
import SymptomInput from './components/SymptomInput';
import { Bed, Doctor, Appointment, TraceStep, ChatResponse } from './types';
import { 
  Building2, Activity, Heart, ShieldAlert, Sparkles, RefreshCw, 
  Clock, AlertCircle, FileText, CheckCircle2, BedSingle, CalendarDays,
  BadgeAlert, Phone, MapPin, CheckSquare, Settings, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default initial trace steps before any queries are run
const INITIAL_TRACE: TraceStep[] = [
  { id: '1', name: 'Supervisor Agent Delegation', status: 'idle', description: 'Analyze patient symptom query and determine specialist delegation paths.' },
  { id: '2', name: 'Patient Triage Specialist', status: 'idle', description: 'Assess symptom urgency rating (Low/Med/High) and suggested medical ward.' },
  { id: '3', name: 'Doctor Assistant Specialist', status: 'idle', description: 'Synthesize differential diagnostics suspect and suggest lab/clinical tests.' },
  { id: '4', name: 'Appointment Coordinator Specialist', status: 'idle', description: 'Match specialist on-call calendars and reserve physical consulting rooms.' },
  { id: '5', name: 'Bed Allocation Specialist', status: 'idle', description: 'Monitor available ward census and assign emergency bed numbers if required.' },
  { id: '6', name: 'Medication Scheduler Specialist', status: 'idle', description: 'Establish daily morning/night medication routines and precaution reminders.' }
];

export default function App() {
  // State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [trace, setTrace] = useState<TraceStep[]>(INITIAL_TRACE);
  const [structuredData, setStructuredData] = useState<ChatResponse['structuredData']>({});
  const [responseSummary, setResponseSummary] = useState<string>('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'triage' | 'beds' | 'doctors'>('triage');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('2026-07-10 10:25:53'); // Default to target local time

  // Sync theme with HTML document element and local storage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [bedsRes, docsRes, apptsRes, configRes] = await Promise.all([
        fetch('/api/beds'),
        fetch('/api/doctors'),
        fetch('/api/appointments'),
        fetch('/api/config')
      ]);

      const bedsData = await bedsRes.json();
      const docsData = await docsRes.json();
      const apptsData = await apptsRes.json();
      const configData = await configRes.json();

      setBeds(bedsData);
      setDoctors(docsData);
      setAppointments(apptsData);
      setHasApiKey(configData.hasApiKey);
    } catch (err) {
      console.error('Error fetching dashboard states:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Live update clock (simulating live ticking based on mock base time)
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle bed state toggle
  const handleToggleBed = async (id: string, status: Bed['status'], patientName?: string) => {
    try {
      const res = await fetch('/api/beds/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, patientName })
      });
      if (res.ok) {
        await fetchData(); // Reload synchronized states
      }
    } catch (err) {
      console.error('Error toggling bed:', err);
    }
  };

  // Handle reset data
  const handleResetBeds = async () => {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        setTrace(INITIAL_TRACE);
        setResponseSummary('');
        setStructuredData({});
      }
    } catch (err) {
      console.error('Error resetting hospital simulation data:', err);
    }
  };

  // Handle Appointment Status Toggles
  const handleCompleteAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Completed' } : a));
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
  };

  // Trigger Multi-Agent Symptom Triage Execution
  const handleSymptomSubmit = async (symptoms: string) => {
    setIsProcessing(true);
    setResponseSummary('');
    setStructuredData({});
    setActiveTab('triage');

    // 1. Initialize empty running trace on frontend for animated workflow
    const runningTrace = INITIAL_TRACE.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'running' as const : 'idle' as const,
      durationMs: undefined,
      output: undefined
    }));
    setTrace(runningTrace);

    try {
      // 2. Fetch results from backend agent coordinator
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: symptoms })
      });

      if (!res.ok) {
        throw new Error('API server returned error during routing');
      }

      const data: ChatResponse = await res.json();

      // 3. Orchestrate progressive frontend "step-by-step" tracer animation!
      // This loops through each step sequentially to simulate active agent thinking cycles
      for (let i = 0; i < runningTrace.length; i++) {
        // Set current step to running
        setTrace(prev => prev.map((s, idx) => {
          if (idx === i) return { ...s, status: 'running' };
          return s;
        }));

        // Hold running state momentarily to let user witness the multi-agent choreography
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mark completed/skipped with actual data
        const backendStep = data.trace[i];
        setTrace(prev => prev.map((s, idx) => {
          if (idx === i) {
            return {
              ...s,
              status: backendStep.status,
              durationMs: backendStep.durationMs,
              output: backendStep.output
            };
          }
          return s;
        }));
      }

      // 4. Update core variables, summary, and sync data states
      setResponseSummary(data.message);
      setStructuredData(data.structuredData);
      
      // Reload beds and appointments from DB to capture assignments made by the AI
      await fetchData();

    } catch (err: any) {
      console.error('Error running symptoms coordinator:', err);
      setTrace(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'failed' as const } : s));
      setResponseSummary(`**Clinical Coordinator Alarm**: Unable to complete AI multi-agent orchestration. error: ${err.message || 'Network Timeout'}. Please check if server is active.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col selection:bg-blue-100 dark:selection:bg-blue-950 selection:text-blue-900 dark:selection:text-blue-300 transition-colors duration-200">
      
      {/* GLOBAL TOP NAVIGATION PANEL */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
              <Building2 size={20} className="text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-base tracking-tight text-slate-800 dark:text-slate-100">
                SehatTatkal
              </h1>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950 border border-blue-100/50 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                Multi-Agent v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide flex items-center gap-1.5">
              <span>Healthcare Category</span>
              <span>•</span>
              <span>Hackathon Prototype Dashboard</span>
            </p>
          </div>
        </div>

        {/* Server status & clocks */}
        <div className="flex items-center gap-3.5 text-xs">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">Live Ward Clock</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
              <Clock size={11} className="text-blue-500 animate-pulse" />
              {currentTime}
            </span>
          </div>
          
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <button
            onClick={handleResetBeds}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
            title="Reset Simulation State"
          >
            <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID CONTENT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & COORDINATOR COHESIVE REPORT CARD (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* 1. Intake Portal Component */}
          <SymptomInput 
            onSubmit={handleSymptomSubmit}
            isProcessing={isProcessing}
            hasApiKey={hasApiKey}
          />

          {/* 2. Consolidated AI Coordinator Results Card */}
          <AnimatePresence>
            {(responseSummary || isProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Card Title Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-800 dark:bg-slate-950 text-white dark:text-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-400 shrink-0" size={18} />
                    <span className="font-display font-bold text-sm">Clinical Coordination Report</span>
                  </div>
                  {isProcessing ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {isProcessing && !responseSummary ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-slate-850"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Orchestrating Intelligent Agents</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Supervisor delegation paths active. Testing schedules...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Clinical narrative summary */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {responseSummary.replace(/\*\*/g, '')}
                      </div>

                      {/* Direct action links/stats based on structured outcomes */}
                      {structuredData.triage && (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Triage Dept</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{structuredData.triage.department}</span>
                          </div>
                          <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase">Urgency</span>
                            <span className={`font-bold ${
                              structuredData.triage.severity === 'High' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>{structuredData.triage.severity}</span>
                          </div>
                        </div>
                      )}

                      {/* Diagnostic suggestions block */}
                      {structuredData.doctor && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Diagnostics Suggested</span>
                          <div className="flex flex-wrap gap-1">
                            {structuredData.doctor.recommendedTests.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded text-[10px] font-mono font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Emergency Bed Booking Pin */}
                      {structuredData.bed?.bedAllocated && (
                        <div 
                          onClick={() => setActiveTab('beds')}
                          className="bg-cyan-50 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-900/40 p-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <BedSingle className="text-cyan-600 dark:text-cyan-450" size={14} />
                            <div className="text-[11px]">
                              <span className="font-bold">Bed Reserved:</span> {structuredData.bed.bedNumber} ({structuredData.bed.ward})
                            </div>
                          </div>
                          <span className="text-[9px] bg-cyan-600 dark:bg-cyan-700 text-white font-mono font-bold px-1.5 py-0.2 rounded">VIEW MAP</span>
                        </div>
                      )}

                      {/* Outpatient doctor consult booking */}
                      {structuredData.appointment?.selectedDoctor && (
                        <div 
                          onClick={() => setActiveTab('doctors')}
                          className="bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40 p-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-amber-600 dark:text-amber-450" size={14} />
                            <div className="text-[11px]">
                              <span className="font-bold">Roster Booked:</span> {structuredData.appointment.selectedDoctor.name} ({structuredData.appointment.selectedDoctor.slot})
                            </div>
                          </div>
                          <span className="text-[9px] bg-amber-600 dark:bg-amber-700 text-white font-mono font-bold px-1.5 py-0.2 rounded">DIARY</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick Help Contacts Box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-3xs text-xs space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Phone className="text-slate-400 dark:text-slate-500" size={14} />
              Hospital Emergency Helpdesk
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              If symptoms are acute, or you feel unable to cope, please dial emergency lines immediately.
            </p>
            <div className="pt-1 flex items-center gap-4 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>ER: 911 / 108</span>
              </div>
              <div>desk: +1 (555) AI-CLINIC</div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MULTI-TAB WORKSPACE (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Workspace Tabs Navigation */}
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs w-full sm:w-max">
            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'triage'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Activity size={14} />
              Triage AI Workflow
            </button>
            <button
              onClick={() => setActiveTab('beds')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'beds'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BedSingle size={14} />
              Bed Availability Board
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays size={14} />
              Physician Schedules
            </button>
          </div>

          {/* Active Tab View Panels */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'triage' && (
                <motion.div
                  key="triage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <TriageFlow 
                    trace={trace}
                    structuredData={structuredData}
                    isProcessing={isProcessing}
                  />
                </motion.div>
              )}

              {activeTab === 'beds' && (
                <motion.div
                  key="beds"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <BedGrid 
                    beds={beds}
                    onToggleBed={handleToggleBed}
                    onResetBeds={handleResetBeds}
                    loading={loadingConfig}
                  />
                </motion.div>
              )}

              {activeTab === 'doctors' && (
                <motion.div
                  key="doctors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <DoctorList 
                    doctors={doctors}
                    appointments={appointments}
                    onCompleteAppointment={handleCompleteAppointment}
                    onCancelAppointment={handleCancelAppointment}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>

      {/* FOOTER COOPERATIVE CREDITS */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-500 mt-12 transition-colors duration-200">
        <p>© 2026 SehatTatkal • Prototype Hackathon System • Authorized Clinic Deployment Area</p>
      </footer>

    </div>
  );
}
