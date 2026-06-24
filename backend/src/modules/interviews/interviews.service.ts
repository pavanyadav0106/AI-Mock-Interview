import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GeminiEvaluation } from '../gemini/interfaces/gemini.interface';
import { GeminiService } from '../gemini/gemini.service';
import { Interview } from '../../schemas/interview.schema';
import { Response } from '../../schemas/response.schema';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(Interview.name) private interviewModel: Model<Interview>,
    @InjectModel(Response.name) private responseModel: Model<Response>,
    private geminiService: GeminiService,
  ) {}

  async createInterview(
    userId: string,
    createInterviewDto: CreateInterviewDto,
  ) {
    const { role, difficulty, totalQuestions, jobDescription } = createInterviewDto;

    const questions = await this.geminiService.generateQuestions(
      role,
      difficulty,
      totalQuestions,
      jobDescription,
    );

    const interview = new this.interviewModel({
      userId: new Types.ObjectId(userId),
      role,
      difficulty,
      totalQuestions,
      questions,
      ...(jobDescription ? { jobDescription } : {}),
    });

    await interview.save();

    return {
      interviewId: interview._id,
      questions,
    };
  }

  async getInterview(interviewId: string) {
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async submitAnswers(interviewId: string, submitAnswersDto: SubmitAnswersDto) {
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.completedAt) {
      throw new BadRequestException('Interview already completed');
    }

    const { answers } = submitAnswersDto;

    if (answers.length !== interview.totalQuestions) {
      throw new BadRequestException(
        `Expected ${interview.totalQuestions} answers, got ${answers.length}`,
      );
    }

    const evaluations = await this.geminiService.evaluateAnswers(
      answers.map((a) => ({ question: a.question, answer: a.answer })),
    );

    let totalScore = 0;
    const responses: Response[] = [];

    for (let i = 0; i < answers.length; i++) {
      const answerDto = answers[i];
      const evaluation = evaluations[i] || {
        score: 5,
        strengths: ['Attempted to answer'],
        weaknesses: ['Could be more detailed'],
        idealAnswer: 'A comprehensive answer covering all aspects.',
      };

      const response = new this.responseModel({
        interviewId: new Types.ObjectId(interviewId),
        question: answerDto.question,
        answer: answerDto.answer,
        score: evaluation.score,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        idealAnswer: evaluation.idealAnswer,
      });

      const savedResponse = await response.save();
      responses.push(savedResponse);
      totalScore += evaluation.score;
    }

    interview.totalScore = totalScore / answers.length;
    interview.completedAt = new Date();
    await interview.save();

    return {
      overallScore: interview.totalScore,
      responses,
    };
  }

  async getHistory(userId: string) {
    const interviews = await this.interviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .select('-__v');

    return interviews;
  }

  async getInterviewWithResponses(interviewId: string) {
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const responses = await this.responseModel
      .find({ interviewId: new Types.ObjectId(interviewId) })
      .select('-__v');

    return {
      interview,
      responses,
    };
  }

  async refineTranscript(text: string): Promise<string> {
    return this.geminiService.refineTranscript(text);
  }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    return this.geminiService.transcribeAudio(file.buffer, file.mimetype);
  }
}
