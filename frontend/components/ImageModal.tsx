import React from 'react';

interface ImageModalProps {
    imagePath: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imagePath, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <img 
                    src={`/api/images/${imagePath}`}
                    alt="Receipt"
                    className="modal-image"
                />
            </div>
        </div>
    );
};

export default ImageModal; 