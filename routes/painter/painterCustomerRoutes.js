const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
} = require("../../controllers/painter/painterCustomerController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  createCustomer
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getCustomers
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getCustomerById
);

module.exports = router;