const SalesOrder = require("../../models/salesExecutive/SalesOrder");
const SalesExecutiveLead = require("../../models/salesExecutive/SalesExecutiveLead");
const Complaint = require("../../models/salesExecutive/Complaint");
const FollowUp = require("../../models/salesExecutive/followUpModel");
const Target = require("../../models/salesExecutive/Target");
const Visit = require("../../models/superadmin/Visit");

// GET SALES EXECUTIVE DASHBOARD
exports.getDashboard = async (req, res) => {
    try {
        const executiveId =
            req.user?.userId || req.user?._id || req.user?.id;

        if (!executiveId) {
            return res.status(401).json({
                success: false,
                message: "Sales Executive authentication required",
            });
        }

        const now = new Date();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        const monthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const nextMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const [monthlyTargetData, todayVisitsCount] = await Promise.all([
            Target.findOne({
                salesExecutive: executiveId,
                periodType: "MONTHLY",
                year: currentYear,
                month: currentMonth,
                quarter: null,
            }),
            Visit.countDocuments({
                assignedTo: executiveId,
                visitDate: { $gte: todayStart, $lt: tomorrowStart },
            }),
        ]);

        const [
            todayOrders,
            pendingOrders,
            todayLeads,
            pendingComplaints,
            pendingFollowUps,
        ] = await Promise.all([
            SalesOrder.find({
                salesExecutive: executiveId,
                status: "Delivered",
                createdAt: { $gte: todayStart, $lt: tomorrowStart },
            }),

            SalesOrder.countDocuments({
                salesExecutive: executiveId,
                status: { $in: ["Draft", "Submitted"] },
            }),

            SalesExecutiveLead.countDocuments({
                assignedTo: executiveId,
                createdAt: { $gte: todayStart, $lt: tomorrowStart },
            }),

            Complaint.countDocuments({
                createdBy: executiveId,
                status: { $in: ["NEW", "ASSIGNED", "UNDER_REVIEW"] },
            }),

            FollowUp.countDocuments({
                salesExecutiveId: executiveId,
                status: "Pending",
            }),
        ]);

        const todaySales = todayOrders.reduce(
            (total, order) => total + Number(order.totalAmount || 0),
            0
        );

        return res.status(200).json({
            success: true,
            dashboard: {
                todaySales,
                todayVisits: null,
                monthlyTarget: null,
                achievement: null,
                pendingCollections: null,
                pendingOrders,
                todayLeads,
                dealerRegistrations: null,
                painterRegistrations: null,
                complaintsPending: pendingComplaints,
                notifications: null,
                pendingFollowUps,
            },
        });
    } catch (error) {
        console.error("Sales Executive Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};