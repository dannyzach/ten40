import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface DialogWrapperProps {
    title: string;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const DialogWrapper = ({ title, open, onClose, children }: DialogWrapperProps) => (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between' }}>
            {title}
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
            {children}
        </DialogContent>
    </Dialog>
); 