import { QueryInterface, DataTypes } from "sequelize";

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes,
) {
  await queryInterface.createTable("notifications", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    debt_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "debts",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    type: {
      type: Sequelize.ENUM(
        "payment_request",
        "reminder",
        "payment_received",
        "settled",
        "dispute",
        "cancelled",
      ),
      allowNull: false,
    },
    channel: {
      type: Sequelize.ENUM("email", "sms", "push", "in_app"),
      allowNull: false,
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    status: {
      type: Sequelize.ENUM("pending", "sent", "delivered", "failed", "read"),
      defaultValue: "pending",
      allowNull: false,
    },
    sent_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    read_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    failed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    failure_reason: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    provider: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider_message_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  // Add ndexes
  await queryInterface.addIndex("notifications", ["user_id"]);
  await queryInterface.addIndex("notifications", ["debt_id"]);
  await queryInterface.addIndex("notifications", ["type"]);
  await queryInterface.addIndex("notifications", ["status"]);
  await queryInterface.addIndex("notifications", ["created_at"]);
  await queryInterface.addIndex("notifications", ["user_id", "read_at"]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("notifications");
}
