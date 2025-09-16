import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { RatingModule } from "./rating.module";
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
  initAppFromModule,
} from "../../../test/utils/utils";
import { DataSource } from "typeorm/data-source/DataSource";

describe("RatingController", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, RatingModule],
    }).compile();

    app = await initAppFromModule(module);
  });

  afterAll(async () => {
    await clearDB(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  describe("GET /Rating (findAll)", () => {
    it("should return all Ratings", async () => {
      const result = await request(app.getHttpServer()).get("/Rating");

      expect(result.body.message).toEqual("This action returns all Rating");
    });
  });
});
