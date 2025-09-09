
import React, { useState, useCallback, useRef, useMemo } from 'react';
import ImageDropzone from './components/ImageDropzone';
import QualitySelector from './components/QualitySelector';
import ImagePreviewCard from './components/ImagePreviewCard';
import { QUALITY_OPTIONS } from './constants';
import type { ImageFile, QualityOption } from './types';

const Header: React.FC = () => (
  <header className="py-8 text-center">
    <h1 className="text-4xl font-bold text-gray-800">이미지 압축기</h1>
    <p className="mt-2 text-lg text-gray-500">
      품질을 선택하고 이미지를 업로드하여 용량을 줄여보세요.
    </p>
  </header>
);

const App: React.FC = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<QualityOption>(QUALITY_OPTIONS[2]);
  const [isCompressing, setIsCompressing] = useState(false);
  const downloadLinksRef = useRef<Record<string, HTMLAnchorElement | null>>({});

  const handleFilesAdded = useCallback((acceptedFiles: File[]) => {
    const newImageFiles: ImageFile[] = acceptedFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending',
      }));

    setFiles(prevFiles => [...prevFiles, ...newImageFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach(file => URL.revokeObjectURL(file.previewUrl));
    setFiles([]);
  }, [files]);

  const compressImage = useCallback(async (file: File, scale: number): Promise<{ compressedUrl: string; compressedSize: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context를 가져올 수 없습니다.'));
        }

        const newWidth = Math.round(img.width * scale);
        const newHeight = Math.round(img.height * scale);

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('이미지 압축에 실패했습니다.'));
            }
            const compressedUrl = URL.createObjectURL(blob);
            resolve({ compressedUrl, compressedSize: blob.size });
          },
          'image/jpeg',
          0.9
        );
      };
      img.onerror = () => {
        reject(new Error('이미지를 불러오는데 실패했습니다.'));
      };
    });
  }, []);

  const handleCompress = useCallback(async () => {
    setIsCompressing(true);
    setFiles(prevFiles => prevFiles.map(f => ({ ...f, status: 'compressing' })));

    const compressionPromises = files.map(imageFile =>
      compressImage(imageFile.file, quality.scale)
        .then(result => ({
          id: imageFile.id,
          status: 'done' as const,
          ...result,
        }))
        .catch(error => ({
          id: imageFile.id,
          status: 'error' as const,
          error: error.message,
        }))
    );

    const results = await Promise.all(compressionPromises);

    setFiles(prevFiles =>
      prevFiles.map(file => {
        const result = results.find(r => r.id === file.id);
        return result ? { ...file, ...result } : file;
      })
    );

    setIsCompressing(false);
  }, [files, quality.scale, compressImage]);
  
  const handleDownloadAll = useCallback(() => {
    Object.values(downloadLinksRef.current).forEach(link => {
      if (link) {
        link.click();
      }
    });
  }, []);

  const isAllCompressed = useMemo(() => files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error'), [files]);

  return (
    <div className="min-h-screen font-sans antialiased text-gray-800">
      <main className="container mx-auto max-w-5xl px-4 pb-12">
        <Header />

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/80">
          {files.length === 0 ? (
            <ImageDropzone onFilesAdded={handleFilesAdded} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">1. 압축 품질 선택</h2>
                  <p className="text-gray-500 mt-1 mb-4">원하는 이미지 해상도를 선택하세요.</p>
                  <QualitySelector
                    options={QUALITY_OPTIONS}
                    selectedOption={quality}
                    onOptionSelect={setQuality}
                  />
                </div>
                <div className="flex flex-col items-center space-y-4">
                   <button
                    onClick={handleCompress}
                    disabled={isCompressing || files.length === 0}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCompressing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        압축 중...
                      </>
                    ) : '2. 이미지 압축 시작'}
                  </button>
                  {isAllCompressed && (
                    <button
                      onClick={handleDownloadAll}
                      className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300"
                    >
                      모두 다운로드
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{files.length}개의 이미지 업로드됨</h3>
                    <div className="flex space-x-2">
                        <ImageDropzone onFilesAdded={handleFilesAdded} isCompact={true} />
                        <button onClick={handleClearAll} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                            전체 삭제
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map(file => (
                    <ImagePreviewCard 
                      key={file.id} 
                      imageFile={file} 
                      onRemove={handleRemoveFile}
                      downloadRef={(el) => { downloadLinksRef.current[file.id] = el; }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
