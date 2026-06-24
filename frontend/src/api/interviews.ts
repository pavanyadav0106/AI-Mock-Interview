import { api } from './axios';
import type { CreateInterviewData, SubmitAnswerData } from '../types';

export const interviewsApi = {
  create: async (data: CreateInterviewData) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  getWithResponses: async (id: string) => {
    const response = await api.get(`/interviews/${id}/responses`);
    return response.data;
  },

  submit: async (id: string, data: SubmitAnswerData) => {
    const response = await api.post(`/interviews/${id}/submit`, data);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/interviews/history/all');
    return response.data;
  },

  refineTranscript: async (text: string): Promise<{ refinedText: string }> => {
    const response = await api.post('/interviews/refine-transcript', { text });
    return response.data;
  },

  transcribeAudio: async (audioBlob: Blob): Promise<{ transcript: string }> => {
    const formData = new FormData();
    const filename = audioBlob.type.includes('webm') ? 'speech.webm' : audioBlob.type.includes('mp4') ? 'speech.mp4' : 'speech.wav';
    formData.append('audio', audioBlob, filename);

    const response = await api.post('/interviews/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
