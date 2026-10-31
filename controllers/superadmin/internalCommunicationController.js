
const mongoose = require("mongoose");

const User = require("../../models/superadmin/User");
const Conversation = require("../../models/superadmin/Conversation");
const Message = require("../../models/superadmin/Message");

// =====================================
// HELPER: GET CURRENT USER
// =====================================

const getCurrentUser = async (req) => {
    return await User.findById(req.user.userId);
};

// =====================================
// HELPER: DEPARTMENT KEY
// =====================================

const makeDepartmentKey = (department) => {
    return department.trim().toLowerCase();
};

// =====================================
// HELPER: CHECK CONVERSATION ACCESS
// =====================================

const hasConversationAccess = async (conversation, user) => {
    if (!conversation || !user) return false;

    // SUPER ADMIN / OWNER HAS FULL VISIBILITY
    if (user.role === "SUPER_ADMIN") {
        return true;
    }

    // DIRECT CHAT ACCESS
    if (conversation.type === "DIRECT") {
        return conversation.participants.some(
            (participant) =>
                participant.toString() === user._id.toString()
        );
    }

    // DEPARTMENT CHAT ACCESS
    if (conversation.type === "DEPARTMENT") {
        return (
            user.department &&
            makeDepartmentKey(user.department) ===
            conversation.departmentKey
        );
    }

    return false;
};

// =====================================
// 1. GET ALL CONVERSATIONS
// =====================================

exports.getConversations = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        let filter = {
            isActive: true,
        };

        // OWNER CAN SEE ALL CONVERSATIONS
        if (user.role !== "SUPER_ADMIN") {
            const conditions = [
                {
                    type: "DIRECT",
                    participants: user._id,
                },
            ];

            if (user.department) {
                conditions.push({
                    type: "DEPARTMENT",
                    departmentKey: makeDepartmentKey(user.department),
                });
            }

            filter.$or = conditions;
        }

        const conversations = await Conversation.find(filter)
            .populate("participants", "name userId role department profilePicture status")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "name userId profilePicture",
                },
            })
            .populate("createdBy", "name userId")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 2. GET OR CREATE DEPARTMENT CHAT
// =====================================

