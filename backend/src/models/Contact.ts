import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

// contact model
// supports both registered and non-registered users
export const Contact = sequelize.define(
  "Contact",
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
    contactUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "contact_user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // contact info (for non-registered users or cached data)
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // metadata
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      {
        unique: true,
        fields: ["user_id", "email"],
        name: "unique_user_contact_email",
      },
      { fields: ["contact_user_id"] },
    ],
  },
);
