import React, { useState } from 'react';
import { TraceStep, ChatResponse } from '../types';
import { 
  Bot, CheckCircle2, Circle, AlertCircle, Play, ChevronRight, ChevronDown, 
  Activity, Sparkles, AlertTriangle, ShieldCheck, CalendarRange, Clock, BedSingle, Pill 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TriageFlowProps {
  trace: TraceStep[];
  structuredData: ChatResponse['structuredData'];
  isProcessing: boolean;
}

export default function TriageFlow({ trace, structuredData, isProcessing }: TriageFlowProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>('1');

  const getStepIcon = (name: string, status: TraceStep['status']) => {
    if (status === 'running') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800 shadow-[0_0_12px_rgba(59,130,246,0.3)] animate-pulse">
          <Activity size={16} className="animate-spin" />
        </div>
      );
    }
    if (status === 'completed') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={16} />
        </div>
      );
    }
    if (status === 'skipped') {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
          <Circle size={14} className="stroke-dasharray-4" />
        </div>
      );
    }
    if (status === 'failed') {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
          <AlertCircle size={16} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-800">
        <Circle size={12} />
      </div>
    );
  };

  const getAgentHeaderIcon = (name: string) => {
    if (name.includes('Supervisor')) return <Bot className="text-purple-500 dark:text-purple-400" size={18} />;
    if (name.includes('Triage')) return <ShieldCheck className="text-blue-600 dark:text-blue-400" size={18} />;
    if (name.includes('Doctor')) return <Activity className="text-rose-500 dark:text-rose-400" size={18} />;
    if (name.includes('Appointment')) return <CalendarRange className="text-amber-500 dark:text-amber-400" size={18} />;
    if (name.includes('Bed')) return <BedSingle className="text-cyan-500 dark:text-cyan-400" size={18} />;
    return <Pill className="text-emerald-500 dark:text-emerald-400" size={18} />;
  };

  const getSeverityBadge = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'High':
        return <span className="px-2 py-0.5 text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md">High Severity</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded-md">Medium Severity</span>;
      case 'Low':
        return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-md">Low Severity</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
            Patient Triage & Agent Workflow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time visual tracer mapping multi-agent clinical coordination steps.
          </p>
        </div>
        {isProcessing && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-lg animate-pulse-slow">
            <Activity className="w-3 h-3 animate-spin" />
            Coordinating...
          </div>
        )}
      </div>

      {/* Main Flow Timeline */}
      <div className="relative flex-1 space-y-4 overflow-y-auto max-h-[640px] pr-2">
        {/* Background connector bar line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>

        {trace.map((step, idx) => {
          const isOpen = expandedStep === step.id;
          const hasOutput = step.output && Object.keys(step.output).length > 0;
          const isCurrentActive = step.status === 'running';

          return (
            <div 
              key={step.id} 
              className={`border rounded-xl transition-all duration-300 relative ${
                isCurrentActive 
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50/10 dark:bg-blue-950/10 shadow-[0_4px_12px_rgba(59,130,246,0.06)]' 
                  : isOpen 
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Step Header Block */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedStep(isOpen ? null : step.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Step status icon */}
                  {getStepIcon(step.name, step.status)}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                        {step.name}
                      </span>
                      {step.status === 'skipped' && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.2 rounded-sm font-medium">
                          Skipped
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[280px] sm:max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {step.durationMs && (
                    <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded-md">
                      {step.durationMs}ms
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-500" />
                  )}
                </div>
              </div>

              {/* Collapsible Step Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20">
                      {/* Standard Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                        {step.description} This agent completes its assigned check, analyzes parameters and registers clinical outcomes into the central dashboard.
                      </p>

                      {/* No Output Case */}
                      {!hasOutput && step.status !== 'running' && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 p-3 rounded-lg text-center font-medium">
                          No diagnostic output generated. Step was {step.status}.
                        </div>
                      )}

                      {/* Running Agent Placeholder */}
                      {step.status === 'running' && (
                        <div className="flex items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono animate-pulse">
                            Processing query through Gemini medical models...
                          </span>
                        </div>
                      )}

                      {/* Structured Agent Visualizations */}
                      {hasOutput && step.status === 'completed' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs text-slate-800 dark:text-slate-100 text-xs">
                          
                          {/* 1. SUPERVISOR AGENT VISUALIZATION */}
                          {step.name.includes('Supervisor') && step.output && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400">
                                {getAgentHeaderIcon(step.name)}
                                <span>Supervisor Decision Output</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 bg-purple-50/10 dark:bg-purple-950/10 border border-purple-100/30 dark:border-purple-900/30 p-2.5 rounded-lg leading-relaxed">
                                <strong>Reasoning Matrix:</strong> {step.output.reasoning}
                              </p>
                              <div className="pt-1">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1.5">Activated Pipelines</span>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(step.output.selectedAgents || {}).map(([key, value]) => (
                                    <span 
                                      key={key} 
                                      className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${
                                        value 
                                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                                          : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                                      }`}
                                    >
                                      {key.replace('_', ' ').toUpperCase()}: {value ? 'ON' : 'OFF'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. PATIENT TRIAGE VISUALIZATION */}
                          {step.name.includes('Triage') && step.output && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                                  {getAgentHeaderIcon(step.name)}
                                  <span>Triage Assessment</span>
                                </div>
                                {getSeverityBadge(step.output.severity)}
                              </div>
                              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 font-medium">
                                <div>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Department Target</span>
                                  <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">{step.output.department}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Admission Required</span>
                                  <span className={`text-xs font-bold ${step.output.admissionRequired ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {step.output.admissionRequired ? 'YES - Bed Allocated' : 'NO - Outpatient Review'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                                <strong>Clinical Justification:</strong> {step.output.reasoning}
                              </p>
                            </div>
                          )}

                          {/* 3. DOCTOR ASSISTANT VISUALIZATION */}
                          {step.name.includes('Doctor') && step.output && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                                {getAgentHeaderIcon(step.name)}
                                <span>Clinical Diagnostics Assistant</span>
                              </div>
                              
                              <p className="text-slate-600 dark:text-slate-300 bg-rose-50/5 dark:bg-rose-950/5 border border-rose-100/20 dark:border-rose-900/20 p-2.5 rounded-lg leading-relaxed">
                                {step.output.summary}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Differential Suspects</span>
                                  <ul className="space-y-1">
                                    {(step.output.possibleDiagnoses || []).map((diag: string, i: number) => (
                                      <li key={i} className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                        {diag}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Recommended Laboratory Tests</span>
                                  <ul className="space-y-1">
                                    {(step.output.recommendedTests || []).map((test: string, i: number) => (
                                      <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-[10.5px]">
                                        <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                        {test}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <AlertTriangle size={11} />
                                  Crucial Safety Precautions
                                </span>
                                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                                  {(step.output.precautions || []).map((prec: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-amber-500 font-bold shrink-0">•</span>
                                      <span>{prec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* 4. APPOINTMENT COORDINATOR VISUALIZATION */}
                          {step.name.includes('Appointment') && step.output && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                                  {getAgentHeaderIcon(step.name)}
                                  <span>Consultation Booking</span>
                                </div>
                                {step.output.appointmentBooked && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-md">
                                    Appointment Scheduled
                                  </span>
                                )}
                              </div>

                              {step.output.selectedDoctor ? (
                                <div className="bg-amber-50/10 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/50 p-3 rounded-lg flex items-center justify-between">
                                  <div className="space-y-1">
                                    <div className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                                      {step.output.selectedDoctor.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                      <Clock size={10} />
                                      Selected Slot: {step.output.selectedDoctor.slot}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded font-mono">
                                      CONFIRMED
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-500 italic">No direct appointment booked. Please contact physical helpdesk.</p>
                              )}

                              <p className="text-slate-600 dark:text-slate-300 font-medium">
                                <strong>Coordinator Notes:</strong> {step.output.notes}
                              </p>
                            </div>
                          )}

                          {/* 5. BED ALLOCATION VISUALIZATION */}
                          {step.name.includes('Bed') && step.output && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-cyan-700 dark:text-cyan-400">
                                  {getAgentHeaderIcon(step.name)}
                                  <span>Bed Allocation Database Registry</span>
                                </div>
                                {step.output.bedAllocated && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-950 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900 rounded-md">
                                    Bed Allocated (Reserved)
                                  </span>
                                )}
                              </div>

                              {step.output.bedAllocated ? (
                                <div className="grid grid-cols-2 gap-3 bg-cyan-50/5 dark:bg-cyan-950/10 border border-cyan-100/30 dark:border-cyan-900/30 p-3 rounded-lg">
                                  <div>
                                    <span className="text-[9px] text-cyan-700 dark:text-cyan-400 block uppercase font-bold">Assigned Ward</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.output.ward}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-cyan-700 dark:text-cyan-400 block uppercase font-bold">Bed Registry ID</span>
                                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{step.output.bedNumber}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-slate-500 italic">
                                  Bed allocation skipped. No acute emergency admission needed.
                                </div>
                              )}
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {step.output.message}
                              </p>
                            </div>
                          )}

                          {/* 6. MEDICATION SCHEDULER VISUALIZATION */}
                          {step.name.includes('Medication') && step.output && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                                {getAgentHeaderIcon(step.name)}
                                <span>Medication Schedule & Reminders</span>
                              </div>

                              {step.output.medications && step.output.medications.length > 0 ? (
                                <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                        <th className="p-2">Medicine</th>
                                        <th className="p-2">Dosage</th>
                                        <th className="p-2">Timing</th>
                                        <th className="p-2">Frequency</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {step.output.medications.map((med: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50/10 dark:hover:bg-slate-950/20">
                                          <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{med.name}</td>
                                          <td className="p-2 text-slate-600 dark:text-slate-350 font-mono text-[11px]">{med.dosage}</td>
                                          <td className="p-2 text-slate-600 dark:text-slate-350">{med.timing}</td>
                                          <td className="p-2 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/30 font-semibold px-1 py-0.5 rounded">{med.frequency}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-slate-500 italic">No specific medications recommended at this phase.</p>
                              )}

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350">
                                <strong>Safety Scheduling Guidelines:</strong> {step.output.scheduleNotes}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
