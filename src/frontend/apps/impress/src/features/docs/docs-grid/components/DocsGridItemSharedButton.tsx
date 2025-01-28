<<<<<<< HEAD
import { Button } from '@openfun/cunningham-react';
import { useMemo } from 'react';
=======
import { Button, Tooltip } from '@openfun/cunningham-react';
>>>>>>> 70048328d1b3226c4b0c8f9d93ec6c65b839c30d
import { useTranslation } from 'react-i18next';

import { Box, Icon, Text } from '@/components';

import { Doc } from '../../doc-management';

type Props = {
  doc: Doc;
  handleClick: () => void;
};
export const DocsGridItemSharedButton = ({ doc, handleClick }: Props) => {
<<<<<<< HEAD
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
=======
  const { t } = useTranslation();
  const sharedCount = doc.nb_accesses;
  const isShared = sharedCount - 1 > 0;

  if (!isShared) {
    return <Box $minWidth="50px">&nbsp;</Box>;
  }

  return (
    <Tooltip
      content={
        <Text $textAlign="center" $variation="000">
          {t('Shared with {{count}} users', { count: sharedCount })}
        </Text>
>>>>>>> 70048328d1b3226c4b0c8f9d93ec6c65b839c30d
      }
      placement="top"
    >
      <Button
        style={{ minWidth: '50px', justifyContent: 'center' }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleClick();
        }}
        color="tertiary"
        size="nano"
        icon={<Icon $variation="800" $theme="primary" iconName="group" />}
      >
        {sharedCount}
      </Button>
    </Tooltip>
  );
};