exports.getDepartmentConversation = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        // Normal users can access only their own department.
        // SUPER_ADMIN can request another department.
        let department = user.department;

        if (user.role === "SUPER_ADMIN" && req.body.department) {
            department = req.body.department.trim();
        }

        if (!department) {
            return res.status(400).json({
                success: false,
                message: "Department is required",
            });
        }

        const departmentKey = makeDepartmentKey(department);

        let conversation = await Conversation.findOne({
            type: "DEPARTMENT",
            departmentKey,
        });

        if (!conversation) {
            try {
                conversation = await Conversation.create({
                    type: "DEPARTMENT",
                    department,
                    departmentKey,
                    participants: [],
                    createdBy: user._id,
                });
            } catch (error) {
                // Handle duplicate creation requests
                if (error.code === 11000) {
                    conversation = await Conversation.findOne({
                        type: "DEPARTMENT",
                        departmentKey,
                    });
                } else {
                    throw error;
                }
            }
        }

        if (!conversation || !conversation.isActive) {
            return res.status(404).json({
                success: false,
                message: "Department conversation not available",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department conversation fetched successfully",
            conversation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 3. CREATE OR GET DIRECT CHAT
// =====================================

exports.getOrCreateDirectConversation = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        const { targetUserId } = req.body;

        if (!mongoose.isValidObjectId(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Valid target user ID is required",
            });
        }

        if (user._id.toString() === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot create a chat with yourself",
            });
        }

        const targetUser = await User.findOne({
            _id: targetUserId,
            status: "ACTIVE",
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Target user not found or inactive",
            });
        }

        const participantIds = [
            user._id.toString(),
            targetUser._id.toString(),
        ].sort();

        const directKey = participantIds.join("_");

        let conversation = await Conversation.findOne({
            type: "DIRECT",
            directKey,
        });

        if (!conversation) {
            try {
                conversation = await Conversation.create({
                    type: "DIRECT",
                    participants: participantIds,
                    directKey,
                    createdBy: user._id,
                });
            } catch (error) {
                if (error.code === 11000) {
                    conversation = await Conversation.findOne({
                        type: "DIRECT",
                        directKey,
                    });
                } else {
                    throw error;
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: "Direct conversation fetched successfully",
            conversation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 4. GET CONVERSATION MESSAGES
// =====================================

exports.getMessages = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        const { conversationId } = req.params;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID",
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.isActive) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const allowed = await hasConversationAccess(conversation, user);

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this conversation",
            });
        }

        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 50, 1),
            100
        );

        const page = Math.max(
            parseInt(req.query.page, 10) || 1,
            1
        );

        const messages = await Message.find({
            conversation: conversationId,
        })
            .populate("sender", "name userId role profilePicture")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Message.countDocuments({
            conversation: conversationId,
        });

        return res.status(200).json({
            success: true,
            count: messages.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            messages: messages.reverse(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 5. SEND MESSAGE
// =====================================

exports.sendMessage = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        const { conversationId, message, attachments, priority } = req.body;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Valid conversation ID is required",
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.isActive) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const allowed = await hasConversationAccess(conversation, user);

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "You cannot send messages in this conversation",
            });
        }

        const cleanMessage = (message || "").trim();
        const messageAttachments = Array.isArray(attachments)
            ? attachments
            : [];

        if (!cleanMessage && messageAttachments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message or attachment is required",
            });
        }

        const allowedPriorities = [
            "NORMAL",
            "MEDIUM",
            "HIGH",
            "URGENT",
        ];

        const selectedPriority = priority || "NORMAL";

        if (!allowedPriorities.includes(selectedPriority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message priority",
            });
        }

        const messageType =
            messageAttachments.length > 0
                ? cleanMessage
                    ? "TEXT"
                    : messageAttachments.some((file) =>
                        file.mimeType?.startsWith("image/")
                    )
                        ? "IMAGE"
                        : "FILE"
                : "TEXT";

        const newMessage = await Message.create({
            conversation: conversationId,
            sender: user._id,
            message: cleanMessage,
            messageType,
            attachments: messageAttachments,
            priority: selectedPriority,
            readBy: [
                {
                    user: user._id,
                    readAt: new Date(),
                },
            ],
        });

        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = new Date();

        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "name userId role profilePicture");

        // REAL-TIME MESSAGE BROADCAST
        const io = req.app.get("io");

        if (io) {
            io.to(conversationId.toString()).emit(
                "new_message",
                populatedMessage
            );
        }

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 6. MARK MESSAGE AS READ
// =====================================

exports.markMessageAsRead = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        const { messageId } = req.params;

        if (!mongoose.isValidObjectId(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID",
            });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        const conversation = await Conversation.findById(
            message.conversation
        );

        const allowed = await hasConversationAccess(conversation, user);

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this message",
            });
        }

        await Message.updateOne(
            {
                _id: messageId,
                "readBy.user": { $ne: user._id },
            },
            {
                $push: {
                    readBy: {
                        user: user._id,
                        readAt: new Date(),
                    },
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Message marked as read",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 7. EDIT OWN MESSAGE
// =====================================

exports.editMessage = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        const { messageId } = req.params;
        const { message } = req.body;

        if (!mongoose.isValidObjectId(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID",
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required",
            });
        }

        const existingMessage = await Message.findById(messageId);

        if (!existingMessage || existingMessage.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        if (existingMessage.sender.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can edit only your own messages",
            });
        }

        existingMessage.message = message.trim();
        existingMessage.editedAt = new Date();

        await existingMessage.save();

        return res.status(200).json({
            success: true,
            message: "Message updated successfully",
            data: existingMessage,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================
// 8. DELETE OWN MESSAGE
// =====================================

exports.deleteMessage = async (req, res) => {
    try {
        const user = await getCurrentUser(req);

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Active user not found",
            });
        }

        const { messageId } = req.params;

        if (!mongoose.isValidObjectId(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID",
            });
        }

        const existingMessage = await Message.findById(messageId);

        if (!existingMessage || existingMessage.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        if (existingMessage.sender.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can delete only your own messages",
            });
        }

        existingMessage.isDeleted = true;
        existingMessage.message = "";
        existingMessage.attachments = [];

        await existingMessage.save();

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
