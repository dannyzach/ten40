import React, { useState, useRef, useEffect } from 'react';

interface EditableCellProps {
    value: string | number | null;
    type: 'text' | 'date' | 'amount' | 'select';
    onSave: (newValue: string) => Promise<void>;
    options?: string[];
    disabled?: boolean;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}

const EditableCell: React.FC<EditableCellProps> = ({
    value,
    type,
    onSave,
    options = [],
    disabled = false,
    align = 'left',
    format: formatValue,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value != null) {
            setEditValue(value.toString());
        } else {
            setEditValue('');
        }
    }, [value]);

    return (
        // ... rest of the component code ...
    );
};

export default EditableCell; 