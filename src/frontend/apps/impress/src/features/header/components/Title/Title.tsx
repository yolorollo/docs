import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { Box, Text } from '@/components/';
import { useCunninghamTheme } from '@/cunningham';

type TitleProps = {
  size?: 'sm' | 'md';
};

const Title = ({ size = 'sm' }: TitleProps) => {
  const { t } = useTranslation();
  const theme = useCunninghamTheme();
  const spacings = theme.spacingsTokens();
  const colors = theme.colorsTokens();

  return (
    <Box
      $direction="row"
      $align="center"
      $gap={size === 'sm' ? spacings['2xs'] : '18px'}
    >
      <Text
        $margin="none"
        as="h2"
        $color="#000091"
        $zIndex={1}
        $size={size === 'sm' ? '1.30rem' : '48px'}
      >
        {t('Docs')}
      </Text>
      <Text
        $padding={{
          horizontal: size === 'sm' ? '2xs' : '13px',
          vertical: size === 'sm' ? '3xs' : '9px',
        }}
        $size={size === 'sm' ? '11px' : '24px'}
        $theme="primary"
        $variation="500"
        $weight="bold"
        $radius={size === 'sm' ? '12px' : '24px'}
        $css={css`
          line-height: ${size === 'sm' ? '16px' : '20px'};
        `}
        $background={colors['primary-200']}
      >
        BETA
      </Text>
    </Box>
  );
};

export default Title;
