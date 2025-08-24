import { DataSource } from "typeorm";
import "dotenv/config";

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + "/../../entities/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../../migrations/**/*{.ts,.js}"],
  extra: {
    max: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,
  },
  ssl: true, // Enable SSL if required
});
