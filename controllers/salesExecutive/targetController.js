
const mongoose = require("mongoose");
const Target = require("../../models/salesExecutive/Target");
const SalesOrder = require("../../models/salesExecutive/SalesOrder");
const User = require("../../models/superadmin/User");


const isValidId = (id) => mongoose.isValidObjectId(id);

const getPeriodDates = (periodType, year, month, quarter) => {
    if (periodType === "MONTHLY") {
        return {
            start: new Date(year, month - 1, 1),
            end: new Date(year, month, 1),
        };
    }

    if (periodType === "QUARTERLY") {
        const startMonth = (quarter - 1) * 3;
        return {
            start: new Date(year, startMonth, 1),
            end: new Date(year, startMonth + 3, 1),
        };
    }

    return {
        start: new Date(year, 0, 1),
        end: new Date(year + 1, 0, 1),
    };
};

const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return {
        year,
        month,
        quarter: Math.ceil(month / 3),
    };
};

const getDeliveredSales = async (salesExecutive, start, end) => {
    const match = {
        status: "Delivered",
        createdAt: { $gte: start, $lt: end },
    };

    if (salesExecutive) {
        match.salesExecutive = new mongoose.Types.ObjectId(
            String(salesExecutive)
        );
    }

    const [result] = await SalesOrder.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                salesValue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 },
                productVolume: {
                    $sum: {
                        $sum: "$items.quantity",
                    },
                },
            },
        },
    ]);

    return {
        salesValue: result?.salesValue || 0,
        orderCount: result?.orderCount || 0,
        productVolume: result?.productVolume || 0,
    };
};

const calculateAchievement = (achieved, target) => ({
    targetAmount: target || 0,
    achievedAmount: achieved || 0,
    remainingAmount: Math.max((target || 0) - (achieved || 0), 0),
    achievementPercent:
        target > 0
            ? Number(((achieved / target) * 100).toFixed(2))
            : 0,
    targetAssigned: target > 0,
});

const assignTarget = async (req, res) => {
    try {
        const allowedRoles = ["SUPER_ADMIN", "DIRECTOR", "MANAGER"];

        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to assign targets",
            });
        }
        const {
            salesExecutive,
            periodType,
            year,
            month,
            quarter,
            targetAmount,
            incentiveTargetPercent = 100,
            remarks = "",
        } = req.body;

        if (!isValidId(salesExecutive)) {
            return res.status(400).json({
                success: false,
                message: "Valid Sales Executive ID is required",
            });
        }

        if (!["MONTHLY", "QUARTERLY", "ANNUAL"].includes(periodType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid target period type",
            });
        }

        const numericYear = Number(year);
        const numericTarget = Number(targetAmount);
        const numericIncentive = Number(incentiveTargetPercent);

        if (!Number.isInteger(numericYear) || numericYear < 2020) {
            return res.status(400).json({
                success: false,
                message: "Valid target year is required",
            });
        }

        if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
            return res.status(400).json({
                success: false,
                message: "Target amount must be greater than zero",
            });
        }

        if (
            !Number.isFinite(numericIncentive) ||
            numericIncentive < 0 ||
            numericIncentive > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Incentive target percentage must be between 0 and 1000",
            });
        }

        const numericMonth = Number(month);
        const numericQuarter = Number(quarter);

        if (
            periodType === "MONTHLY" &&
            (!Number.isInteger(numericMonth) ||
                numericMonth < 1 ||
                numericMonth > 12)
        ) {
            return res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12",
            });
        }

        if (
            periodType === "QUARTERLY" &&
            (!Number.isInteger(numericQuarter) ||
                numericQuarter < 1 ||
                numericQuarter > 4)
        ) {
            return res.status(400).json({
                success: false,
                message: "Quarter must be between 1 and 4",
            });
        }

        const executive = await User.findOne({
            _id: salesExecutive,
            role: "SALES_EXECUTIVE",
            status: "ACTIVE",
        });

        if (!executive) {
            return res.status(404).json({
                success: false,
                message: "Active Sales Executive not found",
            });
        }

        const targetData = {
            salesExecutive,
            periodType,
            year: numericYear,
            month: periodType === "MONTHLY" ? numericMonth : null,
            quarter: periodType === "QUARTERLY" ? numericQuarter : null,
            targetAmount: numericTarget,
            incentiveTargetPercent: numericIncentive,
            remarks: String(remarks).trim(),
            assignedBy: req.user.userId,
        };

        const target = await Target.findOneAndUpdate(
            {
                salesExecutive,
                periodType,
                year: numericYear,
                month: targetData.month,
                quarter: targetData.quarter,
            },
            { $set: targetData },
            { new: true, upsert: true, runValidators: true }
        ).populate("salesExecutive", "name email userId");

        return res.status(200).json({
            success: true,
            message: "Target assigned successfully",
            target,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign target",
            error: error.message,
        });
    }
};

