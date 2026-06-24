import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EvaluateResumeDto } from './dto/evaluate-resume.dto';
import { ResumeService } from './resume.service';

@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Post('evaluate')
  @UseInterceptors(FileInterceptor('file'))
  async evaluateResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() evaluateResumeDto: EvaluateResumeDto,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }
    return this.resumeService.evaluateResume(file, evaluateResumeDto);
  }
}

