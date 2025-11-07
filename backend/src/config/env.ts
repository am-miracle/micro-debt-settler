import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  database_url: string;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  email: {
    resendApiKey: string;
    from: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    mode: string;
  };
  paystack: {
    secretKey: string;
    publicKey: string;
  };
  flutterwave: {
    secretKey: string;
    publicKey: string;
    encryptionKey: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  app: {
    name: string;
    url: string;
    frontendUrls: string[];
  };
  debt: {
    defaultDeadlineHours: number;
    defaultNagSensitivity: "low" | "medium" | "high";
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
    file: string;
  };
  payment: {
    defaultCurrency: string;
    supportBankTransfer: boolean;
    bankTransferReferencePrefix: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8000", 10),
  apiVersion: process.env.API_VERSION || "v1",
  database_url: process.env.DATABASE_URL!,
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    from:
      process.env.EMAIL_FROM || "Micro Debt Settler <noreply@yourdomain.com>",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    mode: process.env.PAYPAL_MODE || "sandbox",
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || "",
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
  },
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || "",
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || "",
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || "",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  },
  app: {
    name: process.env.APP_NAME || "Micro Debt Settler",
    url: process.env.APP_URL || "http://localhost:8000",
    frontendUrls: process.env.FRONTEND_URLS
      ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
      : ["http://localhost:3000"],
  },
  debt: {
    defaultDeadlineHours: parseInt(
      process.env.DEFAULT_PAYMENT_DEADLINE_HOURS || "24",
      10,
    ),
    defaultNagSensitivity:
      (process.env.DEFAULT_NAG_SENSITIVITY as "low" | "medium" | "high") ||
      "medium",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },
  payment: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || "NGN",
    supportBankTransfer: process.env.SUPPORT_BANK_TRANSFER === "true",
    bankTransferReferencePrefix:
      process.env.BANK_TRANSFER_REFERENCE_PREFIX || "MDS",
  },
};