const getMyTargetDashboard = async (req, res) => {
    try {
        const salesExecutiveId = req.user?.userId;

        if (!isValidId(salesExecutiveId)) {
            return res.status(401).json({
                success: false,
                message: "Valid Sales Executive authentication required",
            });
        }

        const { year, month, quarter } = getCurrentPeriod();

        const periods = [
            {
                periodType: "MONTHLY",
                year,
                month,
                quarter: null,
            },
            {
                periodType: "QUARTERLY",
                year,
                month: null,
                quarter,
            },
            {
                periodType: "ANNUAL",
                year,
                month: null,
                quarter: null,
            },
        ];

        const dashboard = await Promise.all(
            periods.map(async (period) => {
                const target = await Target.findOne({
                    salesExecutive: salesExecutiveId,
                    periodType: period.periodType,
                    year: period.year,
                    month: period.month,
                    quarter: period.quarter,
                });

                const { start, end } = getPeriodDates(
                    period.periodType,
                    year,
                    month,
                    quarter
                );

                const actual = await getDeliveredSales(
                    salesExecutiveId,
                    start,
                    end
                );

                const achievement = calculateAchievement(
                    actual.salesValue,
                    target?.targetAmount || 0
                );

                const incentiveThreshold =
                    target?.incentiveTargetPercent ?? 100;

                return {
                    periodType: period.periodType,
                    year,
                    month: period.periodType === "MONTHLY" ? month : undefined,
                    quarter: period.periodType === "QUARTERLY" ? quarter : undefined,
                    targetAssigned: Boolean(target),
                    targetAmount: target?.targetAmount || 0,
                    achievedAmount: actual.salesValue,
                    remainingAmount: achievement.remainingAmount,
                    achievementPercent: achievement.achievementPercent,
                    orderCount: actual.orderCount,
                    productVolume: actual.productVolume,
                    incentiveTargetPercent: incentiveThreshold,
                    incentiveEligible:
                        Boolean(target) &&
                        achievement.achievementPercent >= incentiveThreshold,
                };
            })
        );

        const monthly = dashboard.find((item) => item.periodType === "MONTHLY");

        return res.status(200).json({
            success: true,
            message: "Target dashboard fetched successfully",
            period: { year, month, quarter },
            salesRule: "Only Delivered orders count toward sales achievement",
            dashboard,
            performanceIndicators: {
                salesValue: monthly?.achievedAmount || 0,
                deliveredOrders: monthly?.orderCount || 0,
                productVolume: monthly?.productVolume || 0,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch target dashboard",
            error: error.message,
        });
    }
};

const getTargets = async (req, res) => {
    try {

        const allowedRoles = [
            "SUPER_ADMIN",
            "DIRECTOR",
            "MANAGER",
            "SALES_EXECUTIVE",
        ];

        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view targets",
            });
        }
        const filter = {};

        if (req.user.role === "SALES_EXECUTIVE") {
            filter.salesExecutive = req.user.userId;
        } else if (req.query.salesExecutive) {
            if (!isValidId(req.query.salesExecutive)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Sales Executive ID",
                });
            }

            filter.salesExecutive = req.query.salesExecutive;
        }

        if (req.query.year) filter.year = Number(req.query.year);
        if (req.query.periodType) filter.periodType = req.query.periodType;

        const targets = await Target.find(filter)
            .populate("salesExecutive", "name email userId")
            .populate("assignedBy", "name email")
            .sort({ year: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: targets.length,
            targets,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch targets",
            error: error.message,
        });
    }
};

const getTargetLeaderboard = async (req, res) => {
    try {
        const { year, month } = getCurrentPeriod();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const targets = await Target.find({
            periodType: "MONTHLY",
            year,
            month,
        }).populate("salesExecutive", "name email userId");

        const leaderboard = await Promise.all(
            targets.map(async (target) => {
                const actual = await getDeliveredSales(
                    target.salesExecutive._id,
                    start,
                    end
                );

                return {
                    salesExecutive: target.salesExecutive,
                    targetAmount: target.targetAmount,
                    achievedAmount: actual.salesValue,
                    achievementPercent: calculateAchievement(
                        actual.salesValue,
                        target.targetAmount
                    ).achievementPercent,
                };
            })
        );

        leaderboard.sort(
            (a, b) => b.achievementPercent - a.achievementPercent
        );

        return res.status(200).json({
            success: true,
            period: { year, month },
            salesRule: "Only Delivered orders count toward sales achievement",
            leaderboard,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leaderboard",
            error: error.message,
        });
    }
};

module.exports = {
    assignTarget,
    getMyTargetDashboard,
    getTargets,
    getTargetLeaderboard,
};
