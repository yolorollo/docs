import { Button, Input, Modal, ModalSize } from '@openfun/cunningham-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Text } from '@/components';
import { useTreeStore } from '@/components/common/tree/treeStore';

import { useUpdateDoc } from '../api';
import { Doc } from '../types';

interface ModalRenameDocProps {
  onClose: () => void;
  doc: Doc;
}

export const ModalRenameDoc = ({ onClose, doc }: ModalRenameDocProps) => {
  const { t } = useTranslation();
  const { updateNode } = useTreeStore();
  const { mutate: updateDoc } = useUpdateDoc();
  const [title, setTitle] = useState(doc.title);

  const onRename = () => {
    updateDoc(
      {
        id: doc.id,
        title,
      },
      {
        onSuccess: (doc) => {
          updateNode(doc.id, doc);
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      closeOnClickOutside
      title={
        <Text $size="h6" $margin={{ all: '0' }} $align="flex-start">
          {t('Rename')}
        </Text>
      }
      isOpen
      onClose={onClose}
      size={ModalSize.SMALL}
      rightActions={
        <>
          <Button
            aria-label={t('Close the modal')}
            color="secondary"
            fullWidth
            onClick={() => onClose()}
          >
            {t('Cancel')}
          </Button>
          <Button aria-label={t('Confirm rename')} fullWidth onClick={onRename}>
            {t('Rename')}
          </Button>
        </>
      }
    >
      <Box $padding={{ top: 'base' }}>
        <Input
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              onRename();
            }
          }}
          value={title}
          label={t('Document name')}
          onChange={(e) => {
            e.stopPropagation();

            setTitle(e.target.value);
          }}
        />
      </Box>
    </Modal>
  );
};
