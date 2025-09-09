
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedUrl?: string;
  compressedSize?: number;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
}

export interface QualityOption {
  ppi: number;
  label: string;
  scale: number;
  description: string;
}
