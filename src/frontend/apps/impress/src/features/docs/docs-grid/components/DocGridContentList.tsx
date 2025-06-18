import { DndContext, DragOverlay, Modifier } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import { TreeViewMoveModeEnum } from '@gouvfr-lasuite/ui-kit';
import { useModal } from '@openfun/cunningham-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Text } from '@/components';
import { AlertModal } from '@/components/AlertModal/AlertModal';
import { Doc, KEY_LIST_DOC, Role } from '@/docs/doc-management';
import { useMoveDoc } from '@/docs/doc-tree/api/useMove';

import { DocDragEndData, useDragAndDrop } from '../hooks/useDragAndDrop';

import { DocsGridItem } from './DocsGridItem';
import { Draggable } from './Draggable';
import { Droppable } from './Droppable';

const snapToTopLeft: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
}) => {
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);

    if (!activatorCoordinates) {
      return transform;
    }

    const offsetX = activatorCoordinates.x - draggingNodeRect.left;
    const offsetY = activatorCoordinates.y - draggingNodeRect.top;

    return {
      ...transform,
      x: transform.x + offsetX - 3,
      y: transform.y + offsetY - 3,
    };
  }

  return transform;
};

type DocGridContentListProps = {
  docs: Doc[];
};

export const DocGridContentList = ({ docs }: DocGridContentListProps) => {
  const { mutate: handleMove, isError } = useMoveDoc();
  const queryClient = useQueryClient();
  const modalConfirmation = useModal();
  const onDragData = useRef<DocDragEndData | null>(null);
  const onDrag = (data: DocDragEndData) => {
    onDragData.current = data;
    modalConfirmation.open();
  };

  const handleMoveDoc = () => {
    if (!onDragData.current) {
      return;
    }

    const { sourceDocumentId, targetDocumentId } = onDragData.current;
    modalConfirmation.onClose();
    if (!sourceDocumentId || !targetDocumentId) {
      onDragData.current = null;

      return;
    }

    handleMove(
      {
        sourceDocumentId,
        targetDocumentId,
        position: TreeViewMoveModeEnum.FIRST_CHILD,
      },
      {
        onSettled: () => {
          onDragData.current = null;
        },
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [KEY_LIST_DOC],
          });
        },
      },
    );
  };

  const {
    selectedDoc,
    canDrag,
    canDrop,
    sensors,
    handleDragStart,
    handleDragEnd,
    updateCanDrop,
  } = useDragAndDrop(onDrag);

  const { t } = useTranslation();

  const overlayText = useMemo(() => {
    if (!canDrag) {
      return t('You must be the owner to move the document');
    }
    if (!canDrop) {
      return t('You must be at least the editor of the target document');
    }

    return selectedDoc?.title || t('Unnamed document');
  }, [canDrag, canDrop, selectedDoc, t]);

  const overlayBgColor = useMemo(() => {
    if (!canDrag) {
      return 'var(--c--theme--colors--danger-600)';
    }
    if (canDrop !== undefined && !canDrop) {
      return 'var(--c--theme--colors--danger-600)';
    }
    if (isError) {
      return 'var(--c--theme--colors--danger-600)';
    }

    return '#5858D3';
  }, [canDrag, canDrop, isError]);

  if (docs.length === 0) {
    return null;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        modifiers={[snapToTopLeft]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {docs.map((doc) => (
          <DraggableDocGridItem
            key={doc.id}
            doc={doc}
            dragMode={!!selectedDoc}
            canDrag={!!canDrag}
            updateCanDrop={updateCanDrop}
          />
        ))}
        <DragOverlay dropAnimation={null}>
          <Box
            $width="fit-content"
            $padding={{ horizontal: 'xs', vertical: '3xs' }}
            $radius="12px"
            $background={overlayBgColor}
            data-testid="drag-doc-overlay"
            $height="auto"
            role="alert"
          >
            <Text $size="xs" $variation="000" $weight="500">
              {overlayText}
            </Text>
          </Box>
        </DragOverlay>
      </DndContext>
      {modalConfirmation.isOpen && (
        <AlertModal
          {...modalConfirmation}
          title={t('Move document')}
          description={
            <span
              dangerouslySetInnerHTML={{
                __html: t(
                  'By moving this document to <strong>{{targetDocumentTitle}}</strong>, it will lose its current access rights and inherit the permissions of that document. <strong>This access change cannot be undone.</strong>',
                  {
                    targetDocumentTitle:
                      onDragData.current?.target.title ?? t('Unnamed document'),
                  },
                ),
              }}
            />
          }
          confirmLabel={t('Move')}
          onConfirm={handleMoveDoc}
        />
      )}
    </>
  );
};

interface DocGridItemProps {
  doc: Doc;
  dragMode: boolean;
  canDrag: boolean;
  updateCanDrop: (canDrop: boolean, isOver: boolean) => void;
}

export const DraggableDocGridItem = ({
  doc,
  dragMode,
  canDrag,
  updateCanDrop,
}: DocGridItemProps) => {
  const userRole = doc.user_role;
  const canDropItem =
    userRole === Role.ADMIN ||
    userRole === Role.OWNER ||
    userRole === Role.EDITOR;

  return (
    <Droppable
      enabledDrop={canDrag}
      canDrop={canDrag && canDropItem}
      onOver={(isOver) => updateCanDrop(canDropItem, isOver)}
      id={doc.id}
      data={doc}
    >
      <Draggable id={doc.id} data={doc}>
        <DocsGridItem dragMode={dragMode} doc={doc} />
      </Draggable>
    </Droppable>
  );
};
