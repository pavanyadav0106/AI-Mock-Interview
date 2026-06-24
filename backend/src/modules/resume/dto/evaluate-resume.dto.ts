import { IsString, IsOptional } from 'class-validator';

export class EvaluateResumeDto {
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @IsOptional()
  @IsString()
  targetRole?: string;
}

