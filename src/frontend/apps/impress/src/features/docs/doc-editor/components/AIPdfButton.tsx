import {
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
} from '@blocknote/react';
import { VariantType, useToastProvider } from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components';
import { useDocStore } from '@/features/docs/doc-management/';

import { useDocAIPdfTranscribe } from '../api/useDocAIPdfTranscribe';

export const AIPdfButton = () => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const selectedBlocks = useSelectedBlocks(editor);
  const { t } = useTranslation();
  const { currentDoc } = useDocStore();
  const { toast } = useToastProvider();
  const router = useRouter();
  const { mutateAsync: requestAIPdf, isPending } = useDocAIPdfTranscribe();

  if (!Components || !currentDoc) {
    return null;
  }

  const show = selectedBlocks.length === 1 && selectedBlocks[0].type === 'file';
  if (!show) {
    return null;
  }

  const handlePdfTranscription = async () => {
    console.log('selectedBlocks', selectedBlocks);
    const pdfBlock = selectedBlocks[0];
    const props = pdfBlock.props as { url?: string };
    const pdfUrl = props?.url;
    console.log('pdfUrl', pdfUrl);
    if (!props || !pdfUrl) {
      toast(t('No PDF file found'), VariantType.ERROR);
      return;
    }

    try {
      const response = await requestAIPdf({
        docId: currentDoc.id,
        pdfUrl,
      });

      void router.push(`/docs/${response.document_id}`);
    } catch (error) {
      console.error('error', error);
      toast(t('Failed to transcribe PDF'), VariantType.ERROR);
    }
  };

  return (
    <Components.FormattingToolbar.Button
      className="bn-button bn-menu-item"
      data-test="ai-pdf-transcribe"
      label="AI"
      mainTooltip={t('Transcribe PDF')}
      icon={
        <Text $isMaterialIcon $size="l">
          auto_awesome
        </Text>
      }
      onClick={() => void handlePdfTranscription()}
    />
  );
};
