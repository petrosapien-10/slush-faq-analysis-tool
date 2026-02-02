import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  align-items: center;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.base};
  resize: vertical;
  box-sizing: border-box;
  background: ${theme.colors.background.tertiary};
  color: ${theme.colors.text.primary};
  align-self: stretch;
  transition: ${theme.transitions.normal};
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.text.primary};
  }
`;

const Button = styled.button`
  background: ${theme.colors.text.secondary};
  color: ${theme.colors.background.primary};
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  min-width: 150px;

  &:hover:not(:disabled) {
    background: ${theme.colors.text.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${theme.colors.border.primary};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonSpinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid ${theme.colors.text.primary};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

interface QuestionInputProps {
  onAnalyze: (questions: string[]) => Promise<void>;
}

export default function QuestionInput({ onAnalyze }: QuestionInputProps) {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    
    setIsSubmitting(true);
    try {
      await onAnalyze([trimmed]);
      setInputText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      if (isSubmitting) return;
      e.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <Container>
      <Textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter a question..."
        disabled={isSubmitting}
      />
      <Button 
        onClick={handleSubmit}
        disabled={!inputText.trim() || isSubmitting}
      >
        {isSubmitting && <ButtonSpinner />}
        <span>{isSubmitting ? 'Analyzing...' : 'Analyze Question'}</span>
      </Button>
    </Container>
  );
}