import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, MenuItem, Select, InputLabel, FormControl, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { getDiscounts, createDiscount, deleteDiscount, getUsers } from "../api";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ user: "", title: "", percentDiscount: "", expirationDate: "" });

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [dc, us] = await Promise.all([getDiscounts(), getUsers()]);
      setDiscounts(dc); setUsers(us);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const defaultExpiry = () => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; };
  const handleOpen = () => { setForm({ user: "", title: "", percentDiscount: "", expirationDate: defaultExpiry() }); setOpen(true); };

  const handleCreate = async () => {
    try {
      const payload = {
        user: form.user,
        title: form.title,
        percentDiscount: Number(form.percentDiscount),
      };
      if (form.expirationDate) payload.expirationDate = new Date(form.expirationDate).toISOString();
      await createDiscount(payload);
      setSuccess("Zniżka dodana!"); setOpen(false);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteDiscount(id); setSuccess("Zniżka usunięta!"); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Zniżki osobiste</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Dodaj zniżkę</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress color="error" /></Box> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "error.main", color: "white" } }}>
                <TableCell>Użytkownik</TableCell>
                <TableCell>Tytuł zniżki</TableCell>
                <TableCell>Procent</TableCell>
                <TableCell>Wygasa</TableCell>
                <TableCell>Wykorzystana</TableCell>
                <TableCell>Dodano</TableCell>
                <TableCell align="center">Akcja</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((d) => {
                const expired = d.expirationDate && new Date(d.expirationDate) < new Date();
                return (
                  <TableRow key={d._id} hover sx={{ opacity: d.isUsed || expired ? 0.6 : 1 }}>
                    <TableCell>
                      {d.user?.firstName} {d.user?.lastName}
                      <br /><Typography variant="caption" color="text.secondary">{d.user?.email}</Typography>
                    </TableCell>
                    <TableCell>{d.title}</TableCell>
                    <TableCell><strong style={{ color: "#c62828" }}>-{d.percentDiscount}%</strong></TableCell>
                    <TableCell>
                      <Typography variant="body2" color={expired ? "error" : "text.primary"}>
                        {d.expirationDate ? new Date(d.expirationDate).toLocaleDateString("pl-PL") : "—"}
                        {expired && " (wygasła)"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={d.isUsed ? "Tak" : "Nie"}
                        color={d.isUsed ? "default" : "success"}
                        size="small"
                        variant={d.isUsed ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("pl-PL") : "—"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Usuń zniżkę">
                        <IconButton color="error" size="small" onClick={() => handleDelete(d._id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {discounts.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>Brak zniżek w bazie danych</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj zniżkę osobistą</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Użytkownik *</InputLabel>
            <Select value={form.user} label="Użytkownik *" onChange={e => setForm({ ...form, user: e.target.value })}>
              {users.map(u => <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName} — {u.email}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Tytuł zniżki *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth placeholder="np. Student, Senior, Pracownik" />
          <TextField label="Procent zniżki *" type="number" inputProps={{ min: 1, max: 100 }} value={form.percentDiscount} onChange={e => setForm({ ...form, percentDiscount: e.target.value })} fullWidth />
          <TextField label="Data wygaśnięcia" type="date" value={form.expirationDate} onChange={e => setForm({ ...form, expirationDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} helperText="Domyślnie: 14 dni od dziś" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.user || !form.title || !form.percentDiscount}>Dodaj</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
