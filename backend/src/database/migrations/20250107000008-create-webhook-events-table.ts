import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create webhook_events table
 */

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('webhook_events', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    provider: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    event_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    event_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    payload: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    signature: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    processed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    processed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    error: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    received_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  // Add indexes
  await queryInterface.addIndex('webhook_events', ['provider']);
  await queryInterface.addIndex('webhook_events', ['event_id'], { unique: true });
  await queryInterface.addIndex('webhook_events', ['processed']);
  await queryInterface.addIndex('webhook_events', ['received_at']);
  await queryInterface.addIndex('webhook_events', ['event_type']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('webhook_events');
}
