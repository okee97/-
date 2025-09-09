
import type { QualityOption } from './types';

export const QUALITY_OPTIONS: QualityOption[] = [
  { ppi: 330, label: 'HD 고품질', scale: 1, description: '330ppi' },
  { ppi: 220, label: '인쇄용 품질', scale: 220 / 330, description: '220ppi' },
  { ppi: 150, label: '웹용 품질', scale: 150 / 330, description: '150ppi' },
  { ppi: 96, label: '최소 품질', scale: 96 / 330, description: '96ppi' },
];
