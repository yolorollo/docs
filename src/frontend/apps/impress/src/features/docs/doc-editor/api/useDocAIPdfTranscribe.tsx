import { useMutation } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

export type DocAIPdfTranscribe = {
  docId: string;
  pdfUrl: string;
};

export type DocAIPdfTranscribeResponse = {
  document_id: string;
};

export const docAIPdfTranscribe = async ({
  docId,
  ...params
}: DocAIPdfTranscribe): Promise<DocAIPdfTranscribeResponse> => {
  const response = await fetchAPI(`documents/${docId}/ai-pdf-transcribe/`, {
    method: 'POST',
    body: JSON.stringify({
      ...params,
    }),
  });

  if (!response.ok) {
    throw new APIError(
      'Failed to request pdf transcription',
      await errorCauses(response),
    );
  }

  return response.json() as Promise<DocAIPdfTranscribeResponse>;
};

export function useDocAIPdfTranscribe() {
  return useMutation<DocAIPdfTranscribeResponse, APIError, DocAIPdfTranscribe>({
    mutationFn: docAIPdfTranscribe,
  });
}
