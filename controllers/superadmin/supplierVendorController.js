const SupplierVendor = require("../../models/superadmin/SupplierVendor");

// CREATE SUPPLIER
exports.createSupplier = async (req, res) => {
  try {
    const {
      supplierCompanyName,
      contactPersonName,
      mobileNo,
      mobileNo2,
      gstNo,
      paymentTerms,
      address,
      pincode,
      state,
      items,
    } = req.body;

    const supplier = await SupplierVendor.create({
      supplierCompanyName,
      contactPersonName,
      mobileNo,
      mobileNo2,
      gstNo,
      paymentTerms,
      address,
      pincode,
      state,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL SUPPLIERS
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierVendor.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE SUPPLIER
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await SupplierVendor.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE SUPPLIER
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await SupplierVendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE SUPPLIER
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await SupplierVendor.findByIdAndDelete(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};