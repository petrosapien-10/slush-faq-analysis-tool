import styled from 'styled-components';
import { theme } from '../theme';

export const ListItem = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.primary};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.muted};
  margin: 0 0 ${theme.spacing.md} 0;
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;
