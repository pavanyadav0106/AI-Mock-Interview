import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { InterviewsService } from './interviews.service';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Post()
  async createInterview(
    @GetUser() user: AuthUser,
    @Body() createInterviewDto: CreateInterviewDto,
  ) {
    const userId = user.userId;
    return this.interviewsService.createInterview(userId, createInterviewDto);
  }

  @Get('history/all')
  async getHistory(@GetUser() user: AuthUser) {
    const userId = user.userId;
    return this.interviewsService.getHistory(userId);
  }

  @Get(':id')
  async getInterview(@Param('id') id: string) {
    return this.interviewsService.getInterview(id);
  }

  @Get(':id/responses')
  async getInterviewWithResponses(@Param('id') id: string) {
    return this.interviewsService.getInterviewWithResponses(id);
  }

  @Post(':id/submit')
  async submitAnswers(
    @Param('id') id: string,
    @Body() submitAnswersDto: SubmitAnswersDto,
  ) {
    return this.interviewsService.submitAnswers(id, submitAnswersDto);
  }

  @Post('refine-transcript')
  async refineTranscript(@Body('text') text: string) {
    const refinedText = await this.interviewsService.refineTranscript(text);
    return { refinedText };
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }
    const transcript = await this.interviewsService.transcribeAudio(file);
    return { transcript };
  }
}
