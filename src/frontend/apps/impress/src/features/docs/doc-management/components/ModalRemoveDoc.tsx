import {
  Button,
  Modal,
  ModalSize,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';

import { Box, Text, TextErrors } from '@/components';

import { useRemoveDoc } from '../api/useRemoveDoc';
import { useTrans } from '../hooks';
import { Doc } from '../types';

interface ModalRemoveDocProps {
  onClose: () => void;
  doc: Doc;
  afterDelete?: (doc: Doc) => void;
}

export const ModalRemoveDoc = ({
  onClose,
  doc,
  afterDelete,
}: ModalRemoveDocProps) => {
  const { toast } = useToastProvider();
  const { push } = useRouter();
  const pathname = usePathname();
  const { untitledDocument } = useTrans(doc);
  const hasChildren = doc.numchild && doc.numchild > 0;

  const {
    mutate: removeDoc,
    isError,
    error,
  } = useRemoveDoc({
    onSuccess: () => {
      toast(t('The document has been deleted.'), VariantType.SUCCESS, {
        duration: 4000,
      });
      if (afterDelete) {
        afterDelete(doc);
        return;
      }

      if (pathname === '/') {
        onClose();
      } else {
        void push('/');
      }
    },
  });

  return (
    <Modal
      isOpen
      closeOnClickOutside
      onClose={() => onClose()}
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
          <Button
            aria-label={t('Confirm deletion')}
            color="danger"
            fullWidth
            onClick={() =>
              removeDoc({
                docId: doc.id,
              })
            }
          >
            {t('Delete')}
          </Button>
        </>
      }
      size={ModalSize.MEDIUM}
      title={
        <Text
          $size="h6"
          as="h6"
          $margin={{ all: '0' }}
          $align="flex-start"
          $variation="1000"
        >
          {t('Delete a doc')}
        </Text>
      }
    >
      <Box
        aria-label={t('Content modal to delete document')}
        className="--docs--modal-remove-doc"
      >
        {!isError && (
          <>
            <Text $size="sm" $variation="600">
              {t(
                hasChildren
                  ? 'This document and its {{count}} sub-docs will be permanently deleted. This action is irreversible.'
                  : 'This document will be permanently deleted. This action is irreversible.',
                {
                  count: doc.numchild ?? 0,
                },
              )}
            </Text>
          </>
        )}

        {isError && <TextErrors causes={error.cause} />}
      </Box>
    </Modal>
  );
};
