import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create transactions table
 */

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('transactions', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    debt_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'debts',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    payment_account_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'payment_accounts',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },

    // Transaction Details
    amount: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
    },
    transaction_type: {
      type: Sequelize.ENUM('payment', 'refund', 'reversal'),
      defaultValue: 'payment',
      allowNull: false,
    },

    // Payment Method
    provider_type: {
      type: Sequelize.ENUM('bank_transfer', 'paystack', 'flutterwave', 'stripe', 'paypal'),
      allowNull: false,
    },
    provider_transaction_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider_status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    provider_metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },

    // Status
    status: {
      type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    failure_reason: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    // Bank Transfer Specific
    bank_transfer_reference: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bank_transfer_proof_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // Dates
    initiated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    failed_at: {
      type: Sequelize.DATE,
      allowNull: true,
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
  await queryInterface.addIndex('transactions', ['debt_id']);
  await queryInterface.addIndex('transactions', ['payment_account_id']);
  await queryInterface.addIndex('transactions', ['provider_transaction_id']);
  await queryInterface.addIndex('transactions', ['status']);
  await queryInterface.addIndex('transactions', ['provider_type']);
  await queryInterface.addIndex('transactions', ['created_at']);

  // Add check constraint
  await queryInterface.sequelize.query(`
    ALTER TABLE transactions
    ADD CONSTRAINT transaction_amount_positive
    CHECK (amount > 0)
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('transactions');
}
