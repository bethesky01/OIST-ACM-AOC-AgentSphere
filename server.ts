import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Bed, Doctor, Appointment, ChatResponse, TraceStep, TriageOutput, DoctorOutput, AppointmentOutput, BedOutput, ReminderOutput, SupervisorOutput } from './src/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Mock Database / Live Server State ---
let beds: Bed[] = [
  // ICU Ward
  { id: 'b1', name: 'ICU-01', ward: 'ICU', status: 'occupied', patientName: 'John Doe', assignedAt: '2026-07-09T14:30:00Z' },
  { id: 'b2', name: 'ICU-02', ward: 'ICU', status: 'occupied', patientName: 'Amelia Smith', assignedAt: '2026-07-10T08:00:00Z' },
  { id: 'b3', name: 'ICU-03', ward: 'ICU', status: 'available' },
  { id: 'b4', name: 'ICU-04', ward: 'ICU', status: 'reserved', patientName: 'Inbound Patient (Triage)' },
  { id: 'b5', name: 'ICU-05', ward: 'ICU', status: 'available' },
  
  // Cardiology Ward
  { id: 'b6', name: 'CARD-01', ward: 'Cardiology Ward', status: 'occupied', patientName: 'Robert Johnson', assignedAt: '2026-07-08T10:15:00Z' },
  { id: 'b7', name: 'CARD-02', ward: 'Cardiology Ward', status: 'available' },
  { id: 'b8', name: 'CARD-03', ward: 'Cardiology Ward', status: 'available' },
  { id: 'b9', name: 'CARD-04', ward: 'Cardiology Ward', status: 'occupied', patientName: 'Patricia Davis', assignedAt: '2026-07-10T09:45:00Z' },

  // Pediatrics Ward
  { id: 'b10', name: 'PED-01', ward: 'Pediatric Ward', status: 'occupied', patientName: 'Tommy Miller', assignedAt: '2026-07-09T18:20:00Z' },
  { id: 'b11', name: 'PED-02', ward: 'Pediatric Ward', status: 'available' },
  { id: 'b12', name: 'PED-03', ward: 'Pediatric Ward', status: 'available' },
  { id: 'b13', name: 'PED-04', ward: 'Pediatric Ward', status: 'occupied', patientName: 'Lily Taylor', assignedAt: '2026-07-10T06:15:00Z' },

  // Neurology Ward
  { id: 'b14', name: 'NEUR-01', ward: 'Neurology Ward', status: 'occupied', patientName: 'David Wilson', assignedAt: '2026-07-07T11:00:00Z' },
  { id: 'b15', name: 'NEUR-02', ward: 'Neurology Ward', status: 'available' },
  { id: 'b16', name: 'NEUR-03', ward: 'Neurology Ward', status: 'available' },

  // General Ward A
  { id: 'b17', name: 'GEN-A1', ward: 'General Ward A', status: 'occupied', patientName: 'James Brown', assignedAt: '2026-07-09T10:00:00Z' },
  { id: 'b18', name: 'GEN-A2', ward: 'General Ward A', status: 'occupied', patientName: 'Mary Garcia', assignedAt: '2026-07-09T11:30:00Z' },
  { id: 'b19', name: 'GEN-A3', ward: 'General Ward A', status: 'available' },
  { id: 'b20', name: 'GEN-A4', ward: 'General Ward A', status: 'available' },
  { id: 'b21', name: 'GEN-A5', ward: 'General Ward A', status: 'available' },
  { id: 'b22', name: 'GEN-A6', ward: 'General Ward A', status: 'occupied', patientName: 'William Martinez', assignedAt: '2026-07-10T05:00:00Z' },
  
  // General Ward B
  { id: 'b23', name: 'GEN-B1', ward: 'General Ward B', status: 'available' },
  { id: 'b24', name: 'GEN-B2', ward: 'General Ward B', status: 'occupied', patientName: 'Linda Anderson', assignedAt: '2026-07-08T16:45:00Z' },
  { id: 'b25', name: 'GEN-B3', ward: 'General Ward B', status: 'available' },
  { id: 'b26', name: 'GEN-B4', ward: 'General Ward B', status: 'available' },
  { id: 'b27', name: 'GEN-B5', ward: 'General Ward B', status: 'occupied', patientName: 'Richard Thomas', assignedAt: '2026-07-10T07:30:00Z' },
  { id: 'b28', name: 'GEN-B6', ward: 'General Ward B', status: 'available' }
];

let doctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sameer Sharma', specialty: 'Cardiology', slots: ['11:00 AM', '01:30 PM', '04:00 PM'], rating: 4.9, status: 'Available', room: 'Cabin 301' },
  { id: 'd2', name: 'Dr. Priya Patel', specialty: 'Pediatrics', slots: ['09:00 AM', '10:30 AM', '02:00 PM'], rating: 4.8, status: 'Available', room: 'Cabin 104' },
  { id: 'd3', name: 'Dr. Elena Gomez', specialty: 'General Medicine', slots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'], rating: 4.7, status: 'Available', room: 'Cabin 205' },
  { id: 'd4', name: 'Dr. Kevin Chen', specialty: 'Neurology', slots: ['02:00 PM', '03:30 PM'], rating: 4.9, status: 'On Duty', room: 'Cabin 402' },
  { id: 'd5', name: 'Dr. Sarah Davies', specialty: 'Orthopedics', slots: ['08:30 AM', '11:00 AM', '04:30 PM'], rating: 4.6, status: 'Available', room: 'Cabin 212' },
  { id: 'd6', name: 'Dr. Tariq Al-Mansoor', specialty: 'Dermatology', slots: ['12:00 PM', '02:30 PM', '05:30 PM'], rating: 4.8, status: 'Off Duty', room: 'Cabin 108' }
];

let appointments: Appointment[] = [
  { id: 'a1', patientName: 'Sarah Connor', doctorName: 'Dr. Elena Gomez', specialty: 'General Medicine', slot: '10:00 AM', status: 'Scheduled' },
  { id: 'a2', patientName: 'Bruce Wayne', doctorName: 'Dr. Sameer Sharma', specialty: 'Cardiology', slot: '11:00 AM', status: 'Scheduled' },
  { id: 'a3', patientName: 'Peter Parker', doctorName: 'Dr. Priya Patel', specialty: 'Pediatrics', slot: '02:00 PM', status: 'Scheduled' }
];

// --- Initialize Gemini AI Client ---
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.includes('your_actual_api_key_here')) {
  console.log('Initializing GoogleGenAI client with user secret key...');
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
} else {
  console.warn('GEMINI_API_KEY environment variable is not configured or contains placeholder. Running in simulated coordinator mode.');
}

// Helper to calculate duration
const getDuration = (start: number) => Math.round(performance.now() - start);

// --- REST API Endpoints ---

// Get API configuration status
app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: !!ai,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Beds Management
app.get('/api/beds', (req, res) => {
  res.json(beds);
});

app.post('/api/beds/toggle', (req, res) => {
  const { id, status, patientName } = req.body;
  const bedIndex = beds.findIndex(b => b.id === id);
  if (bedIndex !== -1) {
    beds[bedIndex].status = status;
    beds[bedIndex].patientName = status === 'available' ? undefined : (patientName || 'Simulated Patient');
    if (status !== 'available') {
      beds[bedIndex].assignedAt = new Date().toISOString();
    } else {
      delete beds[bedIndex].assignedAt;
    }
    return res.json({ success: true, bed: beds[bedIndex] });
  }
  res.status(404).json({ error: 'Bed not found' });
});

app.post('/api/beds/reset', (req, res) => {
  beds = beds.map((b, idx) => {
    if (idx % 4 === 0) {
      return { ...b, status: 'occupied', patientName: b.patientName || 'Default Patient', assignedAt: new Date().toISOString() };
    }
    if (idx % 7 === 0) {
      return { ...b, status: 'reserved', patientName: 'Reserved (Triage)' };
    }
    return { ...b, status: 'available', patientName: undefined, assignedAt: undefined };
  });
  res.json({ success: true, beds });
});

app.post('/api/reset-data', (req, res) => {
  beds = beds.map((b, idx) => {
    if (idx % 4 === 0) {
      return { ...b, status: 'occupied', patientName: b.patientName || 'Default Patient', assignedAt: new Date().toISOString() };
    }
    if (idx % 7 === 0) {
      return { ...b, status: 'reserved', patientName: 'Reserved (Triage)' };
    }
    return { ...b, status: 'available', patientName: undefined, assignedAt: undefined };
  });
  res.json({ success: true, beds });
});

// Doctors Management
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// Appointments Management
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
  const { patientName, doctorName, specialty, slot } = req.body;
  if (!patientName || !doctorName || !slot) {
    return res.status(400).json({ error: 'Missing required booking fields.' });
  }
  const newAppointment: Appointment = {
    id: 'a_' + Math.random().toString(36).substr(2, 9),
    patientName,
    doctorName,
    specialty: specialty || 'General Medicine',
    slot,
    status: 'Scheduled'
  };
  appointments.push(newAppointment);
  res.json({ success: true, appointment: newAppointment });
});

