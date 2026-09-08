const Contact = require("../models/Contact");

// ==========================================
// CREATE CONTACT
// ==========================================

exports.createContact = async (req, res) => {
  try {
    const {
      name,
      mobile,
      city,
      category,
      keywords,
      status,
    } = req.body;

    if (!name || !mobile || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number and category are required",
      });
    }

    const contact = await Contact.create({
      name,
      mobile,
      city,
      category,
      keywords: Array.isArray(keywords)
        ? keywords
        : keywords
          ? keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
          : [],
      status: status || "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create contact",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL CONTACTS
// ==========================================

exports.getContacts = async (req, res) => {
  try {
    const {
      search,
      category,
      city,
      status,
      sortBy = "name",
      order = "asc",
    } = req.query;

    const filter = {};

    // Search by name, mobile, city, category or keywords
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobile: {
            $regex: search,
            $options: "i",
          },
        },
        {
          city: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          keywords: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category && category !== "All Categories") {
      filter.category = category;
    }

    // City filter
    if (city && city !== "All Cities") {
      filter.city = city;
    }

    // Status filter
    if (status && status !== "All Status") {
      filter.status = status;
    }

    // Allowed sorting fields
    const allowedSortFields = [
      "name",
      "mobile",
      "city",
      "category",
      "status",
      "createdAt",
    ];

    const selectedSortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const sortOrder = order === "desc" ? -1 : 1;

    const contacts = await Contact.find(filter).sort({
      [selectedSortField]: sortOrder,
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message,
    });
  }
};

// ==========================================
// GET CONTACT BY ID
// ==========================================

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch contact",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE CONTACT
// ==========================================

exports.updateContact = async (req, res) => {
  try {
    const {
      name,
      mobile,
      city,
      category,
      keywords,
      status,
    } = req.body;

    const updateData = {
      name,
      mobile,
      city,
      category,
      status,
    };

    if (Array.isArray(keywords)) {
      updateData.keywords = keywords;
    } else if (typeof keywords === "string") {
      updateData.keywords = keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update contact",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE CONTACT
// ==========================================

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error: error.message,
    });
  }
};