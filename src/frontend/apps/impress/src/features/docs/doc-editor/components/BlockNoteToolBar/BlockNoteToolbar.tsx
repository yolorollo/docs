import {
  FormattingToolbar,
  FormattingToolbarController,
  blockTypeSelectItems,
  getFormattingToolbarItems,
  useDictionary,
} from '@blocknote/react';
import React, { JSX, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfig } from '@/core/config/api';

import { AIToolbarButton } from '../AI';
import { getCalloutFormattingToolbarItems } from '../custom-blocks';

import { FileDownloadButton } from './FileDownloadButton';
import { MarkdownButton } from './MarkdownButton';
import { ModalConfirmDownloadUnsafe } from './ModalConfirmDownloadUnsafe';

export const BlockNoteToolbar = () => {
  const dict = useDictionary();
  const [confirmOpen, setIsConfirmOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => void | Promise<void>>();
  const { t } = useTranslation();
  const { data: conf } = useConfig();

  const toolbarItems = useMemo(() => {
    const toolbarItems = getFormattingToolbarItems([
      ...blockTypeSelectItems(dict),
      getCalloutFormattingToolbarItems(t),
    ]);
    const fileDownloadButtonIndex = toolbarItems.findIndex(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'key' in item &&
        (item as { key: string }).key === 'fileDownloadButton',
    );
    if (fileDownloadButtonIndex !== -1) {
      toolbarItems.splice(
        fileDownloadButtonIndex,
        1,
        <FileDownloadButton
          key="fileDownloadButton"
          open={(onConfirm) => {
            setIsConfirmOpen(true);
            setOnConfirm(() => onConfirm);
          }}
        />,
      );
    }

    return toolbarItems as JSX.Element[];
  }, [dict, t]);

  const formattingToolbar = useCallback(() => {
    return (
      <FormattingToolbar>
        {conf?.AI_FEATURE_ENABLED && <AIToolbarButton />}

        {toolbarItems}

        {/* Extra button to convert from markdown to json */}
        <MarkdownButton key="customButton" />
      </FormattingToolbar>
    );
  }, [toolbarItems, conf?.AI_FEATURE_ENABLED]);

  return (
    <>
      <FormattingToolbarController formattingToolbar={formattingToolbar} />
      {confirmOpen && (
        <ModalConfirmDownloadUnsafe
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={onConfirm}
        />
      )}
    </>
  );
};
