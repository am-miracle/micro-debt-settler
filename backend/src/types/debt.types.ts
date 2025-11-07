export interface CreateDebtDTO {
  creditorId?: string; // Optional if using non-registered creditor
  creditorName?: string; // For non-registered creditors
  creditorEmail?: string; // For non-registered creditors
  creditorPhone?: string; // For non-registered creditors
  amount: number;
  currency: string;
  description: string;
  debtorName?: string;
  dueDate?: string; // Optional manual due date
  paymentMethod?:
    | "bank_transfer"
    | "paystack"
    | "flutterwave"
    | "stripe"
    | "paypal"
    | "manual";
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  calendarEventId?: string;
}

export interface CreateReceivableDebtDTO {
  debtorId?: string; // Optional if using non-registered debtor
  debtorName?: string; // For non-registered debtors
  debtorEmail?: string; // For non-registered debtors
  debtorPhone?: string; // For non-registered debtors
  amount: number;
  currency: string;
  description: string;
  creditorName?: string;
  dueDate?: string; // Optional manual due date
  paymentMethod?:
    | "bank_transfer"
    | "paystack"
    | "flutterwave"
    | "stripe"
    | "paypal"
    | "manual";
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  calendarEventId?: string;
}

export interface UpdateDebtDTO {
  amount?: number;
  description?: string;
  status?:
    | "pending"
    | "ready_to_send"
    | "payment_requested"
    | "settled"
    | "cancelled";
}

export interface DebtQueryParams {
  status?: string;
  debtorId?: string;
  creditorId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export type DebtDirection = "owed" | "receivable";
