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
  const cellRef = useRef<HTMLTableCellElement>(null);

  const exitEditMode = () => {
    console.log('EditableCell: Exiting edit mode:', { 
      type, 
      value: editValue,
      isEditing,
      timestamp: new Date().getTime()
    });
    setIsEditing(false);
    setEditValue(value?.toString() ?? '');
    setError(null);
  };

  const handleSave = async (event: MouseEvent | TouchEvent) => {
    console.log('EditableCell: handleSave called:', { 
      type, 
      value: editValue,
      isEditing,
      eventType: event.type,
      timestamp: new Date().getTime()
    });
    
    if (!isEditing) return;

    try {
      if (type !== 'select') {
        console.log('EditableCell: Saving non-select value:', { type, value: editValue });
        await onSave(editValue);
        console.log('EditableCell: Save successful:', { type, value: editValue });
      }
      setError(null);
    } catch (err) {
      console.error('EditableCell.handleSave: Error saving value:', {
        error: err,
        type,
        value: editValue
      });
      setError(err instanceof Error ? err.message : 'An error occurred');
      return;
    } finally {
      exitEditMode();
    }
  };

  const listenClickAway = useClickAway(cellRef, (event) => {
    console.log('EditableCell: Click away detected:', { 
      type, 
      value: editValue,
      isEditing,
      eventType: event.type,
      target: (event.target as HTMLElement).tagName,
      targetClass: (event.target as HTMLElement).className,
      timestamp: new Date().getTime()
    });
    handleSave(event);
  });

  useEffect(() => {
    setEditValue(value?.toString() ?? '');
  }, [value]);

  const handleClick = (event: React.MouseEvent) => {
    console.log('EditableCell: Cell clicked:', {
      type,
      value,
      isEditing,
      timestamp: new Date().getTime()
    });
    
    event.stopPropagation();
    if (!disabled) {
      console.log('EditableCell: Starting edit mode:', { type, value });
      setIsEditing(true);
      listenClickAway(true);
    }
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.stopPropagation();
    setEditValue(event.target.value);
  };

  const handleSelectChange = (
    event: SelectChangeEvent<string>
  ) => {
    event.stopPropagation();
    const newValue = event.target.value;
    setEditValue(newValue);
    
    // Select-specific handling
    onSave(newValue)
        .then(() => {
            setError(null);
            exitEditMode();
        })
        .catch((err) => {
            setError(err instanceof Error ? err.message : 'An error occurred');
        });
  };

  if (!isEditing) {
    return (
      <TableCell
        ref={cellRef}
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
      ref={cellRef}
      align={align} 
      padding="none"
      sx={{
        position: 'relative',
        '& .MuiInputBase-root': {
          backgroundColor: 'background.paper',
        }
      }}
    >
      <Box sx={{ p: 1 }}>
        {type === 'select' ? (
          <Select
            value={editValue}
            onChange={handleSelectChange}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                exitEditMode();
              }
            }}
            size="small"
            fullWidth
            open={isEditing}
            sx={{ backgroundColor: 'background.paper' }}
          >
            {options.map((option) => (
              <MenuItem 
                key={option} 
                value={option}
                onClick={(e) => {
                  console.log('EditableCell: MenuItem clicked:', { 
                    option, 
                    type,
                    currentValue: editValue,
                    isEditing,
                    timestamp: new Date().getTime()
                  });
                  e.stopPropagation();
                }}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <TextField
            value={editValue}
            onChange={handleTextChange}
            error={!!error}
            helperText={error}
            size="small"
            fullWidth
            type={type}
            sx={{ backgroundColor: 'background.paper' }}
          />
        )}
      </Box>
    </TableCell>
  );
}; 