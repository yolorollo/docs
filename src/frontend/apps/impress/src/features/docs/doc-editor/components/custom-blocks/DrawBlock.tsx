/* eslint-disable react-hooks/rules-of-hooks */
import {
  ReactRendererProps,
  defaultProps,
  insertOrUpdateBlock,
} from '@blocknote/core';
import { BlockTypeSelectItem, createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { Editor, TLEventMapHandler, TLStore, Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

import { Box, Icon } from '@/components';

import { DocsBlockNoteEditor } from '../../types';

import _ from 'lodash';

/**
 * ----------------------------------------------------------------------------------
 * Collaborative **Draw** block – backed by a Y‑js document synced through
 * `@hocuspocus/provider` (see `useProviderStore`).
 * ----------------------------------------------------------------------------------
 *
 * Each Draw block owns its own Y‑Doc, identified by `roomId` (persisted in `propSchema`).
 * The block serialises a base‑64‑encoded Y‑js update (`drawingData`) so newcomers see
 * the latest snapshot _immediately_, without waiting for the websocket connection.
 */
export const DrawBlock = createReactBlockSpec(
  {
    type: 'draw',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      backgroundColor: defaultProps.backgroundColor,
    },
    content: 'inline',
  },
  {
    render: ({ block, editorBN }: ReactRendererProps<'draw'>) => {
      const [editor, setEditor] = useState<Editor>();

      const setAppToState = useCallback((editor: Editor) => {
        setEditor(editor);
      }, []);

      const [storeEvents, setStoreEvents] = useState<string[]>([]);

      useEffect(() => {
        if (!editor) {
          return;
        }

        function logChangeEvent(eventName: string) {
          console.log(eventName);
          setStoreEvents((events) => [...events, eventName]);
        }

        //[1]
        const handleChangeEvent: TLEventMapHandler<'change'> = (change) => {
          // Added
          for (const record of Object.values(change.changes.added)) {
            if (record.typeName === 'shape') {
              logChangeEvent(`created shape (${record.type})\n`);
            }
          }

          // Updated
          for (const [from, to] of Object.values(change.changes.updated)) {
            if (
              from.typeName === 'instance' &&
              to.typeName === 'instance' &&
              from.currentPageId !== to.currentPageId
            ) {
              logChangeEvent(
                `changed page (${from.currentPageId}, ${to.currentPageId})`,
              );
            } else if (
              from.id.startsWith('shape') &&
              to.id.startsWith('shape')
            ) {
              let diff = _.reduce(
                from,
                (result: any[], value, key: string) =>
                  _.isEqual(value, to[key])
                    ? result
                    : result.concat([key, to[key]]),
                [],
              );
              if (diff?.[0] === 'props') {
                diff = _.reduce(
                  from.props,
                  (result: any[], value, key) =>
                    _.isEqual(value, to.props[key])
                      ? result
                      : result.concat([key, to.props[key]]),
                  [],
                );
              }
              logChangeEvent(`updated shape (${JSON.stringify(diff)})\n`);
            }
          }

          // Removed
          for (const record of Object.values(change.changes.removed)) {
            if (record.typeName === 'shape') {
              logChangeEvent(`deleted shape (${record.type})\n`);
            }
          }
        };

        // [2]
        const cleanupFunction = editor.store.listen(handleChangeEvent, {
          source: 'user',
          scope: 'all',
        });

        return () => {
          cleanupFunction();
        };
      }, [editor]);

      return (
        <Box style={{ width: '100%', height: 300 }}>
          {/*
           * We deliberately pass the TL‑store directly. TLDraw will observe the
           * changes – including those coming over the wire – and re‑render.
           */}
          <Tldraw onMount={setAppToState} />
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
