import { User } from "./User";
import { PaymentAccount } from "./PaymentAccount";
import { Contact } from "./Contact";
import { Debt } from "./Debt";
import { Transaction } from "./Transaction";
import { Notification } from "./Notification";
import { AuditLog } from "./AuditLog";
import { WebhookEvent } from "./WebhookEvent";

// Initialize all model associations
export const initializeAssociations = () => {
  // User associations
  User.hasMany(PaymentAccount, {
    foreignKey: "userId",
    as: "paymentAccounts",
    onDelete: "CASCADE",
  });

  User.hasMany(Contact, {
    foreignKey: "userId",
    as: "contacts",
    onDelete: "CASCADE",
  });

  User.hasMany(Debt, {
    foreignKey: "debtorId",
    as: "owedDebts",
    onDelete: "CASCADE",
  });

  User.hasMany(Debt, {
    foreignKey: "creditorId",
    as: "receivableDebts",
    onDelete: "CASCADE",
  });

  User.hasMany(Notification, {
    foreignKey: "userId",
    as: "notifications",
    onDelete: "CASCADE",
  });

  User.hasMany(AuditLog, {
    foreignKey: "userId",
    as: "auditLogs",
    onDelete: "CASCADE",
  });

  // PaymentAccount associations
  PaymentAccount.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  PaymentAccount.hasMany(Transaction, {
    foreignKey: "paymentAccountId",
    as: "transactions",
    onDelete: "SET NULL",
  });

  // Contact associations
  Contact.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Contact.belongsTo(User, {
    foreignKey: "contactUserId",
    as: "contactUser",
  });

  // Debt associations
  Debt.belongsTo(User, {
    foreignKey: "debtorId",
    as: "debtor",
  });

  Debt.belongsTo(User, {
    foreignKey: "creditorId",
    as: "creditor",
  });

  Debt.hasMany(Transaction, {
    foreignKey: "debtId",
    as: "transactions",
    onDelete: "CASCADE",
  });

  Debt.hasMany(Notification, {
    foreignKey: "debtId",
    as: "notifications",
    onDelete: "SET NULL",
  });

  // Transaction associations
  Transaction.belongsTo(Debt, {
    foreignKey: "debtId",
    as: "debt",
  });

  Transaction.belongsTo(PaymentAccount, {
    foreignKey: "paymentAccountId",
    as: "paymentAccount",
  });

  // Notification associations
  Notification.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Notification.belongsTo(Debt, {
    foreignKey: "debtId",
    as: "debt",
  });

  // AuditLog associations
  AuditLog.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // WebhookEvent has no associations (standalone table)
};

// Export all models
export {
  User,
  PaymentAccount,
  Contact,
  Debt,
  Transaction,
  Notification,
  AuditLog,
  WebhookEvent,
};

// Export enums for convenience
export { DebtStatus } from "./Debt";
export {
  TransactionType,
  TransactionStatus,
  ProviderType,
} from "./Transaction";
export {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from "./Notification";
export { AuditAction } from "./AuditLog";

// Export helper functions
export { hashPassword, comparePassword } from "./User";
export { createAuditLog } from "./AuditLog";
export { isWebhookProcessed, recordWebhookEvent } from "./WebhookEvent";
