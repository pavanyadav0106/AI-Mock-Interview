import { useCallback, useState } from 'react';
import { interviewsApi } from '../api/interviews';
import type { CreateInterviewData, SubmitAnswerData } from '../types';
import { getErrorMessage } from '../utils/helpers';

export const useInterviews = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInterview = useCallback(async (data: CreateInterviewData) => {
    setLoading(true);
    setError(null);
    try {
      return await interviewsApi.create(data);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to create interview'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInterview = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await interviewsApi.get(id);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to get interview'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInterviewWithResponses = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await interviewsApi.getWithResponses(id);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to get interview results'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswers = useCallback(async (id: string, data: SubmitAnswerData) => {
    setLoading(true);
    setError(null);
    try {
      return await interviewsApi.submit(id, data);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to submit answers'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await interviewsApi.getHistory();
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to get history'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refineTranscript = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await interviewsApi.refineTranscript(text);
      return res.refinedText;
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to refine transcript'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setLoading(true);
    setError(null);
    try {
      return await interviewsApi.transcribeAudio(audioBlob);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to transcribe audio'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createInterview,
    getInterview,
    getInterviewWithResponses,
    submitAnswers,
    getHistory,
    refineTranscript,
    transcribeAudio,
  };
};
