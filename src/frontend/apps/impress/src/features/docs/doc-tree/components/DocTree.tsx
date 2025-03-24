import {
  OpenMap,
  TreeView,
  TreeViewMoveResult,
  useTree,
} from '@gouvfr-lasuite/ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { css } from 'styled-components';

import { Box, SeparatedSection, StyledLink } from '@/components';
import { useCunninghamTheme } from '@/cunningham';

import {
  Doc,
  KEY_DOC,
  LinkReach,
  LinkRole,
  getDoc,
} from '../../doc-management';
import { SimpleDocItem } from '../../docs-grid';
import { getDocChildren } from '../api/useDocChildren';
import { useDocTree } from '../api/useDocTree';
import { useMoveDoc } from '../api/useMove';
import { subPageToTree, useDocTreeStore } from '../context/DocTreeContext';

import { DocSubPageItem } from './DocSubPageItem';
import { DocTreeItemActions } from './DocTreeItemActions';

type DocTreeProps = {
  initialTargetId: string;
};
export const DocTree = ({ initialTargetId }: DocTreeProps) => {
  const { spacingsTokens } = useCunninghamTheme();
  const queryClient = useQueryClient();
  const store = useDocTreeStore();

  const spacing = spacingsTokens();

  const treeData = useTree(
    [],
    async (docId) => {
      const doc = await getDoc({ id: docId });
      const newDoc = { ...doc, childrenCount: doc.numchild };
      void queryClient.setQueryData([KEY_DOC, { id: docId }], newDoc);
      return newDoc;
    },
    async (docId) => {
      const doc = await getDocChildren({ docId: docId });
      return subPageToTree(doc.results ?? []);
    },
  );
  const router = useRouter();
  const [initialOpenState, setInitialOpenState] = useState<OpenMap | undefined>(
    undefined,
  );

  const { mutate: moveDoc } = useMoveDoc();

  const { data } = useDocTree({
    docId: initialTargetId,
  });

  const handleMove = (result: TreeViewMoveResult) => {
    moveDoc({
      sourceDocumentId: result.sourceId,
      targetDocumentId: result.targetModeId,
      position: result.mode,
    });
    treeData?.handleMove(result);
  };

  const buildDocTree = (data?: Doc) => {
    if (!data) {
      return;
    }
    const { children: rootChildren, ...root } = data;
    const children = rootChildren ?? [];
    store.setRoot(root);
    const initialOpenState: OpenMap = {};
    initialOpenState[root.id] = true;
    subPageToTree(children, (child) => {
      if (child?.children?.length && child?.children?.length > 0) {
        initialOpenState[child.id] = true;
      }
    });

    treeData.resetTree(children);
    setInitialOpenState(initialOpenState);
    if (initialTargetId === root.id) {
      treeData?.setSelectedNode(root);
    } else {
      treeData?.selectNodeById(initialTargetId);
    }
  };

  useEffect(() => {
    if (treeData?.selectedNode?.id !== store.selectedNode?.id) {
      store.setSelectedNode(treeData?.selectedNode ?? null);
    }
  }, [store, treeData?.selectedNode]);

  useEffect(() => {
    buildDocTree(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const rootIsSelected = treeData?.selectedNode?.id === store.root?.id;

  if (!initialTargetId) {
    return null;
  }

  return (
    <Box data-testid="doc-tree" $height="100%">
      <SeparatedSection showSeparator={false}>
        <Box $padding={{ horizontal: 'sm' }}>
          <Box
            $css={css`
              padding: ${spacing['2xs']};
              border-radius: 4px;
              width: 100%;
              background-color: ${rootIsSelected
                ? 'var(--c--theme--colors--greyscale-100)'
                : 'transparent'};

              &:hover {
                background-color: var(--c--theme--colors--greyscale-100);
              }

              .doc-tree-root-item-actions {
                display: 'flex';
                opacity: 0;

                &:has(.isOpen) {
                  opacity: 1;
                }
              }
              &:hover {
                .doc-tree-root-item-actions {
                  opacity: 1;
                }
              }
            `}
          >
            {store.root !== null && (
              <StyledLink
                $css={css`
                  width: 100%;
                `}
                href={`/docs/${store.root.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  treeData?.setSelectedNode(store.root ?? undefined);
                  router.push(`/docs/${store.root?.id}`);
                }}
              >
                <Box $direction="row" $align="center" $width="100%">
                  <SimpleDocItem doc={store.root} showAccesses={true} />
                  <div className="doc-tree-root-item-actions">
                    <DocTreeItemActions
                      doc={store.root}
                      treeData={treeData}
                      onCreateSuccess={(createdDoc) => {
                        const newDoc = {
                          ...createdDoc,
                          children: [],
                          childrenCount: 0,
                          parentId: store.root?.id ?? undefined,
                        };
                        treeData?.addChild(null, newDoc);
                      }}
                    />
                  </div>
                </Box>
              </StyledLink>
            )}
          </Box>
        </Box>
      </SeparatedSection>
      <button
        onClick={() => {
          const children = data?.children ?? [];
          const newDoc = {
            id: '1',
            children: [],
            childrenCount: 0,
            title: 'TITI',
            creator: 'test',
            is_favorite: false,
          };

          // Ajout des propriétés manquantes pour correspondre au type Doc
          const completeDoc = {
            ...newDoc,
            link_reach: LinkReach.PUBLIC,
            link_role: LinkRole.EDITOR,
            user_roles: [],
            // Ajoutez ici les autres propriétés requises par le type Doc
          };

          children.push(completeDoc);
          buildDocTree(data);
        }}
      >
        Refresh
      </button>

      {initialOpenState && treeData.nodes.length > 0 && (
        <TreeView
          handleMove={handleMove}
          initialOpenState={initialOpenState}
          selectedNodeId={
            treeData.selectedNode?.id ?? store.initialTargetId ?? undefined
          }
          treeData={treeData.nodes ?? []}
          rootNodeId={store.root?.id ?? ''}
          renderNode={(props) => {
            if (treeData === undefined) {
              return null;
            }
            return (
              <DocSubPageItem
                {...props}
                treeData={treeData}
                doc={props.node.data.value as Doc}
                loadChildren={(node) => treeData.handleLoadChildren(node.id)}
                setSelectedNode={(node) => treeData.setSelectedNode(node)}
              />
            );
          }}
        />
      )}
    </Box>
  );
};
