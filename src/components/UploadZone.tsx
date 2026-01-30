import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
    onImagesSelected: (files: File[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImagesSelected }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImagesSelected(acceptedFiles);
        }
    }, [onImagesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: true
    });

    return (
        <div
            {...getRootProps()}
            className={`
        w-full p-10 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
        flex flex-col items-center justify-center text-center gap-4
        ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
      `}
        >
            <input {...getInputProps()} />
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {isDragActive ? (
                    <Upload className="w-8 h-8 text-blue-600" />
                ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
            </div>
            <div>
                <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? "Drop screenshots here" : "Drag & drop screenshots here"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    or click to select files
                </p>
            </div>
            <p className="text-xs text-gray-400">
                Supports PNG, JPG, WEBP
            </p>
        </div>
    );
};
