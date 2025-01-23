import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  TableCell,
  Select,
  MenuItem,
  InputAdornment,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { useClickAway } from '@/hooks/useClickAway';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface EditableCellProps {
  value: string | number | null;
  type: 'text' | 'date' | 'amount' | 'select';
  onSave: (newValue: string) => Promise<void>;
  options?: string[];
  disabled?: boolean;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
  onBlur?: () => void;
  autoFocus?: boolean;
  sx?: React.CSSProperties;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  type,
  options,
  onSave,
  onBlur,
  autoFocus
}) => {
  const [editValue, setEditValue] = useState(value);
  
  const handleSave = async () => {
    try {
      await onSave(String(editValue));
    } finally {
      onBlur?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onBlur?.();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (type === 'date') {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          value={editValue ? new Date(editValue) : null}
          onChange={(newValue) => {
            if (newValue) {
              try {
                // Ensure date is valid
                const date = new Date(newValue);
                if (isNaN(date.getTime())) {
                  console.error('Invalid date');
                  return;
                }
                
                // Format as YYYY-MM-DD for API
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const formatted = `${year}-${month}-${day}`;
                
                setEditValue(formatted);
                onSave(formatted);
              } catch (error) {
                console.error('Date parsing error:', error);
              }
            }
          }}
          format="MM/dd/yyyy"  // US format for display
          slotProps={{
            textField: {
              variant: "standard",
              size: "small",
              fullWidth: true,
              onBlur: handleBlur
            }
          }}
        />
      </LocalizationProvider>
    );
  }

  if (type === 'select' && options) {
    return (
      <Select
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        variant="standard"
        size="small"
        fullWidth
      >
        {options.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <TextField
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      autoFocus={autoFocus}
      variant="standard"
      size="small"
      fullWidth
      type={type === 'amount' ? 'number' : 'text'}
    />
  );
}; 