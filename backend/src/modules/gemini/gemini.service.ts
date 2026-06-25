import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiEvaluation } from './interfaces/gemini.interface';
import { ResumeEvaluation } from './interfaces/resume-evaluation.interface';

type GeminiModel = ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI?: GoogleGenerativeAI;
  private model?: GeminiModel;
  private useFallback = false;
  private initPromise?: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set; using fallback mode');
      this.useFallback = true;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async onModuleInit() {
    if (this.useFallback || !this.genAI) {
      return;
    }

    this.initPromise = this.initializeModel();
  }

  private getCandidateModels(): string[] {
    const configuredModel = this.configService.get<string>('GEMINI_MODEL');
    // Ordered by preference — newest/fastest first
    const candidates = [
      configuredModel,
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
    ];

    return [...new Set(candidates.filter((model): model is string => !!model))];
  }

  private async initializeModel() {
    if (!this.genAI) {
      this.useFallback = true;
      return;
    }

    for (const modelName of this.getCandidateModels()) {
      try {
        this.logger.log(`Trying Gemini model: ${modelName}`);
        const candidate = this.genAI.getGenerativeModel({ model: modelName });
        
        let timer: NodeJS.Timeout | undefined;
        try {
          await Promise.race([
            candidate.generateContent('Reply with the word OK.'),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => {
                reject(new Error('Request timed out after 5 seconds'));
              }, 5000);
            }),
          ]);
        } finally {
          if (timer) {
            clearTimeout(timer);
          }
        }

        this.model = candidate;
        this.useFallback = false;
        this.logger.log(`Using Gemini model: ${modelName}`);
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Gemini model ${modelName} failed: ${message}`);
      }
    }

    this.logger.warn(
      'No supported Gemini model responded; using fallback mode',
    );
    this.useFallback = true;
    this.model = undefined;
  }

  private async getOrInitializeModel(): Promise<GeminiModel | undefined> {
    if (this.model) {
      return this.model;
    }

    if (this.initPromise) {
      await this.initPromise;
      return this.model;
    }

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.useFallback = true;
      return undefined;
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }

    this.initPromise = this.initializeModel();
    await this.initPromise;
    return this.model;
  }

  async generateQuestions(
    role: string,
    difficulty: string,
    count: number,
    jobDescription?: string,
  ): Promise<string[]> {
    const model = await this.getOrInitializeModel();
    if (!model) {
      return this.getFallbackQuestions(role, count);
    }

    // Generate a random seed to ensure question variety across sessions
    const seed = Math.random().toString(36).substring(2, 10);

    try {
      const difficultyGuide = {
        Easy: `EASY level:
          - Target: Junior developer/basic level.
          - Content: Core fundamentals, simple concepts, basic terminology, and standard syntax.
          - Style: Single, direct, simple sentence (maximum 15 words). No complex scenarios, system design, or multi-part questions.
          - Examples: "What is the event loop in JavaScript?", "What is the difference between let, const, and var?", "Explain the difference between a GET and a POST request."`,
        Medium: `MEDIUM level:
          - Target: Mid-level developer.
          - Content: Practical application, debugging, simple scenarios, trade-offs between two choices, and standard performance optimizations.
          - Style: Crisp and practical (maximum 25 words, max 2 sentences). Avoid deep architectural designs or multi-part essay-style questions.
          - Examples: "How would you optimize a slow database query in production?", "What are the trade-offs of using SQL vs NoSQL for storing chat history?", "Explain how a React custom hook helps with code reusability."`,
        Hard: `HARD level:
          - Target: Senior/Lead developer.
          - Content: System design, high-concurrency systems, low-level internals, scaling bottlenecks, complex trade-offs, and architecture.
          - Style: Professional and comprehensive (maximum 45 words, max 3 sentences).
          - Examples: "How would you design a rate limiter for a distributed API?", "Explain the internals of how the JavaScript event loop handles microtasks vs macrotasks.", "Design a real-time collaborative editor and explain how you handle network sync conflicts."`,
      };

      const guide =
        difficultyGuide[difficulty as keyof typeof difficultyGuide] ??
        difficultyGuide.Medium;

      let prompt: string;

      if (jobDescription && jobDescription.trim().length > 0) {
        // Custom role with job description — tailor questions to the JD
        prompt = `
You are an expert technical interviewer. A candidate has applied for a job and shared the following job description. Generate exactly ${count} unique interview questions that would help this candidate prepare for THIS SPECIFIC role.

JOB DESCRIPTION:
"""
${jobDescription.trim()}
"""

DIFFICULTY:
${guide}

