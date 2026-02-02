import { useState } from 'react';
import styled from 'styled-components';
import { FiCheck, FiX, FiAlertTriangle, FiChevronDown } from 'react-icons/fi';
import type { StoredCluster } from '../api';
import { theme } from '../theme';
import { getStatusColor, getStatusBackground } from '../utils/statusHelpers';
import { formatDate } from '../utils/dateHelpers';
import { ListItem, Section, SectionTitle } from './shared';
import { CoverageStatus, SIMILARITY_THRESHOLDS } from '../constants';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.xl};
`;

const Modal = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.lg};
`;

const Header = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.primary};
  position: sticky;
  top: 0;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  z-index: 1;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
  color: ${theme.colors.text.muted};
  width: ${theme.spacing.xxl};
  height: ${theme.spacing.xxl};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.sm};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.primary};
  }
`;

const Question = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 40px ${theme.spacing.md} 0;
  line-height: ${theme.typography.lineHeight.normal};
`;

const Meta = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
`;

const Content = styled.div`
  padding: ${theme.spacing.xl};
`;

const CoverageBox = styled.div<{ $status: string }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background: ${props => getStatusBackground(props.$status)};
  border-left: 4px solid ${props => getStatusColor(props.$status)};
`;

const CoverageLabel = styled.div<{ $status: string }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => getStatusColor(props.$status)};
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CoverageExplanation = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const CollapsibleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: ${theme.spacing.sm} 0;
  user-select: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const CollapseIcon = styled.span<{ $isOpen: boolean }>`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const QuestionItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex: 1;
`;

const QuestionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

const QuestionDate = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
`;

const AskCount = styled.span<{ $status: string }>`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => getStatusColor(props.$status)};
  background: ${props => getStatusBackground(props.$status)};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${props => getStatusColor(props.$status)};
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FAQItem = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
`;

const FAQQuestion = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.base};
`;

const FAQAnswer = styled.div`
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing.sm};
`;

const FAQMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
`;

const SimilarityScore = styled.span<{ $score: number }>`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => 
    props.$score >= SIMILARITY_THRESHOLDS.HIGH ? getStatusColor(CoverageStatus.COVERED) : 
    props.$score >= SIMILARITY_THRESHOLDS.MEDIUM ? getStatusColor(CoverageStatus.PARTIALLY_COVERED) : 
    theme.colors.text.muted
  };
`;

interface ClusterDetailModalProps {
  cluster: StoredCluster;
  onClose: () => void;
}

export default function ClusterDetailModal({ cluster, onClose }: ClusterDetailModalProps) {
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case CoverageStatus.COVERED:
        return (
          <>
            <FiCheck size={16} />
            Covered
          </>
        );
      case CoverageStatus.PARTIALLY_COVERED:
        return (
          <>
            <FiAlertTriangle size={16} />
            Partially Covered
          </>
        );
      case CoverageStatus.NOT_COVERED:
        return (
          <>
            <FiX size={16} />
            Not Covered
          </>
        );
      default:
        return 'Unknown';
    }
  };
  
  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Question>{cluster.canonicalQuestion}</Question>
          <Meta>
            <span>{formatDate(cluster.createdAt)}</span>
          </Meta>
        </Header>
        
        <Content>
          {/* Coverage Status */}
          <Section>
            <SectionTitle>Coverage Status</SectionTitle>
            <CoverageBox $status={cluster.coverage.status}>
              <CoverageLabel $status={cluster.coverage.status}>
                {getStatusLabel(cluster.coverage.status)}
              </CoverageLabel>
              <CoverageExplanation>{cluster.coverage.explanation}</CoverageExplanation>
            </CoverageBox>
          </Section>
          
          {/* Questions */}
          <Section>
            <CollapsibleHeader onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}>
              <SectionTitle style={{ margin: 0 }}>Questions ({cluster.questions.length})</SectionTitle>
              <CollapseIcon $isOpen={isQuestionsOpen}>
                <FiChevronDown size={20} />
              </CollapseIcon>
            </CollapsibleHeader>
            {isQuestionsOpen && (
              <QuestionList>
                {cluster.questions.map((q) => (
                  <ListItem key={q.id}>
                    <QuestionItemContent>
                      <QuestionRow>
                        <span>{q.question}</span>
                        {q.askCount > 1 && <AskCount $status={cluster.coverage.status}>asked x{q.askCount}</AskCount>}
                      </QuestionRow>
                      <QuestionDate>{formatDate(q.createdAt)}</QuestionDate>
                    </QuestionItemContent>
                  </ListItem>
                ))}
              </QuestionList>
            )}
          </Section>
          
          {/* FAQ Matches */}
          {cluster.faqMatches && cluster.faqMatches.length > 0 && (
            <Section>
              <SectionTitle>Matching FAQs ({cluster.faqMatches.length})</SectionTitle>
              <FAQList>
                {cluster.faqMatches.map((faq, index) => (
                  <FAQItem key={index}>
                    <FAQQuestion>Q: {faq.question}</FAQQuestion>
                    <FAQAnswer>A: {faq.answer}</FAQAnswer>
                    <FAQMeta>
                      <span>{faq.category}</span>
                      <SimilarityScore $score={faq.similarity}>
                        {(faq.similarity * 100).toFixed(0)}% match
                      </SimilarityScore>
                    </FAQMeta>
                  </FAQItem>
                ))}
              </FAQList>
            </Section>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
}
