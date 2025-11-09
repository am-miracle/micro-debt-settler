import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const WebhookEvent = sequelize.define(
  "WebhookEvent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "event_type",
    },
    eventId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "event_id",
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "processed_at",
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "received_at",
    },
  },
  {
    tableName: "webhook_events",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["provider"] },
      { unique: true, fields: ["event_id"] },
      { fields: ["processed"] },
      { fields: ["received_at"] },
      { fields: ["event_type"] },
    ],
  },
);

// helper function to check if webhook event already processed (idempotency)
export const isWebhookProcessed = async (eventId: string): Promise<boolean> => {
  const event = await WebhookEvent.findOne({
    where: { eventId, processed: true },
  });
  return !!event;
};

// helper function to record webhook event
export const recordWebhookEvent = async (params: {
  provider: string;
  eventType: string;
  eventId: string;
  payload: Record<string, any>;
  signature?: string;
}): Promise<any> => {
  return WebhookEvent.create(params);
};
