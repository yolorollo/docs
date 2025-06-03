/* eslint-disable react-hooks/rules-of-hooks */
import { defaultProps, insertOrUpdateBlock } from '@blocknote/core';
import { BlockTypeSelectItem, createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { css } from 'styled-components';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

import { Box, BoxButton, Icon } from '@/components';

import { DocsBlockNoteEditor } from '../../types';

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
    render: ({ block, editor, contentRef }) => {
      //const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

      // // Temporary: sets a yellow background color to a draw block when added by
      // // the user, while keeping the colors menu on the drag handler usable for
      // // this custom block.
      // useEffect(() => {
      //   if (
      //     !block.content.length &&
      //     block.props.backgroundColor === 'default'
      //   ) {
      //     editor.updateBlock(block, { props: { backgroundColor: 'yellow' } });
      //   }
      // }, [block, editor]);

      return (
        <Box style={{ width: '100%', height: 300 }}>
          <Tldraw />
        </Box>
      );
    },
  },
);

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
      });
    },
    aliases: ['draw'],
    group,
    icon: <Icon iconName="draw" $size="18px" />,
    subtext: t('Add a draw block'),
  },
];

export const getDrawFormattingToolbarItems = (
  t: TFunction<'translation', undefined>,
): BlockTypeSelectItem => ({
  name: t('Draw'),
  type: 'draw',
  icon: () => <Icon iconName="lightbulb" $size="16px" />,
  isSelected: (block) => block.type === 'draw',
});
