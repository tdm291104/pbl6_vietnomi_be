import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { FoodTagModule } from "./food-tag.module";
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
  initAppFromModule,
} from "../../../test/utils/utils";
import { DataSource } from "typeorm/data-source/DataSource";

describe("FoodTagController", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, FoodTagModule],
    }).compile();

    app = await initAppFromModule(module);
  });

  afterAll(async () => {
    await clearDB(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  describe("GET /FoodTag (findAll)", () => {
    it("should return all FoodTags", async () => {
      const result = await request(app.getHttpServer()).get("/FoodTag");

      expect(result.body.message).toEqual("This action returns all FoodTag");
    });
  });
});
