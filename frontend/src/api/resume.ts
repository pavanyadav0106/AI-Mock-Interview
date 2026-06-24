import { api } from './axios';

export interface EvaluateResumeData {
  file: File;
  jobDescription?: string;
  targetRole?: string;
}

export interface ResumeEvaluationResult {
  overallScore: number;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skillsFound: string[];
  missingSkills: string[];
  sectionFeedback: {
    section: string;
    rating: string;
    feedback: string;
  }[];
}

export const resumeApi = {
  evaluate: async (data: EvaluateResumeData): Promise<ResumeEvaluationResult> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.jobDescription) {
      formData.append('jobDescription', data.jobDescription);
    }
    if (data.targetRole) {
      formData.append('targetRole', data.targetRole);
    }
    const response = await api.post('/resume/evaluate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
