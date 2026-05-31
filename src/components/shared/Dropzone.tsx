import { useState, useRef, type ReactNode } from 'react';
import { Upload, CloudUpload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onFilesDrop?: (files: FileList) => void;
  accept?: string;
  maxSize?: string;
  children?: ReactNode;
  className?: string;
}

export default function Dropzone({ onFilesDrop, accept, maxSize = '50MB', children, className }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0 && onFilesDrop) {
      onFilesDrop(e.dataTransfer.files);
    }
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFilesDrop) {
      onFilesDrop(e.target.files);
    }
  };

  if (children) {
    return (
      <div
        className={cn(
          'h-full min-h-[250px] md:min-h-[500px] rounded-3xl md:rounded-[2.5rem] shadow-clay border-4 border-dashed p-4 md:p-container-padding flex flex-col items-center justify-center group cursor-pointer clay-spring transition-colors',
          isDragging ? 'border-primary bg-clay-green-light/20' : 'border-clay-green-main bg-surface-container-lowest dark:bg-black/5 hover:border-primary',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full min-h-[250px] md:min-h-[500px] rounded-3xl md:rounded-[2.5rem] shadow-clay border-4 border-dashed p-4 md:p-container-padding flex flex-col items-center justify-center group cursor-pointer clay-spring transition-colors',
        isDragging ? 'border-primary bg-clay-green-light/20' : 'border-clay-green-main bg-surface-container-lowest dark:bg-black/5 hover:border-primary',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />
      <div className="w-20 h-20 md:w-32 md:h-32 bg-surface-container-low dark:bg-inverse-surface rounded-2xl md:rounded-[2rem] shadow-clay-inset flex items-center justify-center mb-4 md:mb-8 group-hover:scale-110 clay-spring">
        <CloudUpload className={cn('w-8 h-8 md:w-16 md:h-16 text-clay-green-deep clay-spring transition-opacity', isDragging ? 'opacity-100' : 'opacity-30 group-hover:opacity-100')} />
      </div>
      <h3 className="font-headline text-xl md:text-2xl font-semibold text-on-surface mb-2">拖放图片到此处</h3>
      <p className="font-body text-sm md:text-base text-on-surface-variant mb-6 md:mb-8 text-center max-w-sm leading-normal">
        支持 JPG、PNG、WebP 和 GIF 格式<br />最大文件大小：{maxSize}
      </p>
      <button className="px-8 md:px-10 py-3 md:py-4 bg-clay-green-main text-clay-green-deep font-bold rounded-2xl shadow-clay clay-spring text-sm">
        浏览文件
      </button>
      <div className="hidden md:grid mt-16 grid-cols-2 gap-4 w-full max-w-md">
        <div className="p-4 bg-surface-container-low dark:bg-inverse-surface rounded-2xl flex items-center gap-3 shadow-clay-inset">
          <Upload className="w-4 h-4 text-clay-green-deep" />
          <span className="text-[10px] font-bold">安全处理</span>
        </div>
        <div className="p-4 bg-surface-container-low dark:bg-inverse-surface rounded-2xl flex items-center gap-3 shadow-clay-inset">
          <CloudUpload className="w-4 h-4 text-clay-green-deep" />
          <span className="text-[10px] font-bold">极速处理</span>
        </div>
      </div>
    </div>
  );
}
