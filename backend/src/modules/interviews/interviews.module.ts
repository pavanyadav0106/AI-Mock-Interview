import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { GeminiModule } from '../gemini/gemini.module';
import { Interview, InterviewSchema } from '../../schemas/interview.schema';
import { Response, ResponseSchema } from '../../schemas/response.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
    GeminiModule,
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}
