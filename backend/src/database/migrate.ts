import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "../config/database";
import { logger } from "../utils/logger";
import * as path from "path";
import * as fs from "fs";

/**
 *   npm run migrate         - Run all pending migrations
 *   npm run migrate:up      - Run pending migrations (same as above)
 *   npm run migrate:down    - Rollback last migration
 *   npm run migrate:create  - Create a new migration file
 */

// create umzug instance
export const umzug = new Umzug({
  migrations: {
    glob: ["migrations/*.ts", { cwd: path.join(__dirname) }],
    resolve: ({ name, path: filepath }: { name: string; path?: string }) => {
      return {
        name,
        up: async () => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const migration = require(filepath!);
          return migration.up(
            sequelize.getQueryInterface(),
            sequelize.Sequelize,
          );
        },
        down: async () => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const migration = require(filepath!);
          return migration.down(
            sequelize.getQueryInterface(),
            sequelize.Sequelize,
          );
        },
      };
    },
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    tableName: "sequelize_meta",
  }),
  logger: console,
});

const getCommand = (): string => {
  const args = process.argv.slice(2);
  return args[0] || "up";
};

const createMigration = async (name?: string): Promise<void> => {
  if (!name) {
    logger.error("Migration name is required");
    logger.info("Usage: npm run migrate:create <migration-name>");
    logger.info("Example: npm run migrate:create add-user-timezone");
    process.exit(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "");
  const filename = `${timestamp}-${name}.ts`;
  const filepath = path.join(__dirname, "migrations", filename);

  const template = `import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: ${name}
 *
 * Created: ${new Date().toISOString()}
 */

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  // Write your migration code here
  // Example:
  // await queryInterface.createTable('table_name', {
  //   id: {
  //     type: Sequelize.UUID,
  //     defaultValue: Sequelize.UUIDV4,
  //     primaryKey: true,
  //   },
  //   name: {
  //     type: Sequelize.STRING,
  //     allowNull: false,
  //   },
  //   created_at: {
  //     type: Sequelize.DATE,
  //     allowNull: false,
  //   },
  //   updated_at: {
  //     type: Sequelize.DATE,
  //     allowNull: false,
  //   },
  // });
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  // Write your rollback code here
  // Example:
  // await queryInterface.dropTable('table_name');
}
`;

  fs.writeFileSync(filepath, template);
  logger.info(`[SUCCESS] Created migration file: ${filename}`);
  logger.info(`[INFO] Location: ${filepath}`);
  logger.info("\nNext steps:");
  logger.info("1. Edit the migration file and add your schema changes");
  logger.info("2. Run: npm run migrate");
};

const runMigrations = async (): Promise<void> => {
  const command = getCommand();

  try {
    logger.info("[MIGRATION] Starting migration...");

    // test db connection
    await sequelize.authenticate();
    logger.info("[SUCCESS] Database connected");

    switch (command) {
      case "up": {
        // run pending migrations
        const pendingMigrations = await umzug.pending();

        if (pendingMigrations.length === 0) {
          logger.info("[SUCCESS] No pending migrations");
          process.exit(0);
        }

        logger.info(
          `[INFO] Found ${pendingMigrations.length} pending migration(s):`,
        );
        pendingMigrations.forEach((m: any) => logger.info(`   - ${m.name}`));

        await umzug.up();
        logger.info("[SUCCESS] All migrations executed successfully");
        break;
      }

      case "down": {
        // rollback last migration
        const executed = await umzug.executed();

        if (executed.length === 0) {
          logger.warn("[WARNING] No migrations to rollback");
          process.exit(0);
        }

        const lastMigration = executed[executed.length - 1];
        logger.warn(`[WARNING] Rolling back: ${lastMigration.name}`);

        await umzug.down();
        logger.info("[SUCCESS] Migration rolled back successfully");
        break;
      }

      case "create": {
        const migrationName = process.argv[3];
        await createMigration(migrationName);
        break;
      }

      case "status": {
        const pending = await umzug.pending();
        const executedList = await umzug.executed();

        logger.info("\n[STATUS] Migration Status:");
        logger.info("=".repeat(50));

        if (executedList.length > 0) {
          logger.info("\n[EXECUTED] Executed migrations:");
          executedList.forEach((m: any) => logger.info(`   * ${m.name}`));
        } else {
          logger.info("\n(No executed migrations)");
        }

        if (pending.length > 0) {
          logger.info("\n[PENDING] Pending migrations:");
          pending.forEach((m: any) => logger.info(`   - ${m.name}`));
        } else {
          logger.info("\n(No pending migrations)");
        }

        logger.info("\n" + "=".repeat(50));
        break;
      }

      default: {
        logger.error(`[ERROR] Unknown command: ${command}`);
        logger.info("\nAvailable commands:");
        logger.info("  npm run migrate         - Run pending migrations");
        logger.info("  npm run migrate:up      - Run pending migrations");
        logger.info("  npm run migrate:down    - Rollback last migration");
        logger.info("  npm run migrate:create  - Create new migration file");
        process.exit(1);
      }
    }

    process.exit(0);
  } catch (error) {
    logger.error("[ERROR] Migration failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

export default umzug;
