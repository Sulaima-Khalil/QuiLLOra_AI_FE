import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";

export const ConfirmDialog = ({ open, title, description, confirmLabel = "Confirm", onConfirm, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{description}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} sx={{ color: "text.secondary" }}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm}>{confirmLabel}</Button>
    </DialogActions>
  </Dialog>
);
