export interface StripePaymentIntent {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    debtId: string;
    debtorId: string;
    creditorId: string;
  };
}

export interface PayPalOrderRequest {
  intent: "CAPTURE";
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description: string;
  }>;
  application_context: {
    return_url: string;
    cancel_url: string;
  };
}

export interface PaystackPaymentRequest {
  amount: number;
  email: string;
  reference: string;
  currency: string;
  metadata: {
    debtId: string;
    debtorId: string;
    creditorId: string;
  };
}

export interface FlutterwavePaymentRequest {
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
  };
  tx_ref: string;
  meta: {
    debtId: string;
    debtorId: string;
    creditorId: string;
  };
}

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  currency: string;
  reference?: string;
}

export interface PaymentLinkDetails {
  provider: "paystack" | "flutterwave" | "opay" | "kuda" | "palmpay";
  link: string;
  amount: number;
  currency: string;
  description: string;
}

export interface DeepLinkDetails {
  app: string;
  url: string;
  fallbackUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentMethod:
    | "stripe"
    | "paypal"
    | "paystack"
    | "flutterwave"
    | "bank_transfer"
    | "payment_link"
    | "manual";
  paymentId?: string;
  paymentUrl?: string;
  bankDetails?: BankTransferDetails;
  paymentLink?: PaymentLinkDetails;
  deepLink?: DeepLinkDetails;
  message?: string;
  error?: string;
}

export interface WebhookEvent {
  type: string;
  data: any;
  signature: string;
}

export type PaymentProvider =
  | "stripe"
  | "paypal"
  | "paystack"
  | "flutterwave"
  | "bank_transfer"
  | "opay"
  | "kuda"
  | "palmpay"
  | "manual";

export interface UserPaymentPreference {
  provider: PaymentProvider;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  paystackLink?: string;
  flutterwaveLink?: string;
  walletHandle?: string;
}
