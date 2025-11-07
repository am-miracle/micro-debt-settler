import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

/**
 * Notification Enums
 */
export const NotificationType = {
  DEBT_CREATED: "debt_created",
  DEBT_ACKNOWLEDGED: "debt_acknowledged",
  PAYMENT_REQUEST: "payment_request",
  REMINDER: "reminder",
  PAYMENT_REMINDER: "payment_reminder",
  PAYMENT_RECEIVED: "payment_received",
  DEBT_SETTLED: "debt_settled",
  SETTLED: "settled",
  DISPUTE: "dispute",
  CANCELLED: "cancelled",
} as const;

export const NotificationChannel = {
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
  IN_APP: "in_app",
} as const;

export const NotificationStatus = {
  PENDING: "pending",
  SENT: "sent",
  DELIVERED: "delivered",
  FAILED: "failed",
  READ: "read",
} as const;

/**
 * Notification Model - Functional approach
 */
export const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for non-registered users
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "recipient_email",
    },
    recipientPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "recipient_phone",
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "recipient_name",
    },
    debtId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "debt_id",
      references: {
        model: "debts",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    // Notification Details
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM(...Object.values(NotificationChannel)),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Delivery Status
    status: {
      type: DataTypes.ENUM(...Object.values(NotificationStatus)),
      defaultValue: NotificationStatus.PENDING,
      allowNull: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "sent_at",
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "delivered_at",
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "failed_at",
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "failure_reason",
    },

    // Provider Details
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    providerMessageId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "provider_message_id",
    },
    providerMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "provider_metadata",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["debt_id"] },
      { fields: ["type"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
      { fields: ["user_id", "read_at"] }, // for unread notifications
    ],
  },
);
