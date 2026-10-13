
const User = require("../../models/superadmin/User");

// GET LOGGED-IN SALES EXECUTIVE PROFILE
exports.getSalesProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user.userId,
            role: "SALES_EXECUTIVE",
        }).select("-password -kyc.aadhaarNumber -kyc.panNumber -kyc.bankAccountNumber");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Sales Executive profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            profile: user,
        });
    } catch (error) {
        console.error("Get sales profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

// UPDATE LOGGED-IN SALES EXECUTIVE PROFILE
exports.updateSalesProfile = async (req, res) => {
    try {
        const {
            name,
            mobile,
            dateOfBirth,
            gender,
            addressLine1,
            addressLine2,
            country,
            state,
            district,
            city,
            pinCode,
        } = req.body;

        // Parse emergency contact sent through FormData
        let emergencyContact = req.body.emergencyContact;

        if (typeof emergencyContact === "string") {
            try {
                emergencyContact = JSON.parse(emergencyContact);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid emergency contact details",
                });
            }
        }

        const user = await User.findOne({
            _id: req.user.userId,
            role: "SALES_EXECUTIVE",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Sales Executive profile not found",
            });
        }

        // Update profile picture when a new image is uploaded
        if (req.file) {
            user.profilePicture = `/uploads/profiles/${req.file.filename}`;
        }

        // Update name
        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty",
                });
            }

            user.name = String(name).trim();
        }

        // Update mobile
        if (mobile !== undefined) {
            const normalizedMobile = String(mobile).trim();

            if (!normalizedMobile) {
                return res.status(400).json({
                    success: false,
                    message: "Mobile number cannot be empty",
                });
            }

            const existingMobile = await User.findOne({
                mobile: normalizedMobile,
                _id: { $ne: user._id },
            });

            if (existingMobile) {
                return res.status(409).json({
                    success: false,
                    message: "This mobile number is already registered",
                });
            }

            user.mobile = normalizedMobile;
        }

        // Update date of birth
        if (dateOfBirth !== undefined) {
            if (dateOfBirth === "" || dateOfBirth === null) {
                user.dateOfBirth = null;
            } else {
                const parsedDate = new Date(dateOfBirth);

                if (Number.isNaN(parsedDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid date of birth",
                    });
                }

                user.dateOfBirth = parsedDate;
            }
        }

        // Update personal and address details
        if (gender !== undefined) user.gender = String(gender).trim();
        if (addressLine1 !== undefined) user.addressLine1 = String(addressLine1).trim();
        if (addressLine2 !== undefined) user.addressLine2 = String(addressLine2).trim();
        if (country !== undefined) user.country = String(country).trim();
        if (state !== undefined) user.state = String(state).trim();
        if (district !== undefined) user.district = String(district).trim();
        if (city !== undefined) user.city = String(city).trim();
        if (pinCode !== undefined) user.pinCode = String(pinCode).trim();

        // Update emergency contact
        if (emergencyContact !== undefined) {
            if (
                !emergencyContact ||
                typeof emergencyContact !== "object" ||
                Array.isArray(emergencyContact)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid emergency contact details",
                });
            }

            if (emergencyContact.name !== undefined) {
                user.set(
                    "kyc.emergencyContact.name",
                    String(emergencyContact.name).trim()
                );
            }

            if (emergencyContact.mobile !== undefined) {
                user.set(
                    "kyc.emergencyContact.mobile",
                    String(emergencyContact.mobile).trim()
                );
            }

            if (emergencyContact.relation !== undefined) {
                user.set(
                    "kyc.emergencyContact.relation",
                    String(emergencyContact.relation).trim()
                );
            }
        }

        await user.save();

        const updatedProfile = await User.findById(user._id).select(
            "-password -kyc.aadhaarNumber -kyc.panNumber -kyc.bankAccountNumber"
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: updatedProfile,
        });
    } catch (error) {
        console.error("Update sales profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
