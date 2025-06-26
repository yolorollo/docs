import {
  VariantType,
  useModal,
  useToastProvider,
} from '@openfun/cunningham-react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuOption, Icon } from '@/components';
import {
  Doc,
  KEY_LIST_DOC,
  ModalRemoveDoc,
  useCreateFavoriteDoc,
  useDeleteFavoriteDoc,
  useDuplicateDoc,
} from '@/docs/doc-management';

interface DocsGridActionsProps {
  doc: Doc;
  openShareModal?: () => void;
}

export const DocsGridActions = ({
  doc,
  openShareModal,
}: DocsGridActionsProps) => {
  const { t } = useTranslation();
  const { toast } = useToastProvider();

  const deleteModal = useModal();
  const { mutate: duplicateDoc } = useDuplicateDoc({
    onSuccess: () => {
      toast(t('Document duplicated successfully!'), VariantType.SUCCESS, {
        duration: 3000,
      });
    },
    onError: () => {
      toast(t('Failed to duplicate the document...'), VariantType.ERROR, {
        duration: 3000,
      });
    },
  });

  const removeFavoriteDoc = useDeleteFavoriteDoc({
    listInvalideQueries: [KEY_LIST_DOC],
  });
  const makeFavoriteDoc = useCreateFavoriteDoc({
    listInvalideQueries: [KEY_LIST_DOC],
  });

  const options: DropdownMenuOption[] = [
    {
      label: doc.is_favorite ? t('Unpin') : t('Pin'),
      icon: 'push_pin',
      callback: () => {
        if (doc.is_favorite) {
          removeFavoriteDoc.mutate({ id: doc.id });
        } else {
          makeFavoriteDoc.mutate({ id: doc.id });
        }
      },
      testId: `docs-grid-actions-${doc.is_favorite ? 'unpin' : 'pin'}-${doc.id}`,
    },
    {
      label: t('Share'),
      icon: 'group',
      callback: () => {
        openShareModal?.();
      },

      testId: `docs-grid-actions-share-${doc.id}`,
    },
    {
      label: t('Duplicate'),
      icon: 'call_split',
      disabled: !doc.abilities.duplicate,
      callback: () => {
        duplicateDoc({
          docId: doc.id,
          with_accesses: false,
        });
      },
    },
    {
      label: t('Remove'),
      icon: 'delete',
      callback: () => deleteModal.open(),
      disabled: !doc.abilities.destroy,
      testId: `docs-grid-actions-remove-${doc.id}`,
    },
  ];

  return (
    <>
      <DropdownMenu options={options}>
        <Icon
          data-testid={`docs-grid-actions-button-${doc.id}`}
          iconName="more_horiz"
          $theme="primary"
          $variation="600"
        />
      </DropdownMenu>

      {deleteModal.isOpen && (
        <ModalRemoveDoc onClose={deleteModal.onClose} doc={doc} />
      )}
    </>
  );
};
