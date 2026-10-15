const express = require("express");

const router = express.Router();

const {
  createBirthday,
  getBirthdays,
  getBirthdayById,
  updateBirthday,
  deleteBirthday,
} = require("../controllers/birthdayController");

// Create birthday
router.post("/", createBirthday);

// Get all birthdays
router.get("/", getBirthdays);

// Get single birthday
router.get("/:id", getBirthdayById);

// Update birthday
router.put("/:id", updateBirthday);

// Delete birthday
router.delete("/:id", deleteBirthday);

module.exports = router;