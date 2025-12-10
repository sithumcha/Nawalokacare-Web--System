






// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema(
//   {
//     userId: {  // NEW FIELD - Add this
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     doctorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true
//     },
//     doctorName: {
//       type: String,
//       required: true
//     },
//     doctorSpecialization: {
//       type: String,
//       required: true
//     },
//     patientDetails: {
//       fullName: { type: String, required: true },
//       email: { type: String },
//       phoneNumber: { type: String, required: true },
//       dateOfBirth: { type: Date },
//       gender: { type: String },
//       address: { type: String },
//       medicalConcern: { type: String, required: true },
//       previousConditions: { type: String }
//     },
//     appointmentDate: {
//       type: Date,
//       required: true
//     },
//     timeSlot: {
//       day: { type: String, required: true },
//       startTime: { type: String, required: true },
//       endTime: { type: String, required: true }
//     },
//     timeSlotId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled", "completed"],
//       default: "pending"
//     },
//     appointmentNumber: {
//       type: String,
//       unique: true
//     }
//   },
//   { timestamps: true }
// );

// // Generate appointment number before saving
// appointmentSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await mongoose.model("Appointment").countDocuments();
//     this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model("Appointment", appointmentSchema);





















//////////////////////////



// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema(
//   {
//     userId: {  // NEW FIELD - Add this
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     doctorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true
//     },
//     doctorName: {
//       type: String,
//       required: true
//     },
//     doctorSpecialization: {
//       type: String,
//       required: true
//     },
//     patientDetails: {
//       fullName: { type: String, required: true },
//       email: { type: String },
//       phoneNumber: { type: String, required: true },
//       dateOfBirth: { type: Date },
//       gender: { type: String },
//       address: { type: String },
//       medicalConcern: { type: String, required: true },
//       previousConditions: { type: String }
//     },
//     appointmentDate: {
//       type: Date,
//       required: true
//     },
//     timeSlot: {
//       day: { type: String, required: true },
//       startTime: { type: String, required: true },
//       endTime: { type: String, required: true }
//     },
//     timeSlotId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled", "completed"],
//       default: "pending"
//     },
//     appointmentNumber: {
//       type: String,
//       unique: true
//     }
//   },
//   { timestamps: true }
// );

// // Generate appointment number before saving
// appointmentSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await mongoose.model("Appointment").countDocuments();
//     this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model("Appointment", appointmentSchema); 




























// // models/Appointment.js - FIXED VERSION
// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     doctorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true
//     },
//     doctorName: {
//       type: String,
//       required: true
//     },
//     doctorSpecialization: {
//       type: String,
//       required: true
//     },
//     patientDetails: {
//       fullName: { type: String, required: true },
//       email: { type: String },
//       phoneNumber: { type: String, required: true },
//       dateOfBirth: { type: Date },
//       gender: { type: String },
//       address: { type: String },
//       medicalConcern: { type: String, required: true },
//       previousConditions: { type: String }
//     },
//     appointmentDate: {
//       type: Date,
//       required: true
//     },
//     timeSlot: {
//       day: { type: String, required: true },
//       startTime: { type: String, required: true },
//       endTime: { type: String, required: true }
//     },
//     timeSlotId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled", "completed"],
//       default: "pending"
//     },
//     appointmentNumber: {
//       type: String,
//       unique: true
//     }
//   },
//   { timestamps: true }
// );

// // FIXED: Better appointment number generation
// appointmentSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     let isUnique = false;
//     let attempts = 0;
//     const maxAttempts = 5;
    
//     while (!isUnique && attempts < maxAttempts) {
//       try {
//         const date = new Date();
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
        
//         // Get count of appointments for this month only
//         const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//         const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
//         const count = await mongoose.model("Appointment").countDocuments({
//           createdAt: {
//             $gte: startOfMonth,
//             $lte: endOfMonth
//           }
//         });
        
//         this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
        
//         // Check if this number already exists (rare case)
//         const existing = await mongoose.model("Appointment").findOne({
//           appointmentNumber: this.appointmentNumber
//         });
        
//         if (!existing) {
//           isUnique = true;
//         } else {
//           attempts++;
//           // Wait a bit and try again with random suffix
//           await new Promise(resolve => setTimeout(resolve, 100));
//           this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}-${Math.random().toString(36).substr(2, 3)}`;
//         }
//       } catch (error) {
//         attempts++;
//         if (attempts >= maxAttempts) {
//           // Fallback: use timestamp-based unique number
//           this.appointmentNumber = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
//           break;
//         }
//       }
//     }
//   }
//   next();
// });

// module.exports = mongoose.model("Appointment", appointmentSchema);










// wada karana eka 







////////////////////////////////








// models/Appointment.js - UPDATED WITH CONSULTATION TYPE & PRICE
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    doctorSpecialization: {
      type: String,
      required: true
    },
    
    // NEW FIELDS - Add these
    consultationType: {
      type: String,
      enum: ["physical", "online"],
      required: true,
      default: "physical"
    },
    price: {
      type: Number,
      required: true
    },
    // END NEW FIELDS
    
    patientDetails: {
      fullName: { type: String, required: true },
      email: { type: String },
      phoneNumber: { type: String, required: true },
      dateOfBirth: { type: Date },
      gender: { type: String },
      address: { type: String },
      medicalConcern: { type: String, required: true },
      previousConditions: { type: String }
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      consultationType: { type: String } // Add this too for reference
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    appointmentNumber: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
);

// FIXED: Better appointment number generation
appointmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!isUnique && attempts < maxAttempts) {
      try {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        // Get count of appointments for this month only
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = await mongoose.model("Appointment").countDocuments({
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        });
        
        this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
        
        // Check if this number already exists (rare case)
        const existing = await mongoose.model("Appointment").findOne({
          appointmentNumber: this.appointmentNumber
        });
        
        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
          // Wait a bit and try again with random suffix
          await new Promise(resolve => setTimeout(resolve, 100));
          this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}-${Math.random().toString(36).substr(2, 3)}`;
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          // Fallback: use timestamp-based unique number
          this.appointmentNumber = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          break;
        }
      }
    }
  }
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);