import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migration: Create users table
 */

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes,
) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    avatar_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    google_id: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },

    // Preferences
    nag_sensitivity: {
      type: Sequelize.ENUM("low", "medium", "high"),
      defaultValue: "medium",
      allowNull: false,
    },
    timezone: {
      type: Sequelize.STRING,
      defaultValue: "Africa/Lagos",
      allowNull: false,
    },
    locale: {
      type: Sequelize.STRING,
      defaultValue: "en-NG",
      allowNull: false,
    },
    default_currency: {
      type: Sequelize.STRING(3),
      defaultValue: "NGN",
      allowNull: false,
    },

    // Notification Settings
    email_notifications: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    sms_notifications: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    push_notifications: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },

    // Account Status
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    is_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    verified_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    last_login_at: {
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
  await queryInterface.addIndex("users", ["email"], { unique: true });
  // Partial unique index for google_id (only when not null)
  await queryInterface.sequelize.query(`
    CREATE UNIQUE INDEX users_google_id_unique
    ON users (google_id)
    WHERE google_id IS NOT NULL;
  `);
  await queryInterface.addIndex("users", ["is_active"]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("users");
}
