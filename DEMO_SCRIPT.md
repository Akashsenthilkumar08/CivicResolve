# 🎬 CivicResolve — 60-90 Second Hackathon Demo Script

**Project**: CivicResolve — AI-Powered Civic Grievance & Resolution Platform  
**Tagline**: *"Report. Track. Resolve."*  
**Model**: Google Gemini 2.5 Flash via `@google/genai`  
**Demo Duration**: ~75 seconds

---

### Step 1: Hook & Value Proposition (0:00 - 0:15)
> *(Start at `http://localhost:5173` on the Landing Page)*

**Speaker:**
> *"Every day, citizens encounter broken streetlights, overflowing garbage, and hazardous live wires. But traditional municipal complaint portals are slow, confusing, and opaque.
> This is **CivicResolve**, an AI-driven platform that automates municipal triage and gives citizens real-time resolution transparency. Let's see it in action."*

**Visual Action:**
- Scroll down slightly to show the live municipal stats cards (14 Total Grievances, 4 Critical Hazards).
- Highlight the **"Powered by Google Gemini 2.5 Flash"** badge.

---

### Step 2: Citizen Reporting with Multimodal AI (0:15 - 0:35)
> *(Click the "Report an Issue" button)*

**Speaker:**
> *"Suppose I'm walking near a school and see a dangerous 440V power line snapped and sparking on the footpath."*

**Visual Action:**
- In **Grievance Title**, enter:
  `440V live electrical cable snapped and sparking outside National Public School`
- In **Description**, enter:
  `High footfall area with schoolchildren. Heavy rain created puddles, sparks occurring whenever wind blows.`
- Click **"Use My Current Location"** (GPS coordinates fill in automatically).
- Leave Category on: **"✨ Auto-detect with AI"**.
- Click **"Submit & Analyze with Gemini"**.

---

### Step 3: AI Classification & Urgency Assessment (0:35 - 0:50)
> *(The animated AI analyzing screen appears with progress steps, then confetti pops)*

**Speaker:**
> *"Within two seconds, Google Gemini parses the grievance, evaluates physical danger and location sensitivity near a school, and issues a structured classification.
> Notice: it rated the hazard as **Critical** (red badge), identified the exact operating department as the **Electricity Supply Company**, estimated resolution within **4-8 hours**, and assigned unique Tracking ID **CR-XXXXXX**."*

**Visual Action:**
- Point out the **AI Municipal Assessment Card** with 98% AI Confidence score and priority justification.
- Click the **"Track Resolution Progress"** button.

---

### Step 4: Citizen Tracking & Civic Tools (0:50 - 1:10)
> *(On the Tracking Detail Page)*

**Speaker:**
> *"The citizen is never left in the dark. We have a real-time 3-step timeline stepper: Reported → In Progress → Resolved.
> Other neighbors can click **'I'm affected too'** to amplify community urgency.
> Citizens can also click **'Generate Formal Municipal Letter'** to produce an official, legally structured escalation notice ready to send to the Commissioner.
> And clicking **'Map View'** displays all geocoded complaints across the city, color-coded by hazard priority."*

**Visual Action:**
- Click **"I'm affected too"** (upvotes increment).
- Click **"Generate Formal Municipal Letter"** (modal displays formatted legal notice).
- Click **"Map View"** (Leaflet OpenStreetMap opens with colored pins).

---

### Step 5: Admin Operations & Live Loop Completion (1:10 - 1:30)
> *(Click "Admin Portal" in Navbar)*

**Speaker:**
> *"Now let's switch to the Municipal Admin view.
> Officers log in to view real-time Recharts analytics: grievances by department, priority breakdowns, and resolution status."*

**Visual Action:**
- Click **"Fill Demo Credentials"** (`admin` / `civicadmin123`) and click **Sign In**.
- Show the **Category Bar Chart** and **Priority Breakdown**.
- In the table, click **"Manage"** on the newly submitted complaint.
- Switch Status to **"In Progress"**.
- In Action Note, enter: `Emergency Lineman Squad 4 dispatched. Feeder de-energized.`
- Click **"Save & Update Timeline"**.

---

### Step 6: Closing & Citizen Reflection (1:30 - 1:40)
> *(Switch back to the Citizen Tracking page)*

**Speaker:**
> *"Back on the citizen's screen, the status immediately moves to **In Progress**, and the citizen sees the exact squad assignment in the public audit history.
> **CivicResolve: Report. Track. Resolve.** Making municipal governance faster, safer, and transparent for everyone."*
