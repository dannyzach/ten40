import React, { useState } from 'react';

interface UploadReceiptProps {
    onUploadComplete: () => void;
}

const UploadReceipt: React.FC<UploadReceiptProps> = ({ onUploadComplete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) { // 15MB limit
            setError('File size too large. Maximum size is 15MB.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(120000)
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            onUploadComplete();
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'TimeoutError') {
                setError('Upload timed out. Please try again.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Upload failed');
            }
        } finally {
            setIsUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <div className="upload-receipt">
            <label className={`upload-button ${isUploading ? 'disabled' : ''}`}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isUploading}
                    className="file-input"
                />
                {isUploading ? (
                    <span>
                        <div className="spinner small" />
                        Processing...
                    </span>
                ) : (
                    'Upload Receipt'
                )}
            </label>
            {isUploading && (
                <div className="processing-status">
                    <div className="spinner dark" />
                    <span>Processing receipt (this may take up to a minute)...</span>
                </div>
            )}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default UploadReceipt; 