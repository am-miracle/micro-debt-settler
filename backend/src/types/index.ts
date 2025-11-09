export interface IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  avatar?: string;
  phone?: string;
  nagSensitivity: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

export interface IFriend {
  id: string;
  userId: string;
  friendEmail: string;
  friendName: string;
  friendPhone?: string;
  createdAt: Date;
}

export interface IDebt {
  id: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  currency: string;
  description: string;
  debtorName: string;
  creditorName: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  status:
    | "pending"
    | "ready_to_send"
    | "payment_requested"
    | "settled"
    | "cancelled";
  dueDate: Date;
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  id: string;
  debtId: string;
  paymentMethod: "stripe" | "paypal" | "manual";
  paymentId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  debtId?: string;
  type:
    | "payment_request"
    | "payment_reminder"
    | "payment_received"
    | "debt_settled";
  channel: "email" | "sms" | "push";
  sentAt: Date;
  readAt?: Date;
}

export enum NagSensitivity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// export enum DebtStatus {
//   PENDING = "pending",
//   READY_TO_SEND = "ready_to_send",
//   PAYMENT_REQUESTED = "payment_requested",
//   SETTLED = "settled",
//   CANCELLED = "cancelled",
// }
export const DebtStatus = {
  PENDING: "pending",
  PAYMENT_REQUESTED: "payment_requested",
  PAID: "paid",
  CONFIRMED: "confirmed",
  SETTLED: "settled",
  DISPUTED: "disputed",
  CANCELLED: "cancelled",
} as const;

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}
