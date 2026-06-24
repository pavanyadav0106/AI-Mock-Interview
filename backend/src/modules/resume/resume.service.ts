import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { ResumeEvaluation } from '../gemini/interfaces/resume-evaluation.interface';
import { EvaluateResumeDto } from './dto/evaluate-resume.dto';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(private geminiService: GeminiService) {}

  async evaluateResume(
    file: Express.Multer.File,
    evaluateResumeDto: EvaluateResumeDto,
  ): Promise<ResumeEvaluation> {
    const { jobDescription, targetRole } = evaluateResumeDto;

    let resumeText = '';
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsedPdf = await parser.getText();
      resumeText = parsedPdf.text;
    } catch (error) {
      this.logger.error(`Failed to parse PDF file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to parse PDF file. Ensure the file is not corrupted.');
    } finally {
      await parser.destroy();
    }

    if (!resumeText || resumeText.trim().length < 50) {
      throw new BadRequestException(
        'Could not extract sufficient text from the PDF. Please make sure the PDF has selectable text and is not just a scanned image.',
      );
    }

    return this.geminiService.evaluateResume(
      resumeText.trim(),
      jobDescription,
      targetRole,
    );
  }
}

