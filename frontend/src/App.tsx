import { useEffect } from 'react';
import styled from 'styled-components';
import QuestionInput from './components/QuestionInput';
import ClusterListView from './components/ClusterListView';
import ClusterDetailModal from './components/ClusterDetailModal';
import { useAppStore } from './store/appStore';
import { theme } from './theme';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.xl};
`;

const MaxWidthContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: ${theme.spacing.xxl};
  padding-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.primary};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xxxl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.muted};
  margin: 0;
`;

const Card = styled.div`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  border: 1px solid ${theme.colors.border.primary};
  margin-bottom: ${theme.spacing.xl};
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ErrorBox = styled.div`
  background: ${theme.colors.status.notCovered.background};
  border: 1px solid ${theme.colors.status.notCovered.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  color: ${theme.colors.status.notCovered.light};
  font-size: ${theme.typography.fontSize.base};
  margin-top: ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.status.notCovered.light};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.lg};
  padding: 0;
  width: ${theme.spacing.xl};
  height: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.sm};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: rgba(255, 82, 82, 0.2);
  }
`;

function App() {
  // Subscribe only to the state you need
  const clusters = useAppStore((state) => state.clusters);
  const selectedCluster = useAppStore((state) => state.selectedCluster);
  const isLoadingClusters = useAppStore((state) => state.isLoadingClusters);
  const error = useAppStore((state) => state.error);
  
  // Actions don't cause re-renders
  const analyzeBatch = useAppStore((state) => state.analyzeBatch);
  const selectCluster = useAppStore((state) => state.selectCluster);
  const clearError = useAppStore((state) => state.clearError);

  const handleAnalyze = async (questions: string[]) => {
    await analyzeBatch(questions);
  };

  useEffect(() => {
    // Load clusters once on mount
    useAppStore.getState().loadClusters(100);
  }, []);

  return (
    <AppContainer>
      <MaxWidthContainer>
        <Header>
          <Title>FAQ Coverage Assistant</Title>
          <Subtitle>
            Analyze questions to find matching FAQs
          </Subtitle>
        </Header>

        <Card>
          <QuestionInput onAnalyze={handleAnalyze} />

          {error && (
            <ErrorBox>
              <span>{error}</span>
              <CloseButton onClick={clearError}>×</CloseButton>
            </ErrorBox>
          )}
        </Card>

        <ClusterListView 
          clusters={clusters}
          loading={isLoadingClusters}
          onCardClick={selectCluster}
        />
        
        {selectedCluster && (
          <ClusterDetailModal 
            cluster={selectedCluster}
            onClose={() => selectCluster(null)}
          />
        )}
      </MaxWidthContainer>
    </AppContainer>
  );
}

export default App;
