import React, { useCallback, useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { ReceiptTable } from './ReceiptTable';
import { ImageViewer } from './ImageViewer';
import { JsonViewer } from './JsonViewer';
import { Receipt } from '@/types';

export const ReceiptUploader: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [fileName, setFileName] = useState("");
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedJson, setSelectedJson] = useState<any | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);

    // Fetch receipts on component mount
    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const response = await fetch('/api/receipts');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setReceipts(data);
        } catch (error) {
            console.error('Error fetching receipts:', error);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const validateFile = (file: File) => {
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Only JPEG and PNG files are supported');
            setUploadStatus('error');
            return false;
        }
        return true;
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length) {
            const file = files[0];
            if (validateFile(file)) {
                await handleUpload(file);
            }
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            await handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setFileName(file.name);
        setUploadStatus('uploading');
        setUploadProgress(0);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            setUploadStatus('success');
            setUploadProgress(100);
            await fetchReceipts(); // Refresh the list after successful upload
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setUploadError(error instanceof Error ? error.message : 'Upload failed');
        }
    };

    return (
        <>
            <div
                className={`relative w-full h-64 rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out
                    ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
                    ${uploadStatus === "success" ? "border-green-500 bg-green-50" : ""}
                    ${uploadStatus === "error" ? "border-red-500 bg-red-50" : ""}
                `}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload receipt"
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Upload
                        className={`w-12 h-12 mb-4 transition-colors duration-200
                            ${isDragging ? "text-blue-500" : "text-gray-400"}
                            ${uploadStatus === "success" ? "text-green-500" : ""}
                            ${uploadStatus === "error" ? "text-red-500" : ""}
                        `}
                    />

                    <p className="mb-2 text-lg font-medium text-gray-700">
                        {uploadStatus === "success" ? "Upload Complete!"
                            : uploadStatus === "error" ? "Upload Failed"
                            : "Drag and drop your receipt here"}
                    </p>

                    <p className="mb-4 text-sm text-gray-500">
                        {uploadStatus === "error" ? uploadError
                            : "Or click to browse files (JPEG, PNG)"}
                    </p>

                    {uploadStatus === 'idle' && (
                        <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors duration-200">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png"
                                onChange={handleFileSelect}
                            />
                            Browse Files
                        </label>
                    )}
                </div>
            </div>

            {uploadStatus === 'uploading' && (
                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{fileName}</span>
                        <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-8">
                <ReceiptTable 
                    receipts={receipts}
                    onViewImage={setSelectedImage}
                    onViewJson={setSelectedJson}
                    onDelete={setDeleteConfirmOpen}
                />
            </div>

            {selectedImage && (
                <ImageViewer
                    imagePath={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
            
            {selectedJson && (
                <JsonViewer
                    data={selectedJson}
                    onClose={() => setSelectedJson(null)}
                />
            )}
        </>
    );
};

export default ReceiptUploader; 