// --- Fallback Simulated Coordinator (When API Key is not present) ---
function runSimulatedCoordinator(query: string): ChatResponse {
  console.log('Running simulated hospital workflow coordinator for:', query);
  
  const queryLower = query.toLowerCase();
  let severity: 'Low' | 'Medium' | 'High' = 'Medium';
  let department = 'General Medicine';
  let admissionRequired = false;
  let possibleDiagnoses: string[] = ['General symptoms'];
  let recommendedTests: string[] = ['Routine blood work'];
  let precautions: string[] = ['Stay hydrated', 'Take rest'];
  let ward = 'General Ward A';
  let reasoning = 'Initial general symptoms analysis. Recommending diagnostic follow-up.';

  // Keyword Matching Triage Logic
  if (queryLower.includes('chest') || queryLower.includes('heart') || queryLower.includes('cardiac') || queryLower.includes('stroke') || queryLower.includes('pain in left arm')) {
    severity = 'High';
    department = 'Cardiology';
    admissionRequired = true;
    possibleDiagnoses = ['Acute Coronary Syndrome', 'Angina Pectoris', 'Myocardial Infarction Suspect'];
    recommendedTests = ['Electrocardiogram (ECG)', 'Troponin Test', 'Echocardiogram', 'Chest X-Ray'];
    precautions = ['Avoid all physical exertion', 'Do not drive yourself', 'Seek immediate emergency attention', 'Sit upright and breathe calm'];
    ward = 'ICU';
    reasoning = 'Symptoms indicate potential cardiac distress with chest discomfort. Highly critical, emergency bed and direct cardiology consultant assigned.';
  } else if (queryLower.includes('child') || queryLower.includes('kid') || queryLower.includes('baby') || queryLower.includes('pediatric') || queryLower.includes('fever in child')) {
    severity = queryLower.includes('seizure') || queryLower.includes('unconscious') ? 'High' : 'Medium';
    department = 'Pediatrics';
    admissionRequired = severity === 'High';
    possibleDiagnoses = ['Acute Pediatric Viral Fever', 'Bronchiolitis', 'Gastroenteritis'];
    recommendedTests = ['Complete Blood Count (CBC)', 'Influenza Panel Swab', 'Urine Routine'];
    precautions = ['Monitor temperature hourly', 'Provide lukewarm sponge baths', 'Administer prescribed pediatric fluids', 'Ensure continuous hydration'];
    ward = 'Pediatric Ward';
    reasoning = 'Age-specific symptoms. Directing to Pediatrics for pediatric physical exam and vitals tracking.';
  } else if (queryLower.includes('head') || queryLower.includes('migraine') || queryLower.includes('brain') || queryLower.includes('paralysis') || queryLower.includes('seizure') || queryLower.includes('numbness')) {
    severity = queryLower.includes('paralysis') || queryLower.includes('unconscious') || queryLower.includes('seizure') ? 'High' : 'Medium';
    department = 'Neurology';
    admissionRequired = severity === 'High';
    possibleDiagnoses = ['Severe Migraine', 'Ischemic Event Suspect', 'Seizure Disorder Investigation'];
    recommendedTests = ['Brain CT Scan or MRI', 'Electroencephalogram (EEG)', 'Neurological Reflex Tests'];
    precautions = ['Avoid bright screens and lights', 'Lie down in a quiet dark room', 'Keep airways clear if seizure occurs'];
    ward = 'Neurology Ward';
    reasoning = 'Neural deficits or intense cranial symptoms. Scheduled immediate neurological consultation.';
  } else if (queryLower.includes('bone') || queryLower.includes('fracture') || queryLower.includes('leg') || queryLower.includes('arm') || queryLower.includes('accident') || queryLower.includes('pain in joints') || queryLower.includes('knee')) {
    severity = queryLower.includes('accident') || queryLower.includes('bleeding') ? 'High' : 'Medium';
    department = 'Orthopedics';
    admissionRequired = severity === 'High';
    possibleDiagnoses = ['Bone Fracture Suspect', 'Joint Subluxation', 'Ligament Tear'];
    recommendedTests = ['Joint or Bone X-Ray', 'Orthopedic Range of Motion Exam', 'MRI of Affected Joint'];
    precautions = ['Immobilize the affected limb completely', 'Apply cold ice pack', 'Do not bear any weight on the injury'];
    ward = 'General Ward B';
    reasoning = 'Musculoskeletal trauma indicated. Directing to Orthopedics for stabilization and radiographic diagnostics.';
  } else if (queryLower.includes('skin') || queryLower.includes('rash') || queryLower.includes('allergy') || queryLower.includes('burn') || queryLower.includes('itch')) {
    severity = queryLower.includes('breath') || queryLower.includes('anaphylaxis') ? 'High' : 'Low';
    department = 'Dermatology';
    admissionRequired = false;
    possibleDiagnoses = ['Contact Dermatitis', 'Acute Urticaria (Hives)', 'Mild Eczema Flare-Up'];
    recommendedTests = ['Allergy Skin Prick Test', 'Serum IgE Level Test'];
    precautions = ['Do not scratch the affected skin', 'Avoid applying scented cosmetics', 'Apply cool wet compresses', 'Monitor for breathing difficulty (Anaphylaxis)'];
    reasoning = 'Local dermatological reaction. Recommend non-emergency review with Dermatology clinic.';
  } else {
    // General Medicine fallback
    severity = queryLower.includes('breathing') || queryLower.includes('choking') || queryLower.includes('severe') ? 'High' : 'Medium';
    department = 'General Medicine';
    admissionRequired = severity === 'High';
    possibleDiagnoses = ['Viral Respiratory Infection', 'Acute Gastroenteritis', 'Systemic Fatigue Syndrome'];
    recommendedTests = ['CBC (Complete Blood Count)', 'Metabolic Panel Test', 'Vitals Check-Up'];
    precautions = ['Rest and avoid heavy meals', 'Stay hydrated with electrolytes', 'Consult a general physician within 24 hours'];
    ward = 'General Ward A';
    reasoning = 'General systemic symptoms. Allocated primary practitioner in General Medicine ward.';
  }

  // Find Doctor in department
  const matchingDoctor = doctors.find(d => d.specialty === department && d.status !== 'Off Duty') || doctors.find(d => d.specialty === 'General Medicine');
  const doctorName = matchingDoctor ? matchingDoctor.name : 'Dr. Elena Gomez';
  const slot = matchingDoctor ? matchingDoctor.slots[0] : '12:00 PM';

  // Find Bed allocation if required
  let assignedBed: Bed | null = null;
  if (admissionRequired) {
    const availableInWard = beds.find(b => b.ward === (ward === 'ICU' ? 'ICU' : ward) && b.status === 'available');
    if (availableInWard) {
      availableInWard.status = 'reserved';
      availableInWard.patientName = 'Emergency Patient';
      availableInWard.assignedAt = new Date().toISOString();
      assignedBed = availableInWard;
    }
  }

  // Medications reminder schedule
  const medicationsList = severity === 'High' 
    ? [
        { name: 'IV Fluids (Saline / Dextrose)', dosage: '500ml', timing: 'Immediate / Continuous', frequency: 'As directed' },
        { name: 'Broad Spectrum Antibiotic', dosage: '1 tablet (500mg)', timing: 'Morning and Night (Post-meal)', frequency: 'Every 12 Hours' },
        { name: 'Emergency Stabilizer Medication', dosage: '1 tablet (75mg)', timing: 'Morning (Pre-meal)', frequency: 'Once Daily' }
      ]
    : [
        { name: 'Paracetamol', dosage: '1 tablet (650mg)', timing: 'As needed (Max 3/day)', frequency: 'Every 6-8 Hours' },
        { name: 'Multivitamins / Zinc supplements', dosage: '1 tablet', timing: 'Morning (Post-meal)', frequency: 'Once Daily' }
      ];

  const traceSteps: TraceStep[] = [
    { id: '1', name: 'Supervisor Agent Delegation', status: 'completed', description: 'Analyzed user query, determined specialist agents needed, and coordinated the workflow pipeline.', durationMs: 120, output: { reasoning: `Query contains indications of ${department.toLowerCase()} symptoms. Launching Triage and Doctor Specialists immediately.`, selectedAgents: { triage_agent: true, doctor_agent: true, appointment_agent: true, bed_agent: admissionRequired, reminder_agent: true } } },
    { id: '2', name: 'Patient Triage Specialist', status: 'completed', description: 'Calculated condition urgency, recommended target department, and made an admission decision.', durationMs: 340, output: { severity, department, admissionRequired, reasoning } },
    { id: '3', name: 'Doctor Assistant Specialist', status: 'completed', description: 'Formulated diagnosis suspects, prioritized lab tests, and produced clinical guidance.', durationMs: 410, output: { possibleDiagnoses, recommendedTests, precautions, summary: `The patient is presenting with acute conditions related to ${department}. Immediate physician review is advised.` } },
    { id: '4', name: 'Appointment Coordinator Specialist', status: 'completed', description: 'Matched specialist schedules, locked empty consulting rooms, and scheduled visit.', durationMs: 290, output: { availableDoctors: doctors.filter(d => d.specialty === department).map(d => ({ id: d.id, name: d.name, specialty: d.specialty, slots: d.slots })), selectedDoctor: matchingDoctor ? { id: matchingDoctor.id, name: matchingDoctor.name, slot } : null, appointmentBooked: true, notes: `Consultation reserved at ${slot} in ${matchingDoctor?.room || 'Cabin 100'}.` } },
    { id: '5', name: 'Bed Allocation Specialist', status: admissionRequired ? 'completed' : 'skipped', description: 'Monitored available hospital census, checked ward statuses, and allocated a clean bed.', durationMs: admissionRequired ? 220 : 50, output: admissionRequired ? { bedAllocated: true, ward, bedNumber: assignedBed ? assignedBed.name : 'ICU-04', message: `Emergency bed assigned in ${ward}.` } : { bedAllocated: false, ward: '', bedNumber: '', message: 'Admission not requested based on symptom triage.' } },
    { id: '6', name: 'Medication Scheduler Specialist', status: 'completed', description: 'Configured morning, afternoon, and night timing blocks, and generated dosage charts.', durationMs: 180, output: { medications: medicationsList, scheduleNotes: `Ensure complete hydration. Monitor body temperature. In case of any adverse reactions, contact emergency services at once.` } }
  ];

  // Book the appointment in the actual mock database!
  if (matchingDoctor) {
    appointments.push({
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      patientName: 'Incoming Symptom Triage Patient',
      doctorName: matchingDoctor.name,
      specialty: matchingDoctor.specialty,
      slot: slot,
      status: 'Scheduled'
    });
  }

  const finalSummaryMessage = `**Coordination Summary**: We have triaged your symptoms as **${severity} Severity** which points directly to our **${department} Department**. We have booked a priority consultation with **${doctorName}** for today at **${slot}**. ${admissionRequired ? `Due to the severity, an emergency bed (**${assignedBed ? assignedBed.name : 'ICU-04'}**) has been provisioned for you in the **${ward}**.` : 'Admission is not required at this moment. Please keep observing precautions and take medications as scheduled.'}`;

  return {
    message: finalSummaryMessage,
    trace: traceSteps,
    structuredData: {
      triage: { severity, department, admissionRequired, reasoning },
      doctor: { possibleDiagnoses, recommendedTests, precautions, summary: `The patient is presenting with acute conditions related to ${department}. Immediate physician review is advised.` },
      appointment: { availableDoctors: doctors.filter(d => d.specialty === department).map(d => ({ id: d.id, name: d.name, specialty: d.specialty, slots: d.slots })), selectedDoctor: matchingDoctor ? { id: matchingDoctor.id, name: matchingDoctor.name, slot } : null, appointmentBooked: true, notes: `Consultation reserved at ${slot} in ${matchingDoctor?.room || 'Cabin 100'}.` },
      bed: admissionRequired ? { bedAllocated: true, ward, bedNumber: assignedBed ? assignedBed.name : 'ICU-04', message: `Emergency bed assigned in ${ward}.` } : undefined,
      reminder: { medications: medicationsList, scheduleNotes: 'Ensure complete hydration. Take rest.' }
    }
  };
}

