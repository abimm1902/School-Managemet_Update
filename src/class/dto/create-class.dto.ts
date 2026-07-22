import { IsNotEmpty, IsString } from "class-validator";

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // e.g. "Class 7"
  subject!:string;
}

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // e.g. "A"

}

