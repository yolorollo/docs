import { useEffect, useState } from 'react';

import { useProviderStore } from '../stores';
import { Doc, LinkReach } from '../types';

export const useIsCollaborativeEditable = (doc: Doc) => {
  const { isConnected } = useProviderStore();

  const docIsPublic = doc.link_reach === LinkReach.PUBLIC;
  const docIsAuth = doc.link_reach === LinkReach.AUTHENTICATED;
  const docHasMember = doc.nb_accesses_direct > 1;
  const isShared = docIsPublic || docIsAuth || docHasMember;
  const [isEditable, setIsEditable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Connection can take a few seconds
   */
  useEffect(() => {
    const _isEditable = isConnected || !isShared;
    setIsLoading(true);

    if (_isEditable) {
      setIsEditable(true);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsEditable(false);
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isConnected, isShared]);

  return {
    isEditable,
    isLoading,
  };
};
