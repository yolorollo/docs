import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import IconDocs from '@/assets/common/logo-docs-sm.png';
import { useCunninghamTheme } from '@/cunningham';
import Title from '@/features/header/components/Title/Title';
import { useResponsiveStore } from '@/stores';

import { Box } from './Box';

export const DocsTitle = () => {
  const theme = useCunninghamTheme();
  const { t } = useTranslation();
  const { isDesktop } = useResponsiveStore();
  const spacings = theme.spacingsTokens();
  const colors = theme.colorsTokens();
  return (
    <Box
      $align="center"
      $gap={spacings['3xs']}
      $direction="row"
      $position="relative"
      $height="fit-content"
    >
      <Image priority src={IconDocs} alt={t('Docs Logo')} width={25} />
      <Title />
    </Box>
  );
};
