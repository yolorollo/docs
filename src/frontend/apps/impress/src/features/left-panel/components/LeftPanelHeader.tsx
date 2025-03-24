import { Button, ModalSize, useModal } from '@openfun/cunningham-react';
import { t } from 'i18next';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';

import { Box, Icon, SeparatedSection } from '@/components';
import { DocSearchModal } from '@/docs/doc-search';
import { useAuth } from '@/features/auth';
import { useCreateDoc, useDocStore } from '@/features/docs/doc-management';
import { DocSearchTarget } from '@/features/docs/doc-search/components/DocSearchFilters';
import { useCreateChildrenDoc } from '@/features/docs/doc-tree/api/useCreateChildren';
import { useDocTreeStore } from '@/features/docs/doc-tree/context/DocTreeContext';
import { useCmdK } from '@/hook/useCmdK';

import { useLeftPanelStore } from '../stores';

export const LeftPanelHeader = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const searchModal = useModal();
  const { authenticated } = useAuth();
  const treeStore = useDocTreeStore();

  const { currentDoc } = useDocStore();
  const isDoc = router.pathname === '/docs/[id]';

  useCmdK(() => {
    const isEditorToolbarOpen =
      document.getElementsByClassName('bn-formatting-toolbar').length > 0;
    if (isEditorToolbarOpen) {
      return;
    }

    searchModal.open();
  });
  const { togglePanel } = useLeftPanelStore();

  const { mutate: createDoc } = useCreateDoc({
    onSuccess: (doc) => {
      void router.push(`/docs/${doc.id}`);
      togglePanel();
    },
  });

  const { mutate: createChildrenDoc } = useCreateChildrenDoc({
    onSuccess: (doc) => {
      treeStore.treeData?.addRootNode(doc);
      treeStore.treeData?.selectNodeById(doc.id);
      void router.push(`/docs/${doc.id}`);
      togglePanel();
    },
  });

  const goToHome = () => {
    void router.push('/');
    togglePanel();
  };

  const createNewDoc = () => {
    if (treeStore.root && isDoc) {
      createChildrenDoc({
        title: t('Untitled page'),
        parentId: treeStore.root.id,
      });
    } else {
      createDoc();
    }
  };

  return (
    <>
      <Box $width="100%" className="panel-header">
        <SeparatedSection>
          <Box
            $padding={{ horizontal: 'sm' }}
            $width="100%"
            $direction="row"
            $justify="space-between"
            $align="center"
          >
            <Box $direction="row" $gap="2px">
              <Button
                onClick={goToHome}
                size="medium"
                color="tertiary-text"
                icon={
                  <Icon $variation="800" $theme="primary" iconName="house" />
                }
              />
              {authenticated && (
                <Button
                  onClick={searchModal.open}
                  size="medium"
                  color="tertiary-text"
                  icon={
                    <Icon $variation="800" $theme="primary" iconName="search" />
                  }
                />
              )}
            </Box>

            {authenticated && (
              <Button
                color={!isDoc ? 'primary' : 'tertiary'}
                onClick={createNewDoc}
                disabled={currentDoc && !currentDoc.abilities.update}
              >
                {t(isDoc ? 'New page' : 'New doc')}
              </Button>
            )}
          </Box>
        </SeparatedSection>
        {children}
      </Box>
      {searchModal.isOpen && (
        <DocSearchModal
          {...searchModal}
          size={ModalSize.LARGE}
          showFilters={isDoc}
          defaultFilters={{
            target: isDoc ? DocSearchTarget.CURRENT : undefined,
          }}
        />
      )}
    </>
  );
};
