import { useId } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";

/**
 * Confirm-or-cancel dialog.
 *
 * MUI does not wire `DialogTitle` to the dialog's accessible name on its own —
 * the ids have to be passed explicitly, or the dialog announces as an unnamed
 * "dialog" and the user has to go looking for what they are being asked.
 *
 * Everything else is MUI's and is deliberately not reimplemented: the focus
 * trap, Escape-to-close, and returning focus to the control that opened it.
 */
export const ConfirmDialog = ({ open, title, description, confirmLabel = "Confirm", onConfirm, onClose }) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography id={descriptionId} variant="body2" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
};
