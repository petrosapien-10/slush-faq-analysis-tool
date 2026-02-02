import { useState } from 'react';
import styled from 'styled-components';
import type { StoredCluster } from '../api';
import { theme } from '../theme';
import { getStatusColor, getStatusBackground } from '../utils/statusHelpers';
import { formatDate } from '../utils/dateHelpers';
import { CoverageStatus, SortOption, FilterOption, SORT_OPTIONS, FILTER_OPTIONS, STATUS_LABELS, UI_TEXT } from '../constants';

const Container = styled.div`
  margin-top: ${theme.spacing.xl};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xxl};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0;
  color: ${theme.colors.text.primary};
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

const Controls = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  cursor: pointer;
`;

const Legend = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: ${theme.borderRadius.full};
    background: ${props => props.$color};
  }
`;

const ListContainer = styled.div`
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.primary};
  overflow: hidden;
`;

const ListItem = styled.div<{ $status: string }>`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.primary};
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${props => getStatusBackground(props.$status)};
  }
`;

const QuestionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Question = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const MetaInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
  flex-wrap: wrap;
  align-items: center;
`;

const StatusDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: ${theme.borderRadius.full};
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const QuestionCount = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
  font-weight: ${theme.typography.fontWeight.medium};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px ${theme.spacing.xl};
  color: ${theme.colors.text.muted};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.primary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.text.muted};
  font-size: ${theme.typography.fontSize.base};
`;

interface ClusterListViewProps {
  clusters: StoredCluster[];
  loading: boolean;
  onCardClick: (cluster: StoredCluster) => void;
}

export default function ClusterListView({ clusters, loading, onCardClick }: ClusterListViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.NEWEST);
  const [filterBy, setFilterBy] = useState<FilterOption>(FILTER_OPTIONS.ALL);
  
  if (loading) {
    return (
      <Container>
        <LoadingState>{UI_TEXT.LOADING}</LoadingState>
      </Container>
    );
  }
  
  if (clusters.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Question Clusters</Title>
        </Header>
        <EmptyState>
          {UI_TEXT.EMPTY_STATE}
        </EmptyState>
      </Container>
    );
  }
  
  // Filter clusters
  const filteredClusters = filterBy === FILTER_OPTIONS.ALL
    ? clusters 
    : clusters.filter(c => c.coverage.status === filterBy as string);
  
  // Sort clusters
  const sortedClusters = [...filteredClusters].sort((a, b) => {
    if (sortBy === SORT_OPTIONS.NEWEST) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === SORT_OPTIONS.OLDEST) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return b.totalAsks - a.totalAsks;
    }
  });
  
  return (
    <Container>
      <Header>
        <HeaderRow>
          <Title>Question Clusters ({clusters.length})</Title>
          <Legend>
            <LegendItem $color={getStatusColor(CoverageStatus.COVERED)}>{STATUS_LABELS[CoverageStatus.COVERED]}</LegendItem>
            <LegendItem $color={getStatusColor(CoverageStatus.PARTIALLY_COVERED)}>{STATUS_LABELS[CoverageStatus.PARTIALLY_COVERED]}</LegendItem>
            <LegendItem $color={getStatusColor(CoverageStatus.NOT_COVERED)}>{STATUS_LABELS[CoverageStatus.NOT_COVERED]}</LegendItem>
          </Legend>
        </HeaderRow>
        <Controls>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value={SORT_OPTIONS.NEWEST}>Newest First</option>
            <option value={SORT_OPTIONS.OLDEST}>Oldest First</option>
            <option value={SORT_OPTIONS.MOST_ASKED}>Most Asked</option>
          </Select>
          <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value as FilterOption)}>
            <option value={FILTER_OPTIONS.ALL}>All</option>
            <option value={FILTER_OPTIONS.COVERED}>Covered</option>
            <option value={FILTER_OPTIONS.PARTIALLY_COVERED}>Partially Covered</option>
            <option value={FILTER_OPTIONS.NOT_COVERED}>Not Covered</option>
          </Select>
        </Controls>
      </Header>
      
      {sortedClusters.length === 0 ? (
        <EmptyState>
          {UI_TEXT.NO_FILTER_MATCH}
        </EmptyState>
      ) : (
        <ListContainer>
          {sortedClusters.map((cluster) => (
            <ListItem 
              key={cluster.clusterId}
              $status={cluster.coverage.status}
              onClick={() => onCardClick(cluster)}
            >
              <QuestionContent>
                <Question>
                  <StatusDot $color={getStatusColor(cluster.coverage.status)} />
                  {cluster.canonicalQuestion}
                </Question>
                <MetaInfo>
                  <span>{formatDate(cluster.createdAt)}</span>
                </MetaInfo>
              </QuestionContent>
              <QuestionCount>
                x{cluster.totalAsks}
              </QuestionCount>
            </ListItem>
          ))}
        </ListContainer>
      )}
    </Container>
  );
}
