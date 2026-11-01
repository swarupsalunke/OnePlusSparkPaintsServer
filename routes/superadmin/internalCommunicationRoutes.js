
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
router.post(
  "/department",
  authMiddleware,
  getDepartmentConversation
);

// CREATE OR GET DIRECT CHAT
router.post(
  "/direct",
  authMiddleware,
  getOrCreateDirectConversation
);

// GET MESSAGES
router.get(
  "/:conversationId/messages",
  authMiddleware,
  getMessages
);

// CHAT ATTACHMENT UPLOAD HANDLER
const handleChatAttachmentUpload = (req, res, next) => {
  uploadChatAttachment.single("file")(req, res, (err) => {
    if (err) {
      console.error("CHAT UPLOAD ERROR:", {
        message: err.message,
        name: err.name,
        http_code: err.http_code,
      });

      const isValidationError =
        err.name === "MulterError" ||
        err.message === "File type is not supported";

      return res.status(isValidationError ? 400 : 502).json({
        success: false,
        message: isValidationError
          ? err.message
          : "File upload failed. Please try again.",
      });
    }

    next();
  });
};

// SEND MESSAGE WITH OPTIONAL ATTACHMENT
router.post(
  "/messages",
  authMiddleware,
  handleChatAttachmentUpload,
  sendMessage
);

// MARK MESSAGE AS READ
router.patch(
  "/messages/:messageId/read",
  authMiddleware,
  markMessageAsRead
);

// EDIT MESSAGE
router.put(
  "/messages/:messageId",
  authMiddleware,
  editMessage
);

// DELETE MESSAGE
router.delete(
  "/messages/:messageId",
  authMiddleware,
  deleteMessage
);

module.exports = router;
