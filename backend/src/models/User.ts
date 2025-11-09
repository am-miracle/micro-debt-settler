import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import bcrypt from "bcryptjs";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true, // null for OAuth users
      field: "password_hash",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "avatar_url",
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "google_id",
    },

    nagSensitivity: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
      allowNull: false,
      field: "nag_sensitivity",
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: "Africa/Lagos",
      allowNull: false,
    },
    locale: {
      type: DataTypes.STRING,
      defaultValue: "en-NG",
      allowNull: false,
    },
    defaultCurrency: {
      type: DataTypes.STRING(3),
      defaultValue: "NGN",
      allowNull: false,
      field: "default_currency",
    },

    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "email_notifications",
    },
    smsNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "sms_notifications",
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "push_notifications",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "is_active",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_verified",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "verified_at",
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["email"] },
      { unique: true, fields: ["google_id"] },
      { fields: ["is_active"] },
    ],
    hooks: {
      beforeCreate: async (user: any) => {
        // check both user.passwordHash and user.dataValues.passwordHash
        const password =
          user.passwordHash ||
          user.dataValues?.passwordHash ||
          user.get("passwordHash");
        if (password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          user.passwordHash = hashedPassword;
          user.setDataValue("passwordHash", hashedPassword);
        }
      },
      beforeUpdate: async (user: any) => {
        if (user.changed("passwordHash")) {
          const password =
            user.passwordHash ||
            user.dataValues?.passwordHash ||
            user.get("passwordHash");
          if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.passwordHash = hashedPassword;
            user.setDataValue("passwordHash", hashedPassword);
          }
        }
      },
    },
  },
);

// add instance method for password comparison
(User as any).prototype.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  candidatePassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};
