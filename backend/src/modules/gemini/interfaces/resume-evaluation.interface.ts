export interface ResumeEvaluation {
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
