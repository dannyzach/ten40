import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Dropzone from 'react-dropzone';
import { Upload, X } from "lucide-react";

interface UploadReceiptProps {
    onUploadComplete: () => void;
}

export const UploadReceipt: React.FC<UploadReceiptProps> = ({ onUploadComplete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const handleFileUpload = async (file: File) => {
        if (file.size > 15 * 1024 * 1024) {
            setError('File size too large. Maximum size is 15MB.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const controller = new AbortController();
        setAbortController(controller);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            onUploadComplete();
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            if (err instanceof Error && err.name === 'TimeoutError') {
                setError('Upload timed out. Please try again.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Upload failed');
            }
        } finally {
            setIsUploading(false);
            setAbortController(null);
        }
    };

    return (
        <div className="mb-8 p-6 border border-dashed rounded-lg bg-white shadow-sm">
            <Dropzone
                accept="image/jpeg,image/png"
                multiple={false}
                onDrop={async (acceptedFiles) => {
                    if (acceptedFiles.length > 0) {
                        await handleFileUpload(acceptedFiles[0]);
                    }
                }}
            >
                {({getRootProps, getInputProps}) => (
                    <div 
                        {...getRootProps()} 
                        className="flex flex-col items-center justify-center gap-4"
                    >
                        <input {...getInputProps()} />
                        <div className="rounded-full bg-muted p-4">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md text-xs font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Receipt
                        </button>
                        <p className="text-sm text-muted-foreground">
                            or drag and drop a receipt image here
                        </p>
                        
                        {error && (
                            <div className="text-destructive text-sm flex items-center gap-2">
                                <X className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        
                        {isUploading && (
                            <div className="text-sm text-muted-foreground">
                                Uploading...
                            </div>
                        )}
                    </div>
                )}
            </Dropzone>
        </div>
    );
};

export default UploadReceipt; 