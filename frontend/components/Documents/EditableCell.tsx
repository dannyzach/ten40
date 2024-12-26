import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  TableCell,
  ClickAwayListener,
  Select,
  MenuItem,
  InputAdornment,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface EditableCellProps {
  value: string | number | null;
  type: 'text' | 'date' | 'amount' | 'select';
  onSave: (newValue: string) => Promise<void>;
  options?: string[];
  disabled?: boolean;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
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
    setEditValue(value != null ? value.toString() : '');
  }, [value]);

  const handleClick = () => {
    if (!disabled) {
      console.log('EditableCell: Starting edit mode:', { type, value });
      setIsEditing(true);
    }
  };

  const exitEditMode = () => {
    setIsEditing(false);
    setEditValue(value.toString());
    setError(null);
  };

  const handleSave = async () => {
    if (!isEditing) return;
    
    try {
      if (type === 'date') {
        console.log('EditableCell.handleSave: Processing date value:', {
          editValue,
          type: typeof editValue
        });
        
        // If the value is empty, don't process it
        if (!editValue.trim()) {
          console.log('EditableCell.handleSave: Empty date value, skipping');
          await onSave('');
          setError(null);
          exitEditMode();
          return;
        }

        // Try to parse the date
        const date = parse(editValue.trim(), 'yyyy-MM-dd', new Date(), { locale: enUS });
        console.log('EditableCell.handleSave: Parsed date:', {
          date,
          isValid: isValid(date)
        });

        if (!isValid(date)) {
          console.error('EditableCell.handleSave: Invalid date format:', editValue);
          throw new Error('Please use YYYY-MM-DD format');
        }

        // Format the date for saving
        const formattedDate = format(date, 'yyyy-MM-dd', { locale: enUS });
        console.log('EditableCell.handleSave: Sending formatted date:', formattedDate);
        
        await onSave(formattedDate);
        console.log('EditableCell.handleSave: Date saved successfully');
        setError(null);
      } else if (type === 'amount') {
        const amount = parseFloat(editValue.replace(/[^\d.-]/g, ''));
        if (isNaN(amount)) {
          throw new Error('Invalid amount format');
        }
        await onSave(amount.toString());
        setError(null);
      } else {
        await onSave(editValue);
        setError(null);
      }
      exitEditMode();
    } catch (err) {
      console.error('EditableCell.handleSave: Error saving value:', {
        error: err,
        type,
        value: editValue
      });
      setError(err instanceof Error ? err.message : 'An error occurred');
      return;
    }
  };

  const handleDateChange = (newValue: Date | null) => {
    console.log('EditableCell.handleDateChange: New date selected:', {
      newValue,
      isValid: newValue && isValid(newValue)
    });

    if (newValue && isValid(newValue)) {
      const formattedDate = format(newValue, 'yyyy-MM-dd', { locale: enUS });
      console.log('EditableCell.handleDateChange: Formatted date:', formattedDate);
      setEditValue(formattedDate);
      setError(null);
    } else {
      console.log('EditableCell.handleDateChange: Invalid or null date');
      setEditValue('');
      setError('Please select a valid date');
    }
  };

  const parseDate = (dateStr: string) => {
    console.log('EditableCell.parseDate: Input:', {
      value: dateStr,
      type: typeof dateStr
    });
    
    try {
      if (!dateStr || dateStr === 'Invalid Date') {
        console.log('EditableCell.parseDate: Empty or Invalid Date string');
        return null;
      }
      const trimmedDate = dateStr.trim();
      console.log('EditableCell.parseDate: Trimmed:', trimmedDate);
      
      const date = parse(trimmedDate, 'yyyy-MM-dd', new Date(), { locale: enUS });
      console.log('EditableCell.parseDate: Parsed result:', {
        date,
        isValid: isValid(date)
      });
      
      return isValid(date) ? date : null;
    } catch (e) {
      console.error('EditableCell.parseDate: Error:', e);
      return null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      exitEditMode();
    }
  };

  if (!isEditing) {
    return (
      <TableCell
        align={align}
        onClick={handleClick}
        sx={{ 
          cursor: disabled ? 'default' : 'pointer',
          padding: '16px',
          '&:hover': {
            backgroundColor: disabled ? 'transparent' : 'action.hover',
          }
        }}
      >
        {formatValue ? formatValue(value) : value}
      </TableCell>
    );
  }

  return (
    <TableCell 
      align={align} 
      padding="none"
      sx={{
        position: 'relative',
        '& .MuiInputBase-root': {
          backgroundColor: 'background.paper',
        }
      }}
    >
      <ClickAwayListener onClickAway={handleSave}>
        <Box sx={{ p: 1 }}>
          {type === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={parseDate(editValue)}
                onChange={handleDateChange}
                format="yyyy-MM-dd"
                slotProps={{
                  textField: {
                    error: !!error,
                    helperText: error || 'Use format: YYYY-MM-DD',
                    onKeyDown: handleKeyDown,
                    size: "small",
                    fullWidth: true,
                    inputRef: inputRef,
                    sx: { backgroundColor: 'background.paper' }
                  }
                }}
              />
            </LocalizationProvider>
          ) : type === 'amount' ? (
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!error}
              helperText={error}
              size="small"
              fullWidth
              inputRef={inputRef}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ backgroundColor: 'background.paper' }}
            />
          ) : type === 'select' ? (
            <Select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              fullWidth
              sx={{ backgroundColor: 'background.paper' }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!error}
              helperText={error}
              size="small"
              fullWidth
              inputRef={inputRef}
              sx={{ backgroundColor: 'background.paper' }}
            />
          )}
        </Box>
      </ClickAwayListener>
    </TableCell>
  );
}; 