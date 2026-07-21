import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  sections?:UpdateSectionDto[];
}

export class UpdateSectionDto{
    @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
  id?:string;

}
