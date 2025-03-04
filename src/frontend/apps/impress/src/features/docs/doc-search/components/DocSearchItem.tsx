import { Box, Icon } from '@/components';
import { QuickSearchItemContent } from '@/components/quick-search/';
import { Doc } from '@/features/docs/doc-management';
import { SimpleDocItem } from '@/features/docs/docs-grid/';
import { useResponsiveStore } from '@/stores';

import { LightDocItem } from '../../docs-grid/components/LightDocItem';

type DocSearchItemProps = {
  doc: Doc;
  isSubPage?: boolean;
};

export const DocSearchItem = ({
  doc,
  isSubPage = false,
}: DocSearchItemProps) => {
  const { isDesktop } = useResponsiveStore();

  return (
    <Box data-testid={`doc-search-item-${doc.id}`} $width="100%">
      <QuickSearchItemContent
        left={
          <>
            <Box $direction="row" $align="center" $gap="10px" $width="100%">
              <Box $flex={isDesktop ? 9 : 1}>
                {isSubPage ? (
                  <LightDocItem doc={doc} showActions={false} />
                ) : (
                  <SimpleDocItem doc={doc} showAccesses />
                )}
              </Box>
            </Box>
          </>
        }
        right={
          <Icon iconName="keyboard_return" $theme="primary" $variation="800" />
        }
      />
    </Box>
  );
};
