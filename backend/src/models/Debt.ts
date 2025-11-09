import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { DebtStatus } from "../types";

export const Debt = sequelize.define(
  "Debt",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    debtorId: {
      type: DataTypes.UUID,
      allowNull: true, // optional for non-registered debtors (receivable debts)
      field: "debtor_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // non-registered debtor info (for receivable debt reminders)
    debtorName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "debtor_name",
    },
    debtorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "debtor_email",
    },
    debtorPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "debtor_phone",
    },
    creditorId: {
      type: DataTypes.UUID,
      allowNull: true, // optional for non-registered creditors
      field: "creditor_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // non-registered creditor info (for personal reminders)
    creditorName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "creditor_name",
    },
    creditorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "creditor_email",
    },
    creditorPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "creditor_phone",
    },
    isPersonalReminder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_personal_reminder",
    },

    // payment Method
    paymentMethod: {
      type: DataTypes.ENUM(
        "bank_transfer",
        "paystack",
        "flutterwave",
        "stripe",
        "paypal",
        "manual",
      ),
      allowNull: true,
      field: "payment_method",
    },

    // bank transfer details (for bank_transfer payment method)
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "bank_name",
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "account_name",
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "account_number",
    },

    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "NGN",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(DebtStatus)),
      defaultValue: DebtStatus.PENDING,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "due_date",
    },
    paymentRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "payment_requested_at",
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "paid_at",
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "settled_at",
    },

    // external integration
    calendarEventId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "calendar_event_id",
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "receipt_url",
    },

    paymentReference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "payment_reference",
    },
    lastReminderAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_reminder_at",
    },
    reminderCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "reminder_count",
    },
  },
  {
    tableName: "debts",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["debtor_id"] },
      { fields: ["creditor_id"] },
      { fields: ["status"] },
      { fields: ["due_date"] },
      { fields: ["debtor_id", "status"] },
      { fields: ["creditor_id", "status"] },
      { unique: true, fields: ["payment_reference"] },
    ],
    validate: {
      debtorNotCreditor(this: any) {
        if (
          this.creditorId &&
          this.debtorId &&
          this.debtorId === this.creditorId
        ) {
          throw new Error("Debtor and creditor cannot be the same user");
        }
      },
      hasCreditorInfo(this: any) {
        // either creditorId or (creditorName/email/phone) must be provided
        if (
          !this.creditorId &&
          !this.creditorName &&
          !this.creditorEmail &&
          !this.creditorPhone
        ) {
          throw new Error(
            "Must provide either creditorId or creditor contact information",
          );
        }
      },
      hasDebtorInfo(this: any) {
        // either debtorId OR (debtorName/email/phone) must be provided
        if (
          !this.debtorId &&
          !this.debtorName &&
          !this.debtorEmail &&
          !this.debtorPhone
        ) {
          throw new Error(
            "Must provide either debtorId or debtor contact information",
          );
        }
      },
    },
    hooks: {
      beforeValidate: (debt: any) => {
        // generate payment reference if not provided
        if (!debt.paymentReference) {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000);
          debt.paymentReference = `MDS-${debt.id?.substring(0, 8) || "NEW"}-${timestamp}-${random}`;
        }
      },
    },
  },
);