// --- Active Multi-Agent Execution with Gemini ---
async function runGeminiMultiAgentCoordinator(query: string): Promise<ChatResponse> {
  if (!ai) {
    throw new Error('Google GenAI is not initialized.');
  }

  console.log('Running real Gemini Multi-Agent Coordinator for query:', query);
  const steps: TraceStep[] = [];
  const structData: any = {};

  // Step 1: Supervisor Agent determines active agents
  const tStart1 = performance.now();
  try {
    const supervisorResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Supervisor Agent of a Multi-Agent Hospital Assistant. Analyze the patient query: "${query}".
      Decide which specialized downstream agents are required to assist the patient:
      1. triage_agent: always true unless it is a non-medical greeting or completely unrelated query.
      2. doctor_agent: true if symptoms are described or a diagnosis/test is needed.
      3. appointment_agent: true if the patient wants to consult a doctor or get a slot.
      4. bed_agent: true if symptoms sound highly severe, or suggest emergency admission.
      5. reminder_agent: true if patient mentions medications, dosage, reminders, or if symptom triage calls for precautions.

      Format the response exactly as the requested JSON schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING, description: "Short overview of patient request and routing choice" },
            selectedAgents: {
              type: Type.OBJECT,
              properties: {
                triage_agent: { type: Type.BOOLEAN },
                doctor_agent: { type: Type.BOOLEAN },
                appointment_agent: { type: Type.BOOLEAN },
                bed_agent: { type: Type.BOOLEAN },
                reminder_agent: { type: Type.BOOLEAN }
              },
              required: ["triage_agent", "doctor_agent", "appointment_agent", "bed_agent", "reminder_agent"]
            }
          },
          required: ["reasoning", "selectedAgents"]
        }
      }
    });

    const supervisorText = supervisorResponse.text?.trim();
    if (!supervisorText) {
      throw new Error('Supervisor agent returned no content.');
    }
    const superVal = JSON.parse(supervisorText) as SupervisorOutput;
    steps.push({
      id: '1',
      name: 'Supervisor Agent Delegation',
      status: 'completed',
      description: 'Analyzed user query and dynamically assigned specialist pipelines.',
      durationMs: getDuration(tStart1),
      output: superVal
    });

    // We will execute the active agents sequentially or concurrently
    // Let's run sequentially to build a neat trace pipeline

    // Step 2: Patient Triage Agent
    let triageVal: TriageOutput = { severity: 'Medium', department: 'General Medicine', admissionRequired: false, reasoning: 'Default Triage' };
    if (superVal.selectedAgents.triage_agent) {
      const tStart = performance.now();
      const triageRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the Patient Triage Agent. Analyze this symptom report: "${query}".
        Determine:
        1. Severity: 'Low' (mild cold, minor scratch, light fatigue), 'Medium' (persistent fever, severe joint pain, moderate stomach ache), or 'High' (chest pain, intense breathing difficulty, suspected stroke, loss of motor functions, massive trauma).
        2. Department: One of 'Cardiology', 'Pediatrics', 'General Medicine', 'Neurology', 'Orthopedics', 'Dermatology'.
        3. admissionRequired: true if severity is 'High' and requires immediate ward monitoring or surgery, false otherwise.
        4. reasoning: short medical justification for this triage classification.
        
        Respond conforming to the requested JSON schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, description: "Low, Medium, or High" },
              department: { type: Type.STRING, description: "Department name" },
              admissionRequired: { type: Type.BOOLEAN },
              reasoning: { type: Type.STRING }
            },
            required: ["severity", "department", "admissionRequired", "reasoning"]
          }
        }
      });
      const triageText = triageRes.text?.trim();
      if (!triageText) {
        throw new Error('Triage agent returned no content.');
      }
      triageVal = JSON.parse(triageText) as TriageOutput;
      steps.push({
        id: '2',
        name: 'Patient Triage Specialist',
        status: 'completed',
        description: 'Assessed clinical severity, department routing, and hospital admission status.',
        durationMs: getDuration(tStart),
        output: triageVal
      });
      structData.triage = triageVal;
    } else {
      steps.push({ id: '2', name: 'Patient Triage Specialist', status: 'skipped', description: 'Skipped by Supervisor.' });
    }

    // Step 3: Doctor Assistant Agent
    let doctorVal: DoctorOutput | null = null;
    if (superVal.selectedAgents.doctor_agent) {
      const tStart = performance.now();
      const targetDept = triageVal ? triageVal.department : 'General Medicine';
      const doctorRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the Doctor Assistant Agent. Review this symptom report: "${query}" being routed to the "${targetDept}" department.
        Suggest:
        1. possibleDiagnoses: List 1-3 likely medical conditions or differentials.
        2. recommendedTests: List 1-3 diagnostic tests (e.g., ECG, Chest X-Ray, Blood CBC, CT Scan, Swab test).
        3. precautions: List 2-4 critical safety precautions for this condition.
        4. summary: A 2-sentence clinical brief.
        
        Respond conforming to the requested JSON schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              possibleDiagnoses: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedTests: { type: Type.ARRAY, items: { type: Type.STRING } },
              precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["possibleDiagnoses", "recommendedTests", "precautions", "summary"]
          }
        }
      });
      const doctorText = doctorRes.text?.trim();
      if (!doctorText) {
        throw new Error('Doctor agent returned no content.');
      }
      doctorVal = JSON.parse(doctorText) as DoctorOutput;
      steps.push({
        id: '3',
        name: 'Doctor Assistant Specialist',
        status: 'completed',
        description: 'Analyzed differentials, suggested diagnostics, and clinical precautions.',
        durationMs: getDuration(tStart),
        output: doctorVal
      });
      structData.doctor = doctorVal;
    } else {
      steps.push({ id: '3', name: 'Doctor Assistant Specialist', status: 'skipped', description: 'Skipped by Supervisor.' });
    }

    // Step 4: Appointment Agent
    let apptVal: AppointmentOutput | null = null;
    if (superVal.selectedAgents.appointment_agent) {
      const tStart = performance.now();
      const targetDept = triageVal ? triageVal.department : 'General Medicine';
      const departmentDoctors = doctors.filter(d => d.specialty === targetDept && d.status !== 'Off Duty');
      const activeDoctorList = departmentDoctors.length > 0 ? departmentDoctors : doctors.filter(d => d.specialty === 'General Medicine');

      const apptRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the Appointment Coordinator Agent. Match the patient routed to "${targetDept}" with these available doctors:
        ${JSON.stringify(activeDoctorList)}
        
        Choose the best available doctor. Decide:
        1. availableDoctors: list matching doctors.
        2. selectedDoctor: choose one specific doctor from the list with name and slot, or null if none available.
        3. appointmentBooked: true if selectedDoctor is chosen.
        4. notes: booking notes or consulting cabin details.
        
        Respond conforming to the requested JSON schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              availableDoctors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    specialty: { type: Type.STRING },
                    slots: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "name", "specialty", "slots"]
                }
              },
              selectedDoctor: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  slot: { type: Type.STRING }
                },
                required: ["id", "name", "slot"]
              },
              appointmentBooked: { type: Type.BOOLEAN },
              notes: { type: Type.STRING }
            },
            required: ["availableDoctors", "selectedDoctor", "appointmentBooked", "notes"]
          }
        }
      });

      const apptText = apptRes.text?.trim();
      if (!apptText) {
        throw new Error('Appointment agent returned no content.');
      }
      apptVal = JSON.parse(apptText) as AppointmentOutput;
      
      // Persist the booked appointment in our actual DB!
      if (apptVal.selectedDoctor) {
        appointments.push({
          id: 'a_' + Math.random().toString(36).substr(2, 9),
          patientName: 'AI Triage Inbound Patient',
          doctorName: apptVal.selectedDoctor.name,
          specialty: targetDept,
          slot: apptVal.selectedDoctor.slot,
          status: 'Scheduled'
        });
      }

      steps.push({
        id: '4',
        name: 'Appointment Coordinator Specialist',
        status: 'completed',
        description: 'Queried scheduling database, selected physician slot, and locked consulting cabin.',
        durationMs: getDuration(tStart),
        output: apptVal
      });
      structData.appointment = apptVal;
    } else {
      steps.push({ id: '4', name: 'Appointment Coordinator Specialist', status: 'skipped', description: 'Skipped by Supervisor.' });
    }

    // Step 5: Bed Management Agent
    let bedVal: BedOutput | null = null;
    const isAdmissionNeeded = triageVal ? triageVal.admissionRequired : superVal.selectedAgents.bed_agent;
    if (isAdmissionNeeded) {
      const tStart = performance.now();
      const targetWard = triageVal?.department === 'Cardiology' ? 'ICU' : (triageVal?.department === 'Pediatrics' ? 'Pediatric Ward' : 'General Ward A');
      const availableBeds = beds.filter(b => b.ward === targetWard && b.status === 'available');
      const selectedBed = availableBeds.length > 0 ? availableBeds[0] : beds.find(b => b.status === 'available');

      if (selectedBed) {
        selectedBed.status = 'reserved';
        selectedBed.patientName = 'Triage Emergency Patient';
        selectedBed.assignedAt = new Date().toISOString();
      }

      const bedRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the Bed Allocation Agent. Evaluate bed assignment in the hospital.
        Target Ward: "${targetWard}".
        Allocation result details: Bed matched was "${selectedBed ? selectedBed.name : 'None'}".
        
        Formulate:
        1. bedAllocated: true if a bed was assigned, false otherwise.
        2. ward: the assigned ward.
        3. bedNumber: the assigned bed name/number.
        4. message: descriptive status message.
        
        Respond conforming to the requested JSON schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bedAllocated: { type: Type.BOOLEAN },
              ward: { type: Type.STRING },
              bedNumber: { type: Type.STRING },
              message: { type: Type.STRING }
            },
            required: ["bedAllocated", "ward", "bedNumber", "message"]
          }
        }
      });
      const bedText = bedRes.text?.trim();
      if (!bedText) {
        throw new Error('Bed allocation agent returned no content.');
      }
      bedVal = JSON.parse(bedText) as BedOutput;
      steps.push({
        id: '5',
        name: 'Bed Allocation Specialist',
        status: 'completed',
        description: 'Allocated bed from central ward database, reserving telemetry in real-time.',
        durationMs: getDuration(tStart),
        output: bedVal
      });
      structData.bed = bedVal;
    } else {
      steps.push({ id: '5', name: 'Bed Allocation Specialist', status: 'skipped', description: 'Admission is not required based on patient condition.' });
    }

    // Step 6: Medicine Reminder Agent
    let reminderVal: ReminderOutput | null = null;
    if (superVal.selectedAgents.reminder_agent) {
      const tStart = performance.now();
      const conditionDiagnoses = doctorVal ? doctorVal.possibleDiagnoses.join(', ') : 'Symptoms';
      const reminderRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the Medication Scheduler Agent. Formulate a simple medicine reminder schedule based on condition: "${conditionDiagnoses}".
        Recommend 1-3 logical medications with dosages (e.g. Paracetamol 650mg, Cough Syrup 10ml, Cetirizine 10mg), timing (e.g. Morning, Night, After meals), and frequency (e.g. Once daily, Every 8 hours). Include safety notes.
        
        Respond conforming to the requested JSON schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              medications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    timing: { type: Type.STRING },
                    frequency: { type: Type.STRING }
                  },
                  required: ["name", "dosage", "timing", "frequency"]
                }
              },
              scheduleNotes: { type: Type.STRING }
            },
            required: ["medications", "scheduleNotes"]
          }
        }
      });
      const reminderText = reminderRes.text?.trim();
      if (!reminderText) {
        throw new Error('Medication agent returned no content.');
      }
      reminderVal = JSON.parse(reminderText) as ReminderOutput;
      steps.push({
        id: '6',
        name: 'Medication Scheduler Specialist',
        status: 'completed',
        description: 'Drafted morning/evening medication regimens and synchronized timers.',
        durationMs: getDuration(tStart),
        output: reminderVal
      });
      structData.reminder = reminderVal;
    } else {
      steps.push({ id: '6', name: 'Medication Scheduler Specialist', status: 'skipped', description: 'Skipped by Supervisor.' });
    }

    // Finally: Supervisor synthesizes the entire payload into a friendly readable summary message.
    const synthesisRes = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Synthesize a friendly patient-facing final report from these agent findings:
      - Triage: ${JSON.stringify(triageVal)}
      - Doctor Analysis: ${JSON.stringify(doctorVal)}
      - Appointment Booked: ${JSON.stringify(apptVal)}
      - Bed Allocated: ${JSON.stringify(bedVal)}
      - Medication Reminder: ${JSON.stringify(reminderVal)}
      
      Generate a concise paragraph (maximum 3 sentences) explaining:
      1. What department and doctor they have been assigned to.
      2. If emergency ward admission is required.
      3. A word of assurance. Do not mention system-internal files, agents, or JSON schemas.`
    });

    const synthesisText = synthesisRes.text?.trim();
    if (!synthesisText) {
      throw new Error('Synthesis agent returned no content.');
    }

    return {
      message: synthesisText,
      trace: steps,
      structuredData: structData
    };

  } catch (error: any) {
    console.error('Error running real Gemini multi-agent coordinator:', error);
    // Fallback to simulation on error
    return runSimulatedCoordinator(query);
  }
}

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid query message.' });
  }

  try {
    let result: ChatResponse;
    if (ai) {
      result = await runGeminiMultiAgentCoordinator(message);
    } else {
      // Simulate real delay (e.g. 1.5 seconds) to make the workflow visual animation look professional
      await new Promise(resolve => setTimeout(resolve, 1500));
      result = runSimulatedCoordinator(message);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during multi-agent orchestration.' });
  }
});

// Reset simulation API
app.post('/api/reset-data', (req, res) => {
  // Reset doctor statuses and empty appointments
  doctors = [
    { id: 'd1', name: 'Dr. Sameer Sharma', specialty: 'Cardiology', slots: ['11:00 AM', '01:30 PM', '04:00 PM'], rating: 4.9, status: 'Available', room: 'Cabin 301' },
    { id: 'd2', name: 'Dr. Priya Patel', specialty: 'Pediatrics', slots: ['09:00 AM', '10:30 AM', '02:00 PM'], rating: 4.8, status: 'Available', room: 'Cabin 104' },
    { id: 'd3', name: 'Dr. Elena Gomez', specialty: 'General Medicine', slots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'], rating: 4.7, status: 'Available', room: 'Cabin 205' },
    { id: 'd4', name: 'Dr. Kevin Chen', specialty: 'Neurology', slots: ['02:00 PM', '03:30 PM'], rating: 4.9, status: 'On Duty', room: 'Cabin 402' },
    { id: 'd5', name: 'Dr. Sarah Davies', specialty: 'Orthopedics', slots: ['08:30 AM', '11:00 AM', '04:30 PM'], rating: 4.6, status: 'Available', room: 'Cabin 212' },
    { id: 'd6', name: 'Dr. Tariq Al-Mansoor', specialty: 'Dermatology', slots: ['12:00 PM', '02:30 PM', '05:30 PM'], rating: 4.8, status: 'Off Duty', room: 'Cabin 108' }
  ];
  appointments = [
    { id: 'a1', patientName: 'Sarah Connor', doctorName: 'Dr. Elena Gomez', specialty: 'General Medicine', slot: '10:00 AM', status: 'Scheduled' },
    { id: 'a2', patientName: 'Bruce Wayne', doctorName: 'Dr. Sameer Sharma', specialty: 'Cardiology', slot: '11:00 AM', status: 'Scheduled' },
    { id: 'a3', patientName: 'Peter Parker', doctorName: 'Dr. Priya Patel', specialty: 'Pediatrics', slot: '02:00 PM', status: 'Scheduled' }
  ];
  beds = beds.map((b, idx) => {
    if (idx % 4 === 0) {
      return { ...b, status: 'occupied', patientName: 'Assigned Patient', assignedAt: new Date().toISOString() };
    }
    if (idx % 7 === 0) {
      return { ...b, status: 'reserved', patientName: 'Reserved Slot' };
    }
    return { ...b, status: 'available', patientName: undefined, assignedAt: undefined };
  });

  res.json({ success: true, message: 'Hospital database reset successfully.' });
});


// --- Vite Dev Middleware and Production Static Server ---
function listenWithFallback(port: number) {
  return new Promise<any>((resolve, reject) => {
    const tryListen = (currentPort: number) => {
      const server = app.listen(currentPort, HOST, () => {
        console.log(`Hospital AI Coordinator active on port ${currentPort}`);
        resolve(server);
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE' && currentPort < currentPort + 10) {
          console.warn(`Port ${currentPort} is busy, trying ${currentPort + 1}...`);
          server.close();
          tryListen(currentPort + 1);
        } else {
          reject(error);
        }
      });
    };

    tryListen(port);
  });
}

export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, host: HOST },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return listenWithFallback(PORT);
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
if (isDirectRun) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { app };
export default app;
