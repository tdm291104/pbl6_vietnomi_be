import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { FoodModule } from "./food.module";
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
  initAppFromModule,
} from "../../../test/utils/utils";
import { DataSource } from "typeorm/data-source/DataSource";

describe("FoodController", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, FoodModule],
    }).compile();

    app = await initAppFromModule(module);
  });

  afterAll(async () => {
    await clearDB(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  describe("GET /Food (findAll)", () => {
    it("should return all Foods", async () => {
      const result = await request(app.getHttpServer()).get("/Food");

      expect(result.body.message).toEqual("This action returns all Food");
    });
  });
});
