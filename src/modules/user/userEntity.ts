import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";

import { hash } from "argon2";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 255, unique: true })
  username!: string;

  @Column({ type: "text" })
  password!: string;

  @Column({ type: "boolean", default: false })
  confirmed!: boolean;

  @Column({ type: "boolean", default: false })
  forgotPasswordLocked!: boolean;

  @BeforeInsert()
  async hashPasswordBeforeInsert(): Promise<void> {
    const hashedPassword = await hash(this.password);
    this.password = hashedPassword;
  }
}
