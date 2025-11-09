import { QueryInterface, DataTypes } from "sequelize";

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes,
) {
  await queryInterface.createTable("contacts", {
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
    contact_user_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    // contact info
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // metadata
    nickname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    notes: {
      type: Sequelize.TEXT,
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

  // add indexes
  await queryInterface.addIndex("contacts", ["user_id"]);
  await queryInterface.addIndex("contacts", ["user_id", "email"], {
    unique: true,
    name: "unique_user_contact_email",
  });
  await queryInterface.addIndex("contacts", ["contact_user_id"]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("contacts");
}
