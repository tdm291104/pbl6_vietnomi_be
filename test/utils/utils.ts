import { ConfigModule } from "@nestjs/config";
import databaseConfig from "../../src/common/database/config/database.config";
import appConfig from "../../src/common/config/app.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseTestConfigService } from "../../src/common/database/config/database-test-config";
import { DataSource, DataSourceOptions } from "typeorm";
import * as entitiesIndex from "../../src/entities/index";
import { BaseEntity } from "typeorm";
import { TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
const entities = Object.values(entitiesIndex).filter((entity: any) =>
  BaseEntity.isPrototypeOf(entity),
);

export const IMPORT_MODULES = [
  ConfigModule.forRoot({
    isGlobal: true,
    load: [databaseConfig, appConfig],
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useClass: DatabaseTestConfigService,
  }),
];

function _getDataSource() {
  return new DataSource({
    name: "default",
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: entities as any,
    synchronize: true,
    extra: {
      max: 1,
      ssl: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    options: {
      useUTC: true,
      enableArithAbort: true,
    },
  } as DataSourceOptions);
}

export async function initAppFromModule(module: TestingModule) {
  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
    }),
  );
  await app.init();
  return app;
}

export async function getSynchronizeConnection() {
  const dataSource = _getDataSource();
  await dataSource
    .initialize()
    .then(async (_) => await dataSource.synchronize(true));
  return dataSource;
}

export async function clearDB(dataSource: DataSource) {
  try {
    await dataSource.query(
      'EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"',
    );

    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(
        `DELETE FROM "${entity.tableName}"; DBCC CHECKIDENT ('${entity.tableName}', RESEED, 0);`,
      );
    }

    await dataSource.query(
      'EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"',
    );
  } catch (error) {
    console.error("Error clearing database:", error);
    try {
      await dataSource.query(
        'EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"',
      );
    } catch (constraintError) {
      console.error("Error re-enabling constraints:", constraintError);
    }
    throw error;
  }
}
