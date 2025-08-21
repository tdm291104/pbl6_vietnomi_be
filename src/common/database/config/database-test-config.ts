import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { AllConfigType } from "../../config/config.type";
import * as entitiesIndex from "../../../entities/index";
import { BaseEntity } from "typeorm";

const entities = Object.values(entitiesIndex).filter((entity: any) =>
  BaseEntity.isPrototypeOf(entity),
);

@Injectable()
export class DatabaseTestConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get("database.type", { infer: true }),
      host: this.configService.get("database.host", { infer: true }),
      port: this.configService.get("database.port", { infer: true }),
      username: this.configService.get("database.username", { infer: true }),
      password: this.configService.get("database.password", { infer: true }),
      database: this.configService.get("database.name", { infer: true }),
      entities: entities,
      synchronize: true,
      logging: false,
      extra: {
        max: 1,
        ssl: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
          useOrderByForFindOne: true,
        },
      },
      options: {
        useUTC: true,
        enableArithAbort: true,
      },
    } as TypeOrmModuleOptions;
  }
}
