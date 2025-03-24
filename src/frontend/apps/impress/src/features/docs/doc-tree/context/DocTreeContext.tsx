import { TreeViewDataType } from '@gouvfr-lasuite/ui-kit';
import { create } from 'zustand';

import { Doc } from '../../doc-management';

export const subPageToTree = (
  children: Doc[],
  callback?: (doc: Doc) => void,
): TreeViewDataType<Doc>[] => {
  children.forEach((child) => {
    child.childrenCount = child.numchild ?? 0;
    callback?.(child);
    subPageToTree(child.children ?? [], callback);
  });
  return children;
};

interface DocTreeStore {
  initialTargetId?: string | null;
  initialRootId?: string | null;
  setRoot: (doc: Doc | null) => void;
  root: Doc | null;
  setInitialTargetId: (id: string) => void;
  setSelectedNode: (node: Doc | null) => void;
  selectedNode: Doc | null;
}

export const useDocTreeStore = create<DocTreeStore>((set) => ({
  root: null,
  selectedNode: null,
  initialTargetId: undefined,
  initialRootId: undefined,

  setRoot: (doc) => set({ root: doc }),
  setInitialTargetId: (id) => set({ initialTargetId: id }),
  setSelectedNode: (node) => set({ selectedNode: node }),
}));
