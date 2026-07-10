export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  slots: string[];
  rating: number;
  status: 'Available' | 'On Duty' | 'Off Duty';
  room: string;
}

export interface Bed {
  id: string;
  name: string; // e.g. "Bed 1"
  ward: string; // e.g. "ICU", "General Ward A", "Cardiology Ward", "Pediatric Ward", "Neurology Ward"
  status: 'available' | 'occupied' | 'reserved';
  patientName?: string;
  assignedAt?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  slot: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface TriageOutput {
  severity: 'Low' | 'Medium' | 'High';
  department: string;
  admissionRequired: boolean;
  reasoning: string;
}

export interface DoctorOutput {
  possibleDiagnoses: string[];
  recommendedTests: string[];
  precautions: string[];
  summary: string;
}

export interface AppointmentOutput {
  availableDoctors: { id: string; name: string; specialty: string; slots: string[] }[];
  selectedDoctor: { id: string; name: string; slot: string } | null;
  appointmentBooked: boolean;
  notes: string;
}

export interface BedOutput {
  bedAllocated: boolean;
  ward: string;
  bedNumber: string;
  message: string;
}

export interface ReminderOutput {
  medications: { name: string; dosage: string; timing: string; frequency: string }[];
  scheduleNotes: string;
}

export interface SupervisorOutput {
  reasoning: string;
  selectedAgents: {
    triage_agent: boolean;
    doctor_agent: boolean;
    appointment_agent: boolean;
    bed_agent: boolean;
    reminder_agent: boolean;
  };
}

export interface TraceStep {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'skipped' | 'failed';
  description: string;
  durationMs?: number;
  output?: any;
}

export interface ChatResponse {
  message: string;
  trace: TraceStep[];
  structuredData: {
    triage?: TriageOutput;
    doctor?: DoctorOutput;
    appointment?: AppointmentOutput;
    bed?: BedOutput;
    reminder?: ReminderOutput;
  };
}
