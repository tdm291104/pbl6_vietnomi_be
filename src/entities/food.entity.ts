import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ForeignKey,
  OneToMany,
} from "typeorm";
import { Users } from "./user.entity";
import { FoodTag } from "./food-tag.entity";
import { Comments } from "./comment.entity";

@Entity("foods")
export class Foods extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  dish_name: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  dish_type: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  serving_size: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  cooking_time: string;

  @Column({ type: "text", nullable: false })
  ingredients: string;

  @Column({ type: "text", nullable: false })
  cooking_method: string;

  @Column({ type: "int", nullable: true })
  calories: number;

  @Column({ type: "int", nullable: true })
  fat: number;

  @Column({ type: "int", nullable: true })
  fiber: number;

  @Column({ type: "int", nullable: true })
  sugar: number;

  @Column({ type: "int", nullable: true })
  protein: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  image_link: string;

  @Column({ type: "boolean", default: false, nullable: false })
  delFlag: boolean;

  @Column({ type: "boolean", default: false, nullable: false })
  posted: boolean;

  @ForeignKey(() => Users)
  @Column({ type: "int", default: 1, nullable: false })
  user_id: number;

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

  @OneToMany(() => FoodTag, (foodTag) => foodTag.food)
  foodTags: FoodTag[];

  @OneToMany(() => Comments, (comment) => comment.food)
  comments: Comments[];
}
