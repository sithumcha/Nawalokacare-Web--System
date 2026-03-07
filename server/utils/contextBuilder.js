


const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// helper: Date -> YYYY-MM-DD (local)
const toYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const buildHospitalContext = async (message) => {
  // ===========================================
  // STEP 1: Base hospital information
  // ===========================================
  const baseInfo = `
Hospital Information:
- Hours: Mon-Fri 9am-6pm, Sat 9am-2pm, Sun closed
- Emergency: 24/7
- Appointment: Online/Phone/Walk-in
- Contact: (555) 123-4567
`.trim();

  // ===========================================
  // STEP 2: Get doctors from database
  // ===========================================
  const doctors = await Doctor.find({})
    .select("firstName lastName specialization department price availableTimeSlots")
    .lean();

  const doctorsText = doctors.length
    ? doctors
        .map((d) => {
          const fullName = `Dr. ${d.firstName} ${d.lastName}`;
          return `- ${fullName} | ${d.specialization} | Dept: ${d.department} | Fee: ${d.price}`;
        })
        .join("\n")
    : "- No doctors found.";

  // ===========================================
  // STEP 3: Get today's slots
  // ===========================================
  const today = new Date();
  const todayStr = toYMD(today);

  // Get today's booked appointments
  const bookedToday = await Appointment.find({
    appointmentDate: {
      $gte: new Date(`${todayStr}T00:00:00.000Z`),
      $lte: new Date(`${todayStr}T23:59:59.999Z`)
    },
    status: { $in: ["pending", "confirmed"] }
  })
    .select("doctorId timeSlot timeSlotId consultationType")
    .lean();

  // Build booked map
  const bookedMap = new Map();
  for (const a of bookedToday) {
    const key = `${String(a.doctorId)}|${a.timeSlot?.day}|${a.timeSlot?.startTime}|${a.consultationType || a.timeSlot?.consultationType || ""}`;
    bookedMap.set(key, (bookedMap.get(key) || 0) + 1);
  }

  // Get today's weekday name
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDayName = dayNames[today.getDay()];

  // Build slots text
  const slotsLines = [];
  for (const d of doctors) {
    const fullName = `Dr. ${d.firstName} ${d.lastName}`;
    const todaysSlots = (d.availableTimeSlots || []).filter(s => s.day === todayDayName);

    for (const s of todaysSlots) {
      const key = `${String(d._id)}|${s.day}|${s.startTime}|${s.consultationType}`;
      const bookedCount = bookedMap.get(key) || 0;
      const remaining = Math.max((s.quantity || 0) - bookedCount, 0);

      if (remaining > 0) {
        slotsLines.push(
          `- ${fullName} | ${todayDayName} | ${s.startTime}-${s.endTime} | ${s.consultationType} | remaining: ${remaining}`
        );
      }
    }
  }

  const slotsText = slotsLines.length ? slotsLines.join("\n") : "- No available slots for today.";

  // ===========================================
  // STEP 4: SYMPTOM ANALYSIS - NEW CODE ADDED HERE
  // ===========================================
  
  // 4.1: Create symptom keywords list
  const symptomKeywords = [
    // Sinhala words
    'rida', 'hada', 'awulak', 'unana', 'leda', 'ridhenawa', 'duka', 
    'rata', 'anguru', 'gatta', 'hiri', 'kan', 'nose', 'ugura', 
    'maranaya', 'amaruwa', 'hanikata', 'hoda', 'næ',
    // English words
    'pain', 'fever', 'cough', 'headache', 'sick', 'ill', 'hurt', 
    'ache', 'symptom', 'feeling', 'vomit', 'nausea', 'cold', 'flu'
  ];
  
  // 4.2: Check if message contains any symptom keyword
  const hasSymptoms = symptomKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );

  // 4.3: Create symptom instruction (only if symptoms detected)
  let symptomInstruction = "";
  
  // utils/contextBuilder.js එකේ symptom instruction එක modify කරන්න

// utils/contextBuilder.js එකේ, symptom instruction එක modify කරන්න

if (hasSymptoms) {
  symptomInstruction = `

🎯 **SYMPTOM ANALYSIS REQUEST:**
User described symptoms: "${message}"

**IMPORTANT INSTRUCTIONS:**

1. First, analyze the symptoms and identify the required specialization
2. Look at the DOCTORS LIST above to find matching doctors
3. IF there is a matching doctor:
   - Recommend that doctor with name, specialization, fee, availability
4. IF there is NO matching doctor:
   - Say "We do not have a [specialization] specialist listed in our current database"
   - Suggest a General Physician as an alternative
   - Ask if they want to book with General Physician or wait for specialist

**YOUR RESPONSE MUST BE COMPLETE - DO NOT CUT OFF MID-SENTENCE**

Examples:

If doctor exists:
"Based on your symptoms, you might need to see a [Specialization]. I recommend Dr. [Name]...
Fee: Rs. [Price]. Available: [Times]. Would you like to book?"

If no doctor exists:
"Based on your symptoms, you might need to see a [Specialization]. Unfortunately, we don't have a [Specialization] specialist in our database right now. Would you like to consult a General Physician instead, or should I notify you when a specialist becomes available?"

Use ONLY doctors from the list above.`;
}
  // ===========================================
  // STEP 5: Return everything with symptom instruction
  // ===========================================
  return `
${baseInfo}

Doctors List:
${doctorsText}

Available Slots (Today: ${todayStr} / ${todayDayName}):
${slotsText}
${symptomInstruction}
`.trim();
};

module.exports = { buildHospitalContext };