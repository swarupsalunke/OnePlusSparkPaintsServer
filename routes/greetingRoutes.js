const express = require("express");

const router = express.Router();

const {
  sendGreeting,
  getGreetings,
} = require("../controllers/greetingController");

// Send greeting
router.post("/send", sendGreeting);

// Get greeting history
router.get("/", getGreetings);

module.exports = router;