import { MiddlewareConsumer, Module } from "@nestjs/common";
import databaseConfig from "./common/database/config/database.config";
import appConfig from "./common/config/app.config";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./common/database/typeorm-config.service";
import { DataSource, DataSourceOptions, In } from "typeorm";
import { AppLoggerMiddleware } from "./common/middlewares/app-logger.middleware";
import { UserModule } from "./api/user/user.module";
import { AuthModule } from "./api/auth/auth.module";
import { TagModule } from "./api/tag/tag.module";
import { FoodModule } from "./api/food/food.module";
import { FoodTagModule } from "./api/food-tag/food-tag.module";
import { CommentModule } from "./api/comment/comment.module";

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
    UserModule,
    AuthModule,
    TagModule,
    FoodModule,
    FoodTagModule,
    CommentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
