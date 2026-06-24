import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsNumber()
  @Min(3)
  @Max(15)
  totalQuestions: number;

  @IsOptional()
  @IsString()
  jobDescription?: string;
}
