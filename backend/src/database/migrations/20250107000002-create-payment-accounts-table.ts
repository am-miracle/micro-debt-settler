import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create payment_accounts table
 */

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('payment_accounts', {
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
    provider_type: {
      type: Sequelize.ENUM('bank_transfer', 'paystack', 'flutterwave', 'stripe', 'paypal'),
      allowNull: false,
    },
    is_primary: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    // Bank Transfer Details
    bank_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // Payment Gateway Details
    provider_customer_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },

    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  // Add indexes
  await queryInterface.addIndex('payment_accounts', ['user_id']);
  await queryInterface.addIndex('payment_accounts', ['user_id', 'is_primary']);
  await queryInterface.addIndex('payment_accounts', ['provider_type']);
  await queryInterface.addIndex('payment_accounts', ['is_active']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('payment_accounts');
}
