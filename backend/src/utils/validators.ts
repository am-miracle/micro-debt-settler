import { body, param, query } from "express-validator";

export const authValidators = {
  register: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Valid phone number is required"),
    body("nagSensitivity")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Nag sensitivity must be low, medium, or high"),
  ],
  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  refreshToken: [
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  ],
};

export const debtValidators = {
  create: [
    // Either creditorId OR (creditorName/Email/Phone) must be provided
    body("creditorId")
      .optional()
      .isUUID()
      .withMessage("Valid creditor ID is required"),
    body("creditorName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Creditor name cannot be empty"),
    body("creditorEmail")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid creditor email is required"),
    body("creditorPhone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Valid creditor phone is required"),
    body().custom((value) => {
      // At least creditorId OR one of (creditorName, creditorEmail, creditorPhone) must exist
      if (
        !value.creditorId &&
        !value.creditorName &&
        !value.creditorEmail &&
        !value.creditorPhone
      ) {
        throw new Error(
          "Either creditorId or creditor contact info (name/email/phone) is required",
        );
      }
      return true;
    }),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("currency")
      .isLength({ min: 3, max: 3 })
      .toUpperCase()
      .withMessage("Valid 3-letter currency code is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("debtorName").optional().trim(),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),
    body("bankName").optional().trim(),
    body("accountName").optional().trim(),
    body("accountNumber").optional().trim(),
    body("calendarEventId").optional().isString(),
  ],
  createReceivable: [
    // Either debtorId OR (debtorName/Email/Phone) must be provided
    body("debtorId")
      .optional()
      .isUUID()
      .withMessage("Valid debtor ID is required"),
    body("debtorName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Debtor name cannot be empty"),
    body("debtorEmail")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid debtor email is required"),
    body("debtorPhone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Valid debtor phone is required"),
    body().custom((value) => {
      // At least debtorId OR one of (debtorName, debtorEmail, debtorPhone) must exist
      if (
        !value.debtorId &&
        !value.debtorName &&
        !value.debtorEmail &&
        !value.debtorPhone
      ) {
        throw new Error(
          "Either debtorId or debtor contact info (name/email/phone) is required",
        );
      }
      return true;
    }),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("currency")
      .isLength({ min: 3, max: 3 })
      .toUpperCase()
      .withMessage("Valid 3-letter currency code is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("creditorName").optional().trim(),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),
    body("bankName").optional().trim(),
    body("accountName").optional().trim(),
    body("accountNumber").optional().trim(),
    body("calendarEventId").optional().isString(),
  ],
  update: [
    param("id").isUUID().withMessage("Valid debt ID is required"),
    body("amount")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("status")
      .optional()
      .isIn([
        "pending",
        "ready_to_send",
        "payment_requested",
        "settled",
        "cancelled",
      ])
      .withMessage("Invalid status"),
  ],
  getById: [param("id").isUUID().withMessage("Valid debt ID is required")],
  delete: [param("id").isUUID().withMessage("Valid debt ID is required")],
  getDebts: [
    query("status")
      .optional()
      .isIn([
        "pending",
        "ready_to_send",
        "payment_requested",
        "settled",
        "cancelled",
      ]),
    query("debtorId").optional().isUUID(),
    query("creditorId").optional().isUUID(),
    query("fromDate").optional().isISO8601(),
    query("toDate").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  getByDirection: [
    param("direction")
      .isIn(["owed", "receivable"])
      .withMessage('Direction must be "owed" or "receivable"'),
    query("status")
      .optional()
      .isIn([
        "pending",
        "ready_to_send",
        "payment_requested",
        "settled",
        "cancelled",
      ]),
    query("fromDate").optional().isISO8601(),
    query("toDate").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
};

export const friendValidators = {
  add: [
    body("friendEmail")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("friendName").trim().notEmpty().withMessage("Friend name is required"),
    body("friendPhone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Valid phone number is required"),
  ],
  update: [
    param("id").isUUID().withMessage("Valid friend ID is required"),
    body("friendName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Friend name cannot be empty"),
    body("friendPhone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Valid phone number is required"),
  ],
  getById: [param("id").isUUID().withMessage("Valid friend ID is required")],
  delete: [param("id").isUUID().withMessage("Valid friend ID is required")],
  searchUser: [
    query("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
  ],
};

export const userValidators = {
  updateProfile: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("phone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Valid phone number is required"),
    body("nagSensitivity")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Nag sensitivity must be low, medium, or high"),
  ],
  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
  ],
  deleteAccount: [
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

export const paymentValidators = {
  initiatePayment: [
    param("debtId").isUUID().withMessage("Valid debt ID is required"),
  ],
  recordManual: [
    param("debtId").isUUID().withMessage("Valid debt ID is required"),
  ],
};