RULES:
1. Carefully analyze the job description to identify: required skills, technologies, responsibilities, and qualifications.
2. Generate questions that directly test the skills and knowledge mentioned in the job description.
3. Cover different aspects of the JD — don't focus on just one technology or requirement.
4. Questions must be practical and make the candidate genuinely interview-ready for THIS specific position.
5. Do NOT reference specific company names from the JD.
6. Questions should be clear, specific, and self-contained.
7. Return ONLY the question text as plain strings. No numbering, no prefixes, no metadata.
8. Randomness seed for variety: ${seed}
9. STRICT LENGTH LIMITS:
   - For Easy: Keep each question to a single simple sentence (max 15 words).
   - For Medium: Keep each question to max 2 sentences (max 25 words).
   - For Hard: Keep each question to max 3 sentences (max 45 words).
        `;
      } else {
        // Standard role-based questions
        prompt = `
You are an expert technical interviewer. Generate exactly ${count} unique interview questions for a **${role} developer** position.

DIFFICULTY:
${guide}

RULES:
1. Questions must make the candidate genuinely interview-ready — focus on skills, knowledge, and problem-solving that real interviews test.
2. Do NOT reference specific company names (no "Google-style", "asked at Meta", etc.).
3. Every question must be DIFFERENT from common/overused interview questions. Be creative and varied — cover different sub-topics within ${role} development.
4. Questions should be clear, specific, and self-contained (no follow-ups needed to understand them).
5. Return ONLY the question text as plain strings. No numbering, no prefixes, no metadata.
6. Randomness seed for variety: ${seed}
7. STRICT LENGTH LIMITS:
   - For Easy: Keep each question to a single simple sentence (max 15 words).
   - For Medium: Keep each question to max 2 sentences (max 25 words).
   - For Hard: Keep each question to max 3 sentences (max 45 words).
        `;
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'List of interview questions.',
          },
        },
      });
      const response = result.response;
      const text = response.text();

      const questions = this.parseStringArray(text);
      return questions ?? this.getFallbackQuestions(role, count);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falling back to mock questions: ${message}`);
      return this.getFallbackQuestions(role, count);
    }
  }

  private getFallbackQuestions(role: string, count: number): string[] {
    const questionBank = [
      `What is your experience with ${role} development?`,
      `Explain a challenging ${role} project you worked on.`,
      `What are the best practices for ${role} development?`,
      `How do you stay updated with ${role} technologies?`,
      `Describe your approach to testing in ${role} applications.`,
      `What are the most important skills for a ${role} developer?`,
      `How do you handle performance optimization in ${role} applications?`,
      `What security considerations are important for ${role} development?`,
      `How do you collaborate with team members on ${role} projects?`,
      `What tools and frameworks do you use for ${role} development?`,
      `Describe a time you solved a complex ${role} problem.`,
      `What's your approach to debugging in ${role} applications?`,
      `How do you handle technical debt in ${role} projects?`,
      `What's your experience with ${role} frameworks and libraries?`,
      `How do you ensure code quality in ${role} development?`,
    ];

    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async evaluateResume(
    resumeText: string,
    jobDescription?: string,
    targetRole?: string,
  ): Promise<ResumeEvaluation> {
    const model = await this.getOrInitializeModel();
    if (!model) {
      return this.getFallbackResumeEvaluation();
    }

    try {
      const jdSection = jobDescription?.trim()
        ? `\nJOB DESCRIPTION TO COMPARE AGAINST:\n"""\n${jobDescription.trim()}\n"""\n\nCompare the resume against this job description. Identify matching skills and missing skills that the JD requires but the resume doesn't show.`
        : '';

      const roleSection = targetRole?.trim()
        ? `\nThe candidate is targeting a **${targetRole}** role.`
        : '';

      const prompt = `
You are an expert career coach, resume reviewer, and hiring manager with 15+ years of experience.

Evaluate the following resume thoroughly and provide detailed, actionable feedback.
${roleSection}

RESUME:
"""
${resumeText.trim()}
"""
${jdSection}

EVALUATION CRITERIA:
1. **Overall Score (0-10)**: Rate the resume's overall effectiveness for landing interviews.
2. **ATS Score (0-10)**: Rate how well this resume would perform with Applicant Tracking Systems (keyword optimization, formatting, standard sections).
3. **Summary**: A 2-3 sentence executive summary of the resume's quality.
4. **Strengths**: What the resume does well (max 5 points, concise).
5. **Weaknesses**: What needs improvement (max 5 points, concise).
6. **Suggestions**: Specific, actionable improvements the candidate should make (max 6 points).
7. **Skills Found**: Technical and soft skills evident in the resume.
8. **Missing Skills**: ${jobDescription ? 'Skills required by the job description but not found in the resume.' : 'Common industry skills that would strengthen this resume.'}
9. **Section Feedback**: Rate and give feedback for each major resume section (e.g., Summary/Objective, Experience, Education, Skills, Projects, etc.). Only include sections that exist or should exist.

Be honest, constructive, and specific. Don't use generic advice — reference specific content from the resume.
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              overallScore: {
                type: SchemaType.NUMBER,
                description: 'Overall resume score from 0 to 10.',
              },
              atsScore: {
                type: SchemaType.NUMBER,
                description: 'ATS compatibility score from 0 to 10.',
              },
              summary: {
                type: SchemaType.STRING,
                description: 'Executive summary of resume quality (2-3 sentences).',
              },
              strengths: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Key strengths of the resume.',
              },
              weaknesses: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Areas that need improvement.',
              },
              suggestions: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Specific actionable suggestions for improvement.',
              },
              skillsFound: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Skills identified in the resume.',
              },
              missingSkills: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Skills that are missing but would strengthen the resume.',
              },
              sectionFeedback: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    section: {
                      type: SchemaType.STRING,
                      description: 'Name of the resume section.',
                    },
                    rating: {
                      type: SchemaType.STRING,
                      description: 'Rating: Excellent, Good, Fair, or Needs Work.',
                    },
                    feedback: {
                      type: SchemaType.STRING,
                      description: 'Specific feedback for this section.',
                    },
                  },
                  required: ['section', 'rating', 'feedback'],
                },
                description: 'Feedback for each resume section.',
              },
            },
            required: [
              'overallScore',
              'atsScore',
              'summary',
              'strengths',
              'weaknesses',
              'suggestions',
              'skillsFound',
              'missingSkills',
              'sectionFeedback',
            ],
          },
        },
      });

      const response = result.response;
      const text = response.text();
      const cleanText = this.stripCodeFence(text);
      const parsed = JSON.parse(cleanText) as ResumeEvaluation;

      // Clamp scores
      parsed.overallScore = Math.max(0, Math.min(10, parsed.overallScore));
      parsed.atsScore = Math.max(0, Math.min(10, parsed.atsScore));

      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Resume evaluation failed: ${message}`);
      return this.getFallbackResumeEvaluation();
    }
  }

  private getFallbackResumeEvaluation(): ResumeEvaluation {
    return {
      overallScore: 5,
      atsScore: 5,
      summary: 'AI evaluation is currently unavailable. Please try again later.',
      strengths: ['Resume submitted successfully'],
      weaknesses: ['Unable to perform detailed analysis at this time'],
      suggestions: ['Try again later when AI evaluation is available'],
      skillsFound: [],
      missingSkills: [],
      sectionFeedback: [],
    };
  }

  async evaluateAnswer(
    question: string,
    answer: string,
  ): Promise<GeminiEvaluation> {
    const results = await this.evaluateAnswers([{ question, answer }]);
    return results[0];
  }

  async evaluateAnswers(
    items: { question: string; answer: string }[],
  ): Promise<GeminiEvaluation[]> {
    const model = await this.getOrInitializeModel();
    if (!model) {
      return items.map(() => ({
        score: 5,
        strengths: ['Answer submitted'],
        weaknesses: ['AI evaluation unavailable, please review yourself'],
        idealAnswer: 'Please review your answer against the question.',
      }));
    }

    try {
      const prompt = `
        You are an expert interviewer and Senior Software Engineer.
        Evaluate the candidate's answers for the following list of technical interview questions.
        
        Questions and Candidate Answers:
        ${items.map((item, index) => `
          --- Question ${index + 1} ---
          Question: ${item.question}
          Answer: ${item.answer}
        `).join('\n')}

        For each question:
        1. Provide a fair, precise score (0 to 10) from an interviewer's perspective.
        2. Provide 2-3 concise, high-impact strengths of the candidate's answer. Keep each strength short and to the point (maximum 15 words).
        3. Provide 2-3 concise, high-impact weaknesses or missing key concepts in the candidate's answer. Keep each weakness short and to the point (maximum 15 words).
        4. For the ideal answer, draft a concise reference answer (maximum 3 sentences) explaining the key expected concept and a best practice.
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                score: {
                  type: SchemaType.NUMBER,
                  description: 'Score from 0 to 10. Be strict: give low scores for brief, vague, or incomplete answers.',
                },
                strengths: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: 'Concise points of strength in the answer (max 3 items, each max 15 words, focusing only on key positives).',
                },
                weaknesses: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: 'Concise points of weaknesses or missing knowledge in the answer (max 3 items, each max 15 words, focusing on high-impact gaps).',
                },
                idealAnswer: {
                  type: SchemaType.STRING,
                  description: 'A concise reference answer of 2-3 sentences highlighting core concepts and best practices.',
                },
              },
              required: ['score', 'strengths', 'weaknesses', 'idealAnswer'],
            },
            description: 'A list of evaluations corresponding to the input questions in the exact same order.',
          },
        },
      });

      const response = result.response;
      const text = response.text();

      const evaluations = this.parseEvaluationArray(text);
      if (evaluations && evaluations.length === items.length) {
        return evaluations;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Bulk evaluation failed: ${message}`);
    }

    // Fallback if API or parsing fails
    return items.map(() => ({
      score: 5,
      strengths: [
        'Answer was successfully submitted and captured for review.',
        'Core response structure was parsed correctly by the server.'
      ],
      weaknesses: [
        'Detailed AI analysis is currently offline. Please review your answer manually against standard industry practices.',
        'Consider checking if your response covers all edge cases and key concepts for this topic.'
      ],
      idealAnswer: 'A comprehensive, detailed ideal answer would cover the fundamental concepts of the question, best practices, real-world examples, and proper implementation trade-offs.',
    }));
  }

  async generateContent(prompt: string): Promise<string> {
    const model = await this.getOrInitializeModel();
    if (!model) {
      throw new Error('Gemini model not available');
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async refineTranscript(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    const model = await this.getOrInitializeModel();
    if (!model) {
      return text;
    }

    try {
      const prompt = `
You are an AI assistant helping a software engineering candidate. The candidate used speech-to-text to record their answer to an interview question.
The transcribed text has grammatical issues, lacks punctuation and capitalization, and may contain transcription errors for technical terms (e.g. "sequel" instead of "SQL", "react js" instead of "React.js").

Please refine the following transcribed text.
Rules:
1. Fix grammar, spelling, punctuation, and capitalization.
2. Correct transcription mistakes for technical terms/names (e.g., programming languages, frameworks, design patterns, protocols).
3. Smooth out excessive filler words (like "um", "uh", "like") only when they interrupt the flow, but keep the original message, tone, and candidate's vocabulary intact. Do NOT rewrite the answer, write an ideal answer, or add any new points. It must remain the candidate's original answer, just polished for readability.
4. If the text is empty or invalid, return it as-is.
5. Return ONLY the refined text. No commentary, no preamble.

TEXT TO REFINE:
"""
${text}
"""
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.warn(`Failed to refine transcript: ${error instanceof Error ? error.message : String(error)}`);
      return text;
    }
  }

  async transcribeAudio(buffer: Buffer, mimeType: string): Promise<string> {
    const model = await this.getOrInitializeModel();
    if (!model) {
      throw new Error('Gemini model not available');
    }

    try {
      const result = await model.generateContent([
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: mimeType,
          },
        },
        `Transcribe the spoken audio in this file accurately.
         Apply these formatting rules to the transcription:
         1. Add proper grammar, punctuation, and capitalization.
         2. Correct technical terminology spelling (e.g. "SQL" instead of "sequel", "React" instead of "react", etc.).
         3. Smooth out minor speech repetitions or excessive filler words ("um", "uh", "like") only if they disrupt readability, but preserve the candidate's core content, response structure, and vocabulary.
         4. Do NOT summarize or add any comments/analysis. Only output the final transcribed and formatted text.`,
      ]);
      return result.response.text().trim();
    } catch (error) {
      this.logger.warn(`Audio transcription failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private parseStringArray(text: string): string[] | null {
    const cleanText = this.stripCodeFence(text);

    try {
      const parsed: unknown = JSON.parse(cleanText);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((item): item is string => typeof item === 'string')
      ) {
        return parsed;
      }
    } catch {
      return null;
    }

    return null;
  }

  private parseEvaluation(text: string): GeminiEvaluation | null {
    const cleanText = this.stripCodeFence(text);

    try {
      const parsed: unknown = JSON.parse(cleanText);
      if (!this.isGeminiEvaluation(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private parseEvaluationArray(text: string): GeminiEvaluation[] | null {
    const cleanText = this.stripCodeFence(text);

    try {
      const parsed: unknown = JSON.parse(cleanText);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => this.isGeminiEvaluation(item))
      ) {
        return parsed as GeminiEvaluation[];
      }
    } catch {
      return null;
    }
    return null;
  }

  private stripCodeFence(text: string): string {
    if (text.includes('```json')) {
      return text.split('```json')[1].split('```')[0].trim();
    }

    if (text.includes('```')) {
      return text.split('```')[1].split('```')[0].trim();
    }

    return text.trim();
  }

  private isGeminiEvaluation(value: unknown): value is GeminiEvaluation {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const evaluation = value as Record<string, unknown>;
    return (
      typeof evaluation.score === 'number' &&
      Array.isArray(evaluation.strengths) &&
      evaluation.strengths.every((item) => typeof item === 'string') &&
      Array.isArray(evaluation.weaknesses) &&
      evaluation.weaknesses.every((item) => typeof item === 'string') &&
      typeof evaluation.idealAnswer === 'string'
    );
  }
}
