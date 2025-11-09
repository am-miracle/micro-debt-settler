import { QueryInterface, DataTypes } from "sequelize";

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes,
) {
  await queryInterface.createTable("debts", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    debtor_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    creditor_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    // amounts
    amount: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "NGN",
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    // status
    status: {
      type: Sequelize.ENUM(
        "pending",
        "payment_requested",
        "paid",
        "confirmed",
        "settled",
        "disputed",
        "cancelled",
      ),
      defaultValue: "pending",
      allowNull: false,
    },

    // dates
    due_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    payment_requested_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    paid_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    settled_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    // external integration
    calendar_event_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    receipt_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // tracking
    payment_reference: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    last_reminder_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    reminder_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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

  // add indexes
  await queryInterface.addIndex("debts", ["debtor_id"]);
  await queryInterface.addIndex("debts", ["creditor_id"]);
  await queryInterface.addIndex("debts", ["status"]);
  await queryInterface.addIndex("debts", ["due_date"]);
  await queryInterface.addIndex("debts", ["debtor_id", "status"]);
  await queryInterface.addIndex("debts", ["creditor_id", "status"]);
  await queryInterface.addIndex("debts", ["payment_reference"], {
    unique: true,
  });

  // add check constraint
  await queryInterface.sequelize.query(`
    ALTER TABLE debts
    ADD CONSTRAINT debtor_not_creditor
    CHECK (debtor_id != creditor_id)
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE debts
    ADD CONSTRAINT amount_positive
    CHECK (amount > 0)
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("debts");
}
