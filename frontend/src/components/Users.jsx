import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { getUsers, createUser, deleteUser } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  const load = async () => {
    setLoading(true); setError("");
    try { setUsers(await getUsers()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createUser(form);
      setSuccess("Użytkownik dodany!"); setOpen(false);
      setForm({ firstName: "", lastName: "", email: "" });
      load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteUser(id); setSuccess("Użytkownik usunięty!"); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Użytkownicy</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Dodaj użytkownika</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress color="error" /></Box> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "error.main", color: "white" } }}>
                <TableCell>Imię</TableCell>
                <TableCell>Nazwisko</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Utworzono</TableCell>
                <TableCell align="center">Akcja</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>{u.firstName}</TableCell>
                  <TableCell>{u.lastName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("pl-PL") : "—"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Usuń użytkownika">
                      <IconButton color="error" size="small" onClick={() => handleDelete(u._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>Brak użytkowników w bazie danych</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj nowego użytkownika</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Imię *" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} fullWidth />
          <TextField label="Nazwisko *" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} fullWidth />
          <TextField label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.firstName || !form.lastName || !form.email}>Dodaj</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
