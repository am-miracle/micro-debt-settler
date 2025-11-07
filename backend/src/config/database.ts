import { Sequelize } from "sequelize";
import { config } from "./env";
import { logger } from "../utils/logger";
import { initializeAssociations } from "../models";

export const sequelize = new Sequelize(config.database_url, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: config.env === "development" ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    initializeAssociations();
    logger.info("Model associations initialized successfully");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error closing database connection:", error);
  }
};
