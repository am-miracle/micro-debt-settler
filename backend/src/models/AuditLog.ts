import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const AuditAction = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  STATUS_CHANGED: "status_changed",
} as const;

export const AuditLog = sequelize.define(
  "AuditLog",
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
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "entity_type",
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "entity_id",
    },
    action: {
      type: DataTypes.ENUM(...Object.values(AuditAction)),
      allowNull: false,
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "old_values",
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "new_values",
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true,
      field: "ip_address",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent",
    },
  },
  {
    tableName: "audit_logs",
    timestamps: false,
    createdAt: "created_at",
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["entity_type"] },
      { fields: ["entity_id"] },
      { fields: ["created_at"] },
      { fields: ["entity_type", "entity_id"] },
    ],
  },
);

// helper function to create an audit log entry
export const createAuditLog = async (params: {
  userId: string;
  entityType: string;
  entityId: string;
  action: keyof typeof AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<any> => {
  return AuditLog.create(params);
};
