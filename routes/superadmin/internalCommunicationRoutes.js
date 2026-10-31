const express = require("express");
const router = express.Router();

const {
  getConversations,
  getDepartmentConversation,
  getOrCreateDirectConversation,
  getMessages,
  sendMessage,
  markMessageAsRead,
  editMessage,
  deleteMessage,
} = require("../../controllers/superadmin/internalCommunicationController");

const authMiddleware = require("../../middleware/authMiddleware");

// GET ALL CONVERSATIONS
router.get("/", authMiddleware, getConversations);

// GET OR CREATE DEPARTMENT CHAT
router.post("/department", authMiddleware, getDepartmentConversation);

// CREATE OR GET DIRECT CHAT
router.post("/direct", authMiddleware, getOrCreateDirectConversation);

// GET MESSAGES
router.get("/:conversationId/messages", authMiddleware, getMessages);

// SEND MESSAGE
router.post("/messages", authMiddleware, sendMessage);

// MARK MESSAGE AS READ
router.patch("/messages/:messageId/read", authMiddleware, markMessageAsRead);

// EDIT MESSAGE
router.put("/messages/:messageId", authMiddleware, editMessage);

// DELETE MESSAGE
router.delete("/messages/:messageId", authMiddleware, deleteMessage);

module.exports = router;