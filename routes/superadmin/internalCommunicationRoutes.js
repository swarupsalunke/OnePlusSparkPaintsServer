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
const uploadChatAttachment = require("../../middleware/uploadChatAttachment");

// GET ALL CONVERSATIONS
router.get("/", authMiddleware, getConversations);

// GET OR CREATE DEPARTMENT CHAT
router.post("/department", authMiddleware, getDepartmentConversation);

// CREATE OR GET DIRECT CHAT
router.post("/direct", authMiddleware, getOrCreateDirectConversation);

// GET MESSAGES
router.get("/:conversationId/messages", authMiddleware, getMessages);

// SEND MESSAGE
router.post(
  "/messages",
  authMiddleware,
  (req, res, next) => {
    uploadChatAttachment.single("file")(req, res, (err) => {
      if (err) {
        console.error("CHAT UPLOAD ERROR:", err);
        console.error("CHAT UPLOAD STACK:", err.stack);

        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      next();
    });
  },
  sendMessage
);

// MARK MESSAGE AS READ
router.patch("/messages/:messageId/read", authMiddleware, markMessageAsRead);

// EDIT MESSAGE
router.put("/messages/:messageId", authMiddleware, editMessage);

// DELETE MESSAGE
router.delete("/messages/:messageId", authMiddleware, deleteMessage);

module.exports = router;