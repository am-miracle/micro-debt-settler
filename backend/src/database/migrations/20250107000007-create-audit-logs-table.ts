import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create audit_logs table
 */

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('audit_logs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    entity_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    entity_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    action: {
      type: Sequelize.ENUM('created', 'updated', 'deleted', 'status_changed'),
      allowNull: false,
    },
    old_values: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    new_values: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: Sequelize.INET,
      allowNull: true,
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  // Add indexes
  await queryInterface.addIndex('audit_logs', ['user_id']);
  await queryInterface.addIndex('audit_logs', ['entity_type']);
  await queryInterface.addIndex('audit_logs', ['entity_id']);
  await queryInterface.addIndex('audit_logs', ['created_at']);
  await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('audit_logs');
}
