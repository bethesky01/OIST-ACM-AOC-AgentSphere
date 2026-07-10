import React from 'react';
import { Doctor, Appointment } from '../types';
import { User, Stethoscope, Star, DoorOpen, BadgeCheck, CheckCircle, XCircle, Clock, Calendar, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DoctorListProps {
  doctors: Doctor[];
  appointments: Appointment[];
  onCompleteAppointment?: (id: string) => void;
  onCancelAppointment?: (id: string) => void;
}

export default function DoctorList({ doctors, appointments, onCompleteAppointment, onCancelAppointment }: DoctorListProps) {
  
  const getStatusStyle = (status: Doctor['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-850';
      case 'On Duty':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-850';
      case 'Off Duty':
        return 'bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getAppointmentStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Scheduled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-md">
            <CheckCircle size={10} />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-md">
            <XCircle size={10} />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Doctors Availability List */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <h2 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="text-blue-600 dark:text-blue-400" size={22} />
            On-Call Physicians List
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time tracking of ward doctor availability, on-duty rotas, and cabin locations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div 
              key={doc.id} 
              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:bg-slate-50/20 dark:hover:bg-slate-950/10 flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                      {doc.name.split(' ')[1]?.substring(0, 2).toUpperCase() || 'DR'}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        {doc.name}
                        {doc.rating >= 4.8 && (
                          <BadgeCheck size={14} className="text-blue-500 shrink-0" title="Highly Rated Specialist" />
                        )}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800/50 block mt-1 w-max">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusStyle(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1 font-medium">
                    <DoorOpen size={12} className="text-slate-400 dark:text-slate-500" />
                    <span>Location: <strong>{doc.room}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 justify-end">
                    <Star size={12} className="fill-amber-400 dark:fill-amber-550 stroke-amber-500" />
                    <span>{doc.rating} / 5.0 Rating</span>
                  </div>
                </div>
              </div>

              {/* Slots row */}
              <div className="mt-4">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1.5">Today's Open Slots</span>
                <div className="flex flex-wrap gap-1">
                  {doc.slots.map((slot, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800"
                    >
                      {slot}
                    </span>
                  ))}
                  {doc.slots.length === 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">No slots available</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booked Appointments Queue List */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h2 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="text-blue-600 dark:text-blue-400" size={22} />
              Scheduled Consultation Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Appointments scheduled dynamically by the coordinator.
            </p>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {appointments.map((appt) => (
              <div 
                key={appt.id} 
                className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900 shadow-3xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {appt.patientName}
                  </div>
                  {getAppointmentStatusBadge(appt.status)}
                </div>

                <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-350 flex flex-col gap-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Consultant:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{appt.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Specialty:</span>
                    <span className="text-slate-700 dark:text-slate-300">{appt.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Scheduled Slot:</span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{appt.slot}</span>
                  </div>
                </div>

                {appt.status === 'Scheduled' && (
                  <div className="flex justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                       onClick={() => onCancelAppointment?.(appt.id)}
                      className="px-2 py-1 rounded text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => onCompleteAppointment?.(appt.id)}
                      className="px-2 py-1 rounded text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                    >
                      Complete Session
                    </button>
                  </div>
                )}
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <HelpCircle size={24} className="mx-auto mb-1.5 text-slate-300 dark:text-slate-750" />
                <p className="text-xs">No current appointments booked today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Informative Footer */}
        <div className="mt-6 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-[10px] text-blue-800 dark:text-blue-400 leading-relaxed">
          <strong>Coordinator Sync Status</strong>: As patient triages indicate admission or out-patient slots, the Coordinator books suitable appointments, syncing calendars in real-time.
        </div>

      </div>

    </div>
  );
}
