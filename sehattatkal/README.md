# SehatTatkal — Multi-Agent Hospital AI Coordinator 🏥⚡

**SehatTatkal** is an intelligent, full-stack hospital clinical coordination and triage system designed to optimize emergency ward workflows. Leveraging multi-agent coordination powered by Gemini and a responsive, high-fidelity React dashboard, SehatTatkal streamlines patient symptom intake, clinical triage, doctor appointments, bed reservations, and prescription scheduling in real-time.

---

## 🌟 Key Features

- 🧬 **Multi-Agent Symptom Triage**: Users describe patient symptoms (e.g., *"Chest tightness, radiating pain in the left arm, sweating"*), and the supervisor coordinates specialized AI agents:
  - **Supervisor Agent**: Delegates tasks and activates pathways.
  - **Triage Assessment Agent**: Determines department, admission requirements, and priority.
  - **Doctor Diagnostics Assistant**: Recommends differential suspects, lab tests, and safety precautions.
  - **Consultation Coordinator**: Schedules appointment slots with available specialists.
  - **Bed Registry Database Manager**: Allocates beds in real-time based on severity.
  - **Medication Scheduler**: Prepares prescription schedules and timing protocols.
- ⏱️ **Interactive Agent Workflow Tracer**: Visualizes sequential multi-agent execution steps with precise duration metrics, diagnostic logs, and dynamic reasoning previews.
- 🛏️ **Real-Time Bed Grid Map**: Features interactive department filtration (All, ICU, General, Pediatric, etc.) to view, reserve, or manually admit and release patients.
- 🧑‍⚕️ **On-Call Physician Roster**: Displays doctor statuses (Available, On Duty, Off Duty) and real-time appointment bookings synced through the triage coordination pipeline.
- 🌓 **Dynamic Theme Engine**: Smoothly switches between premium high-contrast Light and Slate-Dark modes for eye safety in busy clinical environments.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (TypeScript), Vite 6, Tailwind CSS v4, Motion (Animations), Lucide React (Icons).
- **Backend**: Express (Node.js/ESModules), serving as a server-side proxy to protect API keys.
- **AI Engine**: `@google/genai` TypeScript SDK utilizing high-performance Gemini models.
- **Build System**: Bundle-compiled Node.js backend using `esbuild` for standalone container runtimes.

---

## 📂 Project Structure

```bash
├── src/
│   ├── components/
│   │   ├── BedGrid.tsx          # Real-time interactive bed layout & admissions
│   │   ├── DoctorList.tsx       # Live specialist roster & booked consultations queue
│   │   ├── SymptomInput.tsx     # Intake panel orchestrating the Gemini multi-agent pipeline
│   │   └── TriageFlow.tsx       # Visual timeline trace mapping multi-agent steps
│   ├── App.tsx                  # Main layout orchestrating state, tabs, & theme sync
│   ├── index.css                # Global styles, fonts (Inter, JetBrains Mono), Tailwind imports
│   ├── main.tsx                 # React DOM entrypoint
│   └── types.ts                 # Shared TypeScript models and interfaces
├── server.ts                    # Express entry point & Gemini proxy endpoints
├── metadata.json                # App permissions, meta title, and description config
├── package.json                 # Dependency manifests & run scripts
└── .env.example                 # Example configuration for local execution
```

---

## ⚡ Setup & Local Development

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** installed on your machine.

### 2. Environment Variables
To use the intelligent multi-agent orchestration, configure your Gemini API Key. Duplicate `.env.example` as `.env` and fill in your credential:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies
Install all package dependencies via npm:
```bash
npm install
```

### 4. Running the Development Server
Launch the development environment (Express API + Vite Dev Server):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Start
To compile and bundle both the backend and frontend for production deployment:
```bash
# Build static assets & bundle the server CJS output via esbuild
npm run build

# Start the compiled bundle standalone server
npm run start
```

---

## ⚖️ License
Prototype developed for medical coordinator mock scenarios. All diagnostics and triage paths are simulated using advanced medical language models and should be peer-reviewed by authorized clinical operators before actual implementation.
