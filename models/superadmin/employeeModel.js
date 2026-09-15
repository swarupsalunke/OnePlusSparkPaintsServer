const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    designation: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    employmentType: {
      type: String,
      enum: ["PERMANENT", "CONTRACTUAL", "TEMPORARY"],
      default: "PERMANENT",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "RESIGNED"],
      default: "ACTIVE",
    },

    joiningDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically generate Employee ID
employeeSchema.pre("save", async function () {
  if (this.employeeId) {
    return;
  }

  const lastEmployee = await mongoose
    .model("Employee")
    .findOne({ employeeId: { $exists: true } })
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastEmployee?.employeeId) {
    const match = lastEmployee.employeeId.match(/EMP(\d+)/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  this.employeeId = `EMP${String(nextNumber).padStart(4, "0")}`;
});

module.exports = mongoose.model("Employee", employeeSchema);