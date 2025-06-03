import {
  BlockNoteSchema,
  PartialBlock,
  defaultBlockSpecs,
} from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { Request, Response } from 'express';
import * as Y from 'yjs';

import { logger, toBase64 } from '@/utils';

import { CalloutBlock, DividerBlock } from './custom-blocks';

const blockNoteSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    callout: CalloutBlock,
    divider: DividerBlock,
  },
});

type DocsBlockSchema = typeof blockNoteSchema.blockSchema;
type DocsInlineContentSchema = typeof blockNoteSchema.inlineContentSchema;
type DocsStyleSchema = typeof blockNoteSchema.styleSchema;

interface ConversionRequest {
  blocks: PartialBlock<DocsBlockSchema>[];
}

interface ConversionResponse {
  content: string;
}

interface ErrorResponse {
  error: string;
}

export const convertBlocksHandler = (
  req: Request<
    object,
    ConversionResponse | ErrorResponse,
    ConversionRequest,
    object
  >,
  res: Response<ConversionResponse | ErrorResponse>,
) => {
  const blocks = req.body?.blocks;
  if (!blocks) {
    res.status(400).json({ error: 'Invalid request: missing content' });
    return;
  }

  try {
    // Create a server editor with custom block schema
    const editor = ServerBlockNoteEditor.create<
      DocsBlockSchema,
      DocsInlineContentSchema,
      DocsStyleSchema
    >({
      schema: blockNoteSchema,
    });

    // Create a Yjs Document from blocks, and encode it as a base64 string
    const yDocument = editor.blocksToYDoc(blocks, 'document-store');
    const content = toBase64(Y.encodeStateAsUpdate(yDocument));

    res.status(200).json({ content });
  } catch (e) {
    logger('conversion failed:', e);
    res.status(500).json({ error: String(e) });
  }
};
