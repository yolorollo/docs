import { Box } from '@/components';
import { useDocStore } from '@/docs/doc-management';
import { DocTree } from '@/features/docs/doc-tree/components/DocTree';
import { useDocTreeStore } from '@/features/docs/doc-tree/context/DocTreeContext';

export const LeftPanelDocContent = () => {
  const { currentDoc } = useDocStore();

  const treeStore = useDocTreeStore();

  if (!currentDoc || !treeStore.initialTargetId) {
    return null;
  }

  return (
    <Box
      $flex={1}
      $width="100%"
      $css="width: 100%; overflow-y: auto; overflow-x: hidden;"
    >
      {treeStore.initialTargetId && (
        <DocTree initialTargetId={treeStore.initialTargetId} />
      )}
    </Box>
  );
};
