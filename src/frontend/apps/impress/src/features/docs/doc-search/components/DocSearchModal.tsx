import { Modal, ModalProps, ModalSize } from '@openfun/cunningham-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';

import { Box } from '@/components';
import { useTreeStore } from '@/components/common/tree/treeStore';
import {
  QuickSearch,
  QuickSearchData,
  QuickSearchGroup,
} from '@/components/quick-search';
import { Doc, useInfiniteDocs } from '@/features/docs/doc-management';
import { useResponsiveStore } from '@/stores';

import EmptySearchIcon from '../assets/illustration-docs-empty.png';

import { DocSearchFilters, DocSearchFiltersValues } from './DocSearchFilters';
import { DocSearchItem } from './DocSearchItem';

type DocSearchModalProps = ModalProps & {
  showFilters?: boolean;
  defaultFilters?: DocSearchFiltersValues;
};

export const DocSearchModal = ({
  showFilters = false,
  defaultFilters,
  ...modalProps
}: DocSearchModalProps) => {
  const { t } = useTranslation();
  const { rootId, initialNode, reset } = useTreeStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DocSearchFiltersValues>(
    defaultFilters ?? {},
  );
  const { isDesktop } = useResponsiveStore();

  const {
    data,
    isFetching,
    isRefetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteDocs({
    page: 1,
    title: search,
    ...filters,
    parent_id: rootId,
  });
  const loading = isFetching || isRefetching || isLoading;
  const handleInputSearch = useDebouncedCallback(setSearch, 300);

  const handleSelect = (doc: Doc) => {
    if (initialNode?.id !== doc.id) {
      reset(doc.id, [], doc);
    }
    router.push(`/docs/${doc.id}`);
    modalProps.onClose?.();
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const docsData: QuickSearchData<Doc> = useMemo(() => {
    const docs = data?.pages.flatMap((page) => page.results) || [];
    const groupName =
      filters.target != null ? t('Select a sub-page') : t('Select a page');
    return {
      groupName: docs.length > 0 ? groupName : '',
      elements: search ? docs : [],
      emptyString: t('No document found'),
      endActions: hasNextPage
        ? [{ content: <InView onChange={() => void fetchNextPage()} /> }]
        : [],
    };
  }, [data, hasNextPage, fetchNextPage, t, search, filters.target]);

  return (
    <Modal
      {...modalProps}
      closeOnClickOutside
      size={isDesktop ? ModalSize.LARGE : ModalSize.FULL}
    >
      <Box
        aria-label={t('Search modal')}
        $direction="column"
        $justify="space-between"
      >
        <QuickSearch
          placeholder={t('Type the name of a document')}
          loading={loading}
          onFilter={handleInputSearch}
        >
          <Box $height={isDesktop ? '500px' : 'calc(100vh - 68px - 1rem)'}>
            {showFilters && (
              <DocSearchFilters
                values={filters}
                onValuesChange={setFilters}
                onReset={handleResetFilters}
              />
            )}
            {search.length === 0 && (
              <Box
                $direction="column"
                $height="100%"
                $align="center"
                $justify="center"
              >
                <Image
                  width={320}
                  src={EmptySearchIcon}
                  alt={t('No active search')}
                />
              </Box>
            )}
            {search && (
              <QuickSearchGroup
                onSelect={handleSelect}
                group={docsData}
                renderElement={(doc) => (
                  <DocSearchItem isSubPage={filters.target != null} doc={doc} />
                )}
              />
            )}
          </Box>
        </QuickSearch>
      </Box>
    </Modal>
  );
};
