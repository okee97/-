
import React from 'react';
import type { ImageFile } from '../types';

interface ImagePreviewCardProps {
  imageFile: ImageFile;
  onRemove: (id: string) => void;
  downloadRef: (el: HTMLAnchorElement | null) => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const Spinner: React.FC = () => (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({ imageFile, onRemove, downloadRef }) => {
  const reduction = imageFile.originalSize && imageFile.compressedSize
    ? Math.round(((imageFile.originalSize - imageFile.compressedSize) / imageFile.originalSize) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-3 flex flex-col relative overflow-hidden">
      {imageFile.status === 'compressing' && <Spinner />}
      <div className="relative">
        <img src={imageFile.previewUrl} alt={imageFile.file.name} className="w-full h-40 object-cover rounded-lg" />
        <button
          onClick={() => onRemove(imageFile.id)}
          className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 transition-colors focus:outline-none"
          aria-label="Remove image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-grow pt-3">
        <p className="text-sm font-semibold text-gray-800 truncate" title={imageFile.file.name}>
          {imageFile.file.name}
        </p>
        <div className="text-xs text-gray-500 mt-1">
          <span>원본: {formatBytes(imageFile.originalSize)}</span>
          {imageFile.status === 'done' && imageFile.compressedSize !== undefined && (
            <span className="ml-2 font-medium text-blue-600">
              → 압축: {formatBytes(imageFile.compressedSize)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        {imageFile.status === 'done' && imageFile.compressedUrl && (
          <div className="text-center">
            <span className="text-sm font-bold text-green-600 bg-green-100 py-1 px-2 rounded-full">
              -{reduction}% 용량 감소
            </span>
            <a
              ref={downloadRef}
              href={imageFile.compressedUrl}
              download={`compressed-${imageFile.file.name}`}
              className="mt-3 w-full block bg-blue-500 text-white text-center text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              다운로드
            </a>
          </div>
        )}
        {imageFile.status === 'error' && (
          <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md text-center">
            오류: {imageFile.error || '압축 실패'}
          </p>
        )}
         {imageFile.status === 'pending' && (
          <div className="h-[58px] flex items-center justify-center text-sm text-gray-400">
              압축 대기 중
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreviewCard;
