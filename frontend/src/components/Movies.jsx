import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { getMovies, createMovie, deleteMovie } from "../api";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", director: "", durationMinutes: "", genre: "", description: "" });

  const load = async () => {
    setLoading(true); setError("");
    try { setMovies(await getMovies()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createMovie({ ...form, durationMinutes: Number(form.durationMinutes) });
      setSuccess("Film dodany!"); setOpen(false);
      setForm({ title: "", director: "", durationMinutes: "", genre: "", description: "" });
      load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteMovie(id); setSuccess("Film usunięty!"); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Filmy</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Dodaj film</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress color="error" /></Box> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "error.main", color: "white" } }}>
                <TableCell>Tytuł</TableCell>
                <TableCell>Reżyser</TableCell>
                <TableCell>Czas (min)</TableCell>
                <TableCell>Gatunek</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell align="center">Akcja</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movies.map((m) => (
                <TableRow key={m._id} hover>
                  <TableCell><strong>{m.title}</strong></TableCell>
                  <TableCell>{m.director}</TableCell>
                  <TableCell>{m.durationMinutes}</TableCell>
                  <TableCell><Chip label={m.genre} size="small" color="error" variant="outlined" /></TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.description}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Usuń film">
                      <IconButton color="error" size="small" onClick={() => handleDelete(m._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {movies.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>Brak filmów w bazie danych</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj nowy film</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Tytuł *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
          <TextField label="Reżyser *" value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} fullWidth />
          <TextField label="Czas trwania (min) *" type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} fullWidth />
          <TextField label="Gatunek *" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} fullWidth />
          <TextField label="Opis" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || !form.director || !form.genre || !form.durationMinutes}>Dodaj</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
