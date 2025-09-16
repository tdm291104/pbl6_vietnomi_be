import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ForeignKey,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Foods } from "./food.entity";
import { Tags } from "./tag.entity";

@Entity("food-tag")
export class FoodTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Foods, (foods) => foods.foodTags)
  @JoinColumn({ name: "food_id" })
  food: Foods;

  @ManyToOne(() => Tags, (tags) => tags.tagTags)
  @JoinColumn({ name: "tag_id" })
  tag: Tags;

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
