import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadFile, validateFile } from '../../services/uploadService';

const FileUpload = ({
  uploadType = 'chat-attachment',
  accept = 'image/*,video/*,.pdf',
  maxSize = 50 * 1024 * 1024,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  token,
  multiple = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file
    const validation = validateFile(file, maxSize);
    if (!validation.valid) {
      setError(validation.error);
      onUploadError?.(validation.error);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const result = await uploadFile(file, uploadType, token, setUploadProgress);
      
      setUploadProgress(100);
      onUploadSuccess?.(result);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
      onUploadError?.(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          disabled || isUploading
            ? 'border-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
            : 'border-snap-yellow bg-snap-darkMid hover:bg-snap-dark'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <>
            <Upload className="mx-auto mb-2 text-snap-yellow" size={32} />
            <p className="text-sm font-semibold mb-2">Uploading...</p>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-snap-yellow h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-snap-white50 mt-2">{Math.round(uploadProgress)}%</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto mb-2 text-snap-yellow" size={32} />
            <p className="text-sm font-semibold">Drag file here or click to select</p>
            <p className="text-xs text-snap-white50 mt-1">Max file size: {maxSize / 1024 / 1024}MB</p>
          </>
        )}

        {error && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
