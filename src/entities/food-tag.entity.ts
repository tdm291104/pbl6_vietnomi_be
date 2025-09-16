import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ForeignKey,
} from "typeorm";
import { Foods } from "./food.entity";
import { Tags } from "./tag.entity";

@Entity("food-tag")
export class FoodTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ForeignKey(() => Foods)
  @Column({ type: "int", nullable: false })
  food_id: number;

  @ForeignKey(() => Tags)
  @Column({ type: "int", nullable: false })
  tag_id: number;

  @Column({ type: "boolean", default: false, nullable: false })
  delFlag: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
