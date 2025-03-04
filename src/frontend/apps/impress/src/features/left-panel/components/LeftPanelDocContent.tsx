import { useEffect } from 'react';

import { Box } from '@/components';
import { useTreeStore } from '@/components/common/tree/treeStore';
import { useDocStore } from '@/features/docs/doc-management';
import { DocTree } from '@/features/docs/doc-tree/components/DocTree';

export const LeftPanelDocContent = () => {
  // const { rootId } = useDocRootTreeStore();
  const { currentDoc, setCurrentDoc } = useDocStore();
  const { reset, initialNode } = useTreeStore();

  useEffect(() => {
    return () => {
      setCurrentDoc(undefined);
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentDoc) {
    return null;
  }

  return (
    <Box
      $flex={1}
      $width="100%"
      $css="width: 100%; overflow-y: auto; overflow-x: hidden;"
    >
      {initialNode?.id}
      {initialNode && <DocTree docId={initialNode.id} />}
    </Box>
  );
};
