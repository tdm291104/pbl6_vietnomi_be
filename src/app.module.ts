import { MiddlewareConsumer, Module } from "@nestjs/common";
import databaseConfig from "./common/database/config/database.config";
import appConfig from "./common/config/app.config";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./common/database/typeorm-config.service";
import { DataSource, DataSourceOptions } from "typeorm";
import { SampleModule } from "./api/sample/sample.module";
import { AppLoggerMiddleware } from "./common/middlewares/app-logger.middleware";
import { UserModule } from "./api/user/user.module";
import { AuthModule } from "./api/auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    SampleModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
