const express = require("express");

const router = express.Router();

const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// CREATE CONTACT
// ==========================================

router.post(
  "/",
  authMiddleware,
  createContact
);

// ==========================================
// GET ALL CONTACTS
// Search, Filter & Sort
// ==========================================

router.get(
  "/",
  authMiddleware,
  getContacts
);

// ==========================================
// GET SINGLE CONTACT
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  getContactById
);

// ==========================================
// UPDATE CONTACT
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  updateContact
);

// ==========================================
// DELETE CONTACT
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  deleteContact
);

module.exports = router;