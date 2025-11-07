import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

/**
 * Transaction Enums
 */
export const TransactionType = {
  PAYMENT: "payment",
  REFUND: "refund",
  REVERSAL: "reversal",
} as const;

export const TransactionStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const ProviderType = {
  BANK_TRANSFER: "bank_transfer",
  PAYSTACK: "paystack",
  FLUTTERWAVE: "flutterwave",
  STRIPE: "stripe",
  PAYPAL: "paypal",
} as const;

/**
 * Transaction Model - Functional approach
 */
export const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    debtId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "debt_id",
      references: {
        model: "debts",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    paymentAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "payment_account_id",
      references: {
        model: "payment_accounts",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    // Transaction Details
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
    },
    transactionType: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      defaultValue: TransactionType.PAYMENT,
      allowNull: false,
      field: "transaction_type",
    },

    // Payment Method
    providerType: {
      type: DataTypes.ENUM(...Object.values(ProviderType)),
      allowNull: false,
      field: "provider_type",
    },
    providerTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "provider_transaction_id",
    },
    providerStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "provider_status",
    },
    providerMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "provider_metadata",
    },

    // Status
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      defaultValue: TransactionStatus.PENDING,
      allowNull: false,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "failure_reason",
    },

    // Bank Transfer Specific
    bankTransferReference: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "bank_transfer_reference",
    },
    bankTransferProofUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "bank_transfer_proof_url",
    },

    // Dates
    initiatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "initiated_at",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "failed_at",
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["debt_id"] },
      { fields: ["payment_account_id"] },
      { fields: ["provider_transaction_id"] },
      { fields: ["status"] },
      { fields: ["provider_type"] },
      { fields: ["created_at"] },
    ],
  },
);
