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
  const baseInfo = `
Hospital Information:
- Hours: Mon-Fri 9am-6pm, Sat 9am-2pm, Sun closed
- Emergency: 24/7
- Appointment: Online/Phone/Walk-in
- Contact: (555) 123-4567
`.trim();

  // ✅ Doctors (important fields only)
  const doctors = await Doctor.find({}) // or { active: true } if you have it
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

  // ✅ Today slots (simple version)
  // We list TODAY’s slots from each doctor + reduce by booked counts (optional)
  const today = new Date();
  const todayStr = toYMD(today);

  // Get today's booked appointments (all doctors) to filter / show counts
  const bookedToday = await Appointment.find({
    appointmentDate: {
      $gte: new Date(`${todayStr}T00:00:00.000Z`),
      $lte: new Date(`${todayStr}T23:59:59.999Z`)
    },
    status: { $in: ["pending", "confirmed"] }
  })
    .select("doctorId timeSlot timeSlotId consultationType")
    .lean();

  // Build a quick map: doctorId + day + startTime + consultationType -> bookedCount
  const bookedMap = new Map();
  for (const a of bookedToday) {
    const key = `${String(a.doctorId)}|${a.timeSlot?.day}|${a.timeSlot?.startTime}|${a.consultationType || a.timeSlot?.consultationType || ""}`;
    bookedMap.set(key, (bookedMap.get(key) || 0) + 1);
  }

  // NOTE: Doctor.availableTimeSlots is by DAY name, not date.
  // We'll compute today's weekday name:
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDayName = dayNames[today.getDay()];

  const slotsLines = [];
  for (const d of doctors) {
    const fullName = `Dr. ${d.firstName} ${d.lastName}`;
    const todaysSlots = (d.availableTimeSlots || []).filter(s => s.day === todayDayName);

    for (const s of todaysSlots) {
      const key = `${String(d._id)}|${s.day}|${s.startTime}|${s.consultationType}`;
      const bookedCount = bookedMap.get(key) || 0;
      const remaining = Math.max((s.quantity || 0) - bookedCount, 0);

      // show only if remaining > 0 (or show all with remaining)
      if (remaining > 0) {
        slotsLines.push(
          `- ${fullName} | ${todayDayName} | ${s.startTime}-${s.endTime} | ${s.consultationType} | remaining: ${remaining}`
        );
      }
    }
  }

  const slotsText = slotsLines.length ? slotsLines.join("\n") : "- No available slots for today.";

  return `
${baseInfo}

Doctors List:
${doctorsText}

Available Slots (Today: ${todayStr} / ${todayDayName}):
${slotsText}
`.trim();
};

module.exports = { buildHospitalContext };
