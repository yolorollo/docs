import { Button } from '@openfun/cunningham-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Icon } from '@/components';

import { Doc, LinkReach } from '../../doc-management';

type Props = {
  doc: Doc;
  handleClick: () => void;
};
export const DocsGridItemSharedButton = ({ doc, handleClick }: Props) => {
  const isPublic = doc.link_reach === LinkReach.PUBLIC;
  const isAuthenticated = doc.link_reach === LinkReach.AUTHENTICATED;
  const isRestricted = doc.link_reach === LinkReach.RESTRICTED;
  const sharedCount = doc.nb_accesses - 1;
  const isShared = sharedCount > 0;
  const { t } = useTranslation();

  const { icon, label } = useMemo(() => {
    if (isPublic) {
      return {
        icon: 'public',
        label: 'Anyone with the link can see the document',
      };
    }
    if (isAuthenticated) {
      return {
        icon: 'corporate_fare',
        label:
          'Anyone with the link can view the document if they are logged in',
      };
    }
    if (isRestricted) {
      return { icon: 'group', label: 'Only invited people can access' };
    }

    return { icon: 'undefined', label: '' };
  }, [isPublic, isAuthenticated, isRestricted]);

  if (!icon) {
    return null;
  }

  if (!doc.abilities.accesses_view) {
    return (
      <Box $align="center" $width="100%">
        <Icon $variation="800" $theme="primary" iconName={icon} />
      </Box>
    );
  }

  return (
    <Button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleClick();
      }}
      fullWidth
      color={isRestricted ? 'tertiary' : 'primary'}
      size="nano"
      aria-label={t(`${label}`)}
      icon={
        <span aria-hidden="true">
          <Icon
            $variation={isRestricted ? '800' : '000'}
            $theme={isRestricted ? 'primary' : 'greyscale'}
            iconName={icon}
          />
        </span>
      }
    >
      {isShared ? sharedCount : undefined}
    </Button>
  );
};
