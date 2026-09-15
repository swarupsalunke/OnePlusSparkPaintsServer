const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC SETTINGS
    // =========================

    systemName: {
      type: String,
      required: true,
      trim: true,
      default: "OnePlus Spark ERP",
    },

    systemLogo: {
      type: String,
      default: "",
    },

    defaultDashboard: {
      type: String,
      default: "Admin Dashboard",
    },

    dateFormat: {
      type: String,
      default: "DD MMM YYYY",
    },

    timeFormat: {
      type: String,
      default: "12 Hour (AM/PM)",
    },

    currency: {
      type: String,
      default: "Indian Rupee (₹)",
    },

    // =========================
    // LOCALE SETTINGS
    // =========================

    timezone: {
      type: String,
      default: "(GMT+05:30) Asia/Kolkata",
    },

    language: {
      type: String,
      default: "English",
    },

    numberFormat: {
      type: String,
      default: "1,23,456.78",
    },

    // =========================
    // DISPLAY SETTINGS
    // =========================

    enableDarkMode: {
      type: Boolean,
      default: false,
    },

    compactSidebar: {
      type: Boolean,
      default: false,
    },

    showBreadcrumbs: {
      type: Boolean,
      default: true,
    },

    enableAnimations: {
      type: Boolean,
      default: true,
    },

    showFooter: {
      type: Boolean,
      default: true,
    },

    showQuickActions: {
      type: Boolean,
      default: true,
    },

    // =========================
    // ITEMS PER PAGE
    // =========================

    defaultItemsPerPage: {
      type: Number,
      default: 10,
      min: 1,
    },

    // =========================
    // FILE UPLOAD SETTINGS
    // =========================

    maxFileSize: {
      type: Number,
      default: 10,
      min: 1,
    },

    allowedFileTypes: {
      type: String,
      default: "jpg, jpeg, png, pdf, doc, xls, xlsx",
    },

    storageDisk: {
      type: String,
      default: "Local Storage",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SystemSettings",
  systemSettingsSchema
);