'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      if (files.length > maxFiles) {
        errors.push(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`);
        return { valid: [], errors };
      }

      files.forEach((file) => {
        if (file.size > maxSize) {
          errors.push(`${file.name}: 파일 크기가 ${formatBytes(maxSize)}를 초과합니다.`);
        } else {
          valid.push(file);
        }
      });

      return { valid, errors };
    },
    [maxSize, maxFiles]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const files = Array.from(fileList);
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setError(errors.join('\n'));
      } else {
        setError(null);
      }

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // 같은 파일 재선택 가능하게
    e.target.value = '';
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center p-8',
          'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed hover:border-gray-300'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <svg
          className={cn(
            'w-12 h-12 mb-4',
            isDragging ? 'text-blue-500' : 'text-gray-400'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mb-2 text-sm text-gray-600">
          <span className="font-semibold text-blue-600">클릭하여 파일 선택</span> 또는
          드래그 앤 드롭
        </p>
        <p className="text-xs text-gray-500">
          {accept ? `허용 형식: ${accept}` : '모든 파일 형식'} (최대 {formatBytes(maxSize)})
        </p>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface FilePreview {
  file: File;
  preview?: string;
}

interface FileUploadWithPreviewProps extends Omit<FileUploadProps, 'onFilesSelected'> {
  value?: File[];
  onChange?: (files: File[]) => void;
  showPreview?: boolean;
}

export function FileUploadWithPreview({
  value = [],
  onChange,
  showPreview = true,
  ...props
}: FileUploadWithPreviewProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const handleFilesSelected = useCallback(
    (newFiles: File[]) => {
      const allFiles = [...value, ...newFiles];
      onChange?.(allFiles);

      // 이미지 미리보기 생성
      newFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews((prev) => [
              ...prev,
              { file, preview: reader.result as string },
            ]);
          };
          reader.readAsDataURL(file);
        } else {
          setPreviews((prev) => [...prev, { file }]);
        }
      });
    },
    [value, onChange]
  );

  const handleRemove = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <FileUpload onFilesSelected={handleFilesSelected} {...props} />

      {showPreview && value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((file, index) => {
            const preview = previews.find((p) => p.file === file);
            return (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden bg-gray-100"
              >
                {preview?.preview ? (
                  <img
                    src={preview.preview}
                    alt={file.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="p-2 text-xs text-gray-600 truncate">{file.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string | null, file?: File) => void;
  aspectRatio?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio = '1/1',
  disabled = false,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setPreview(url);
        onChange?.(url, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-gray-100',
        disabled && 'opacity-50',
        className
      )}
      style={{ aspectRatio }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      {preview ? (
        <>
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-colors"
        >
          <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">이미지 업로드</span>
        </button>
      )}
    </div>
  );
}
