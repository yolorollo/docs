/* eslint-disable react-hooks/rules-of-hooks */
import {
  ReactRendererProps,
  defaultProps,
  insertOrUpdateBlock,
} from '@blocknote/core';
import { BlockTypeSelectItem, createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DefaultColorStyle,
  Editor as TLDEditor,
  TLGeoShape,
  TLShapePartial,
  Tldraw,
  createShapeId,
  toRichText,
  useEditor,
} from 'tldraw';
import 'tldraw/tldraw.css';

import { Box, Icon } from '@/components';
import { useProviderStore } from '@/features/docs/doc-management/stores/useProviderStore';

import { DocsBlockNoteEditor } from '../../types';

/**
 * Collaborative Draw block spec.
 *
 * We leverage BlockNote's `propSchema` to persist two key props:
 * - `roomId`: A stable identifier so all participants load the same provider / yjs room.
 * - `drawingData`: A frozen TLDraw snapshot when the provider is *not* connected (e.g. offline) or for history replay.
 *
 * TLDraw's multiplayer features are provided by our own `useProviderStore`, which memo‑izes a y‑websocket provider for every `roomId`.
 */
export const DrawBlock = createReactBlockSpec(
  {
    type: 'draw',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      backgroundColor: defaultProps.backgroundColor,
      /**
       * Persisted TLDraw snapshot – serialised via the built‑in `store.getSnapshot()`.
       * When a new collaborator first loads the document we hydrate the store from here
       * before connecting to the yjs provider so local history is preserved.
       */
      drawingData: {
        default: null as ReturnType<TLDEditor['store']['getSnapshot']> | null,
      },
      /**
       * A stable identifier for the collaborative room. We automatically generate one
       * when the block is first inserted (see the slash‑menu helper).
       */
      roomId: {
        default: '',
      },
    },
    content: 'inline',
  },
  {
    render: ({ block, editor }: ReactRendererProps<'draw'>) => {
      const { roomId, drawingData } = block.props;

      /**
       * Pull (or create) a provider & TLStore for this `roomId`. Internally this wires up
       * a y‑websocket provider and binds it to TLDraw's store for real‑time sync.
       */
      const { store, isSynced } = useProviderStore((state) =>
        state.getOrCreateTLDrawStore(roomId),
      );

      // Hold a local reference so we can access the editor instance inside callbacks.
      const tldrawEditorRef = useRef<TLDEditor | null>(null);
      const [isHydrated, setIsHydrated] = useState(false);

      /**
       * When TLDraw mounts we hydrate the store *once* with any persisted snapshot. This means
       * a fresh collaborator immediately sees the last known state even before the provider
       * finishes syncing.
       */
      const handleMount = useCallback(
        (tldrEditor: TLDEditor) => {
          tldrawEditorRef.current = tldrEditor;

          if (!isHydrated && drawingData) {
            // Load the snapshot into the store. We intentionally do this before provider sync.
            tldrEditor.store.loadSnapshot(drawingData);
            setIsHydrated(true);
          }

          // Observe local changes and push them back into the BlockNote block props so they are
          // versioned inside the doc history ("undo" across different block types still works!)
          const dispose = tldrEditor.store.listen(() => {
            const snapshot = tldrEditor.store.getSnapshot();
            editor.updateBlock(block.id, {
              props: {
                ...block.props,
                drawingData: snapshot,
              },
            });
          });

          return () => dispose();
        },
        [block.id, block.props, drawingData, editor, isHydrated],
      );

      return (
        <Box style={{ width: '100%', height: 300 }}>
          <Tldraw
            store={store}
            onMount={handleMount}
            // We intentionally don’t pass the snapshot here; hydration is handled in `onMount`.
          />
        </Box>
      );
    },
  },
);

/**
 * Slash‑menu helper → inserts a new collaborative draw block with a unique `roomId`.
 */
export const getDrawReactSlashMenuItems = (
  editor: DocsBlockNoteEditor,
  t: TFunction<'translation', undefined>,
  group: string,
) => [
  {
    title: t('Draw'),
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: 'draw',
        props: {
          roomId: `drawing-${Date.now()}`,
          drawingData: null,
        },
      });
    },
    aliases: ['draw'],
    group,
    icon: <Icon iconName="draw" $size="18px" />,
    subtext: t('Add a collaborative canvas'),
  },
];

/**
 * Formatting‑toolbar item so users can transform an existing block into a Draw block.
 */
export const getDrawFormattingToolbarItems = (
  t: TFunction<'translation', undefined>,
): BlockTypeSelectItem => ({
  name: t('Draw'),
  type: 'draw',
  icon: () => <Icon iconName="lightbulb" $size="16px" />,
  isSelected: (block) => block.type === 'draw',
});
