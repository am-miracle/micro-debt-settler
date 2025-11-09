import { QueryInterface, DataTypes } from "sequelize";

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes,
) {
  // make creditor_id nullable
  await queryInterface.changeColumn("debts", "creditor_id", {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // add new fields for non-registered creditors
  await queryInterface.addColumn("debts", "creditor_name", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("debts", "creditor_email", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("debts", "creditor_phone", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("debts", "is_personal_reminder", {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.sequelize.query(`
    ALTER TABLE debts
    DROP CONSTRAINT IF EXISTS debtor_not_creditor
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE debts
    ADD CONSTRAINT debtor_not_creditor
    CHECK (creditor_id IS NULL OR debtor_id != creditor_id)
  `);
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes,
) {
  // Remove new fields
  await queryInterface.removeColumn("debts", "is_personal_reminder");
  await queryInterface.removeColumn("debts", "creditor_phone");
  await queryInterface.removeColumn("debts", "creditor_email");
  await queryInterface.removeColumn("debts", "creditor_name");

  // Restore creditor_id to NOT NULL
  await queryInterface.changeColumn("debts", "creditor_id", {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Restore original constraint
  await queryInterface.sequelize.query(`
    ALTER TABLE debts
    DROP CONSTRAINT IF EXISTS debtor_not_creditor
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE debts
    ADD CONSTRAINT debtor_not_creditor
    CHECK (debtor_id != creditor_id)
  `);
}
