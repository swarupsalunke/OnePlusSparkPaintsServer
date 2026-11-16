
import Attendance from "../../models/superadmin/attendanceModel.js";
import Employee from "../../models/superadmin/employeeModel.js";

// Mark or update attendance
export const markAttendance = async (req, res) => {
    try {
        const { employee, date, status, checkIn, checkOut, remarks } = req.body;

        if (!employee || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "Employee, date and status are required",
            });
        }

        const validStatuses = ["PRESENT", "ABSENT", "HALF_DAY"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status",
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const attendanceDate = new Date(date);

        if (Number.isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance date",
            });
        }

        attendanceDate.setUTCHours(0, 0, 0, 0);

        const attendance = await Attendance.findOneAndUpdate(
            {
                employee,
                date: attendanceDate,
            },
            {
                $set: {
                    status,
                    checkIn: checkIn || "",
                    checkOut: checkOut || "",
                    remarks: remarks || "",
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        ).populate("employee", "employeeId name department designation");

        return res.status(200).json({
            success: true,
            message: "Attendance saved successfully",
            data: attendance,
        });
    } catch (error) {
        console.error("Mark Attendance Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save attendance",
            error: error.message,
        });
    }
};

// Get attendance records
export const getAttendance = async (req, res) => {
    try {
        const { date, employee } = req.query;

        const filter = {};

        if (employee) filter.employee = employee;

        if (date) {
            const attendanceDate = new Date(date);

            if (Number.isNaN(attendanceDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid attendance date",
                });
            }

            attendanceDate.setUTCHours(0, 0, 0, 0);
            filter.date = attendanceDate;
        }

        const attendance = await Attendance.find(filter)
            .populate("employee", "employeeId name department designation")
            .sort({ date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance,
        });
    } catch (error) {
        console.error("Get Attendance Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance",
            error: error.message,
        });
    }
};
