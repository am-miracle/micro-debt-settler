import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const PaymentAccount = sequelize.define(
  "PaymentAccount",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    providerType: {
      type: DataTypes.ENUM(
        "bank_transfer",
        "paystack",
        "flutterwave",
        "stripe",
        "paypal",
      ),
      allowNull: false,
      field: "provider_type",
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_primary",
    },

    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "bank_name",
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "account_number",
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "account_name",
    },

    providerCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "provider_customer_id",
    },
    providerMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "provider_metadata",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "is_active",
    },
  },
  {
    tableName: "payment_accounts",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "is_primary"] },
      { fields: ["provider_type"] },
      { fields: ["is_active"] },
    ],
  },
);
