import { theme } from '../theme';
import { CoverageStatus } from '../constants';

export const getStatusColor = (status: string) => {
  switch (status) {
    case CoverageStatus.COVERED:
      return theme.colors.status.covered.primary;
    case CoverageStatus.PARTIALLY_COVERED:
      return theme.colors.status.partial.primary;
    case CoverageStatus.NOT_COVERED:
      return theme.colors.status.notCovered.primary;
    default:
      return theme.colors.border.secondary;
  }
};

export const getStatusBackground = (status: string) => {
  switch (status) {
    case CoverageStatus.COVERED:
      return theme.colors.status.covered.background;
    case CoverageStatus.PARTIALLY_COVERED:
      return theme.colors.status.partial.background;
    case CoverageStatus.NOT_COVERED:
      return theme.colors.status.notCovered.background;
    default:
      return theme.colors.background.tertiary;
  }
};
