import React, { useState } from 'react';
import { Send, HeartHandshake, ShieldAlert, AlertTriangle, Baby, Skull, Apple } from 'lucide-react';

interface SymptomInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
  hasApiKey: boolean;
}

const templates = [
  {
    name: "Cardiac emergency",
    icon: <HeartHandshake size={14} className="text-red-500" />,
    text: "I am experiencing severe chest pain that radiates to my left arm, combined with persistent cold sweat and mild breathing difficulty.",
    color: "border-red-100 hover:border-red-400 bg-red-50/20 text-red-700 dark:border-red-900/50 dark:hover:border-red-700 dark:bg-red-950/20 dark:text-red-400"
  },
  {
    name: "Pediatric concern",
    icon: <Baby size={14} className="text-pink-500" />,
    text: "My 3-year-old child has had a high fever of 103°F for the past two days, accompanied by continuous dry coughing and loss of appetite.",
    color: "border-pink-100 hover:border-pink-400 bg-pink-50/20 text-pink-700 dark:border-pink-900/50 dark:hover:border-pink-700 dark:bg-pink-950/20 dark:text-pink-400"
  },
  {
    name: "Orthopedic injury",
    icon: <AlertTriangle size={14} className="text-amber-500" />,
    text: "I had a fall from a bicycle and twisted my left ankle. It is heavily swollen, bruised, and I cannot bear any weight on it.",
    color: "border-amber-100 hover:border-amber-400 bg-amber-50/20 text-amber-700 dark:border-amber-900/50 dark:hover:border-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
  },
  {
    name: "Neurological migraine",
    icon: <Skull size={14} className="text-purple-500" />,
    text: "I have a sudden excruciating headache that feels like intense pressure behind my eyes, along with temporary blind spots and numbness on my left side.",
    color: "border-purple-100 hover:border-purple-400 bg-purple-50/20 text-purple-700 dark:border-purple-900/50 dark:hover:border-purple-700 dark:bg-purple-950/20 dark:text-purple-400"
  },
  {
    name: "Outpatient stomach",
    icon: <Apple size={14} className="text-emerald-500" />,
    text: "I have persistent sharp pain in my lower abdomen for 12 hours, accompanied by severe nausea, shivering, and general fatigue.",
    color: "border-emerald-100 hover:border-emerald-400 bg-emerald-50/20 text-emerald-700 dark:border-emerald-900/50 dark:hover:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
  }
];

export default function SymptomInput({ onSubmit, isProcessing, hasApiKey }: SymptomInputProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSubmit(inputText.trim());
    setInputText('');
  };

  const handleTemplateClick = (text: string) => {
    if (isProcessing) return;
    onSubmit(text);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <h2 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Send className="text-blue-600 dark:text-blue-400" size={20} />
          Symptom Intake Portal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter clinical symptoms or click any clinical scenario to run the multi-agent coordinator.
        </p>
      </div>

      {/* Templates Row */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-2">
          Quick-Triage Scenarios (One-Click Test)
        </span>
        <div className="flex flex-wrap gap-2">
          {templates.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isProcessing}
              onClick={() => handleTemplateClick(tmpl.text)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${tmpl.color} ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {tmpl.icon}
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 relative">
          <textarea
            required
            rows={3}
            disabled={isProcessing}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe symptoms in detail (e.g. My grandmother is experiencing heavy breathing, coughing fits and body aches...)"
            className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all disabled:opacity-50 resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></span>
            <span className="text-slate-500 dark:text-slate-400">
              Agent engine: {hasApiKey ? (
                <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">Gemini 3.5 Live</strong>
              ) : (
                <strong className="text-blue-700 dark:text-blue-400 font-semibold">Simulated Coordinator Mode</strong>
              )}
            </span>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-100 dark:shadow-none"
          >
            Coordinate Agents
            <Send size={12} />
          </button>
        </div>
      </form>
      
      {!hasApiKey && (
        <div className="mt-4 p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-2 text-[10.5px] text-blue-800 dark:text-blue-300 leading-normal">
          <ShieldAlert size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <strong>Interactive Sandbox mode:</strong> No GEMINI_API_KEY detected in Secrets panel. The system is operating in simulated mode. It compiles full traces, schedules appointments and assigns beds matching patient inputs dynamically! Configure your API key to activate Gemini-powered clinical agents.
          </div>
        </div>
      )}
    </div>
  );
}
