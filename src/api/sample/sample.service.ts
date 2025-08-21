import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import { Sample } from "../../entities/sample.entity";

@Injectable()
export class SampleService {
  async create(createSampleDto: CreateSampleDto) {
    const sample = await Sample.create(createSampleDto).save();
    return sample;
  }

  async findAll() {
    const samples = await Sample.find();
    return samples;
  }

  async findOne(id: number) {
    const sample = await Sample.findOneBy({ id });
    if (!sample) {
      throw new NotFoundException(`Sample with id ${id} not found`);
    }
    return sample;
  }

  async update(id: number, updateSampleDto: UpdateSampleDto) {
    const sample = await this.findOne(id);
    if (!sample) {
      throw new Error(`Sample with id ${id} not found`);
    }
    Object.assign(sample, updateSampleDto);
    await sample.save();
    return sample;
  }

  async remove(id: number) {
    await Sample.delete(id);
    return { message: `This action removes a #${id} sample` };
  }
}
