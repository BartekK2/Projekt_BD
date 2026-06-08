import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, MenuItem, Select, InputLabel, FormControl, Chip, Divider, Slider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import { getScreenings, createScreening, deleteScreening, getMovies } from "../api";

const THEAD_SX = { "& th": { fontWeight: 700, bgcolor: "error.main", color: "white" } };

function generateSeats(numRows, numCols) {
  return Array.from({ length: numRows }, (_, r) =>
    Array.from({ length: numCols }, (_, c) => ({
      row: String.fromCharCode(65 + r), number: c + 1, isAvailable: true,
    }))
  ).flat();
}

function RoomPreview({ numRows, numCols }) {
  if (!numRows || !numCols) return null;
  const seatW = Math.max(14, Math.min(28, Math.floor(320 / numCols) - 2));
  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ width: "60%", mx: "auto", mb: 1, py: 0.5, bgcolor: "grey.300", borderRadius: "4px 4px 0 0", fontSize: 11, color: "text.secondary", fontWeight: 600 }}>EKRAN</Box>
      <Box sx={{ display: "inline-flex", flexDirection: "column", gap: 0.4 }}>
        {Array.from({ length: numRows }, (_, r) => (
          <Box key={r} sx={{ display: "flex", gap: 0.3, alignItems: "center" }}>
            <Typography sx={{ width: 16, fontSize: 10, fontWeight: 700, color: "text.secondary", mr: 0.3 }}>{String.fromCharCode(65 + r)}</Typography>
            {Array.from({ length: numCols }, (_, c) => (
              <Box key={c} sx={{ width: seatW, height: 12, bgcolor: "error.200", borderRadius: "3px 3px 0 0", border: "1px solid", borderColor: "error.300" }} />
            ))}
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        {numRows * numCols} miejsc ({numRows} rzędów × {numCols} miejsc)
      </Typography>
    </Box>
  );
}

function SeatsDialog({ open, onClose, seats }) {
  const rows = [...new Set(seats.map(s => s.row))].sort();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Mapa miejsc</DialogTitle>
      <DialogContent>
        {seats.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>Ten seans nie ma przypisanych miejsc.</Typography>
        ) : (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              {rows.map(row => (
                <Box key={row} sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                  <Typography sx={{ width: 24, fontWeight: 700, fontSize: 13 }}>{row}</Typography>
                  {seats.filter(s => s.row === row).sort((a, b) => a.number - b.number).map(s => (
                    <Chip key={s.number} label={s.number} size="small" color={s.isAvailable ? "success" : "error"} variant={s.isAvailable ? "outlined" : "filled"} />
                  ))}
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Chip label="Wolne" color="success" variant="outlined" size="small" />
              <Chip label="Zajęte" color="error" size="small" />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Zamknij</Button></DialogActions>
    </Dialog>
  );
}

export default function Screenings() {
  const [screenings, setScreenings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [seatsDialog, setSeatsDialog] = useState({ open: false, seats: [] });
  const [form, setForm] = useState({ movie: "", roomName: "", startTime: "", ticketPrice: "", numRows: 8, numCols: 10 });

  const load = async () => {
    setLoading(true); setError("");
    try { const [sc, mv] = await Promise.all([getScreenings(), getMovies()]); setScreenings(sc); setMovies(mv); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const generatedSeats = useMemo(() => generateSeats(form.numRows, form.numCols), [form.numRows, form.numCols]);

  const handleCreate = async () => {
    try {
      await createScreening({ movie: form.movie, roomName: form.roomName, startTime: form.startTime, ticketPrice: Number(form.ticketPrice), seats: generatedSeats });
      setSuccess(`Seans dodany! (${generatedSeats.length} miejsc)`); setOpen(false);
      setForm({ movie: "", roomName: "", startTime: "", ticketPrice: "", numRows: 8, numCols: 10 }); load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteScreening(id); setSuccess("Seans usunięty!"); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Seanse</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Dodaj seans</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress color="error" /></Box> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={THEAD_SX}>
                <TableCell>Film</TableCell>
                <TableCell>Sala</TableCell>
                <TableCell>Data i godzina</TableCell>
                <TableCell>Cena biletu</TableCell>
                <TableCell>Miejsca</TableCell>
                <TableCell align="center">Akcja</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {screenings.map((s) => {
                const avail = s.seats?.filter(x => x.isAvailable).length ?? 0;
                const total = s.seats?.length ?? 0;
                return (
                  <TableRow key={s._id} hover>
                    <TableCell><strong>{s.movie?.title ?? s.movie}</strong></TableCell>
                    <TableCell>{s.roomName}</TableCell>
                    <TableCell>{new Date(s.startTime).toLocaleString("pl-PL")}</TableCell>
                    <TableCell>{s.ticketPrice} zł</TableCell>
                    <TableCell>
                      <Tooltip title={total === 0 ? "Brak miejsc" : "Pokaż mapę miejsc"}>
                        <span>
                          <Button size="small" variant="outlined" color="error" startIcon={<EventSeatIcon />} onClick={() => setSeatsDialog({ open: true, seats: s.seats ?? [] })} disabled={total === 0}>
                            {avail}/{total}
                          </Button>
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Usuń seans">
                        <IconButton color="error" size="small" onClick={() => handleDelete(s._id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {screenings.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>Brak seansów w bazie danych</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SeatsDialog open={seatsDialog.open} seats={seatsDialog.seats} onClose={() => setSeatsDialog({ open: false, seats: [] })} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj nowy seans</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Film *</InputLabel>
            <Select value={form.movie} label="Film *" onChange={e => setForm({ ...form, movie: e.target.value })}>
              {movies.map(m => <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Nazwa sali *" value={form.roomName} onChange={e => setForm({ ...form, roomName: e.target.value })} fullWidth placeholder="np. Sala 1" />
            <TextField label="Cena biletu (zł) *" type="number" inputProps={{ min: 0, step: 0.5 }} value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: e.target.value })} sx={{ width: 160 }} />
          </Box>
          <TextField label="Data i godzina *" type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
          <Divider textAlign="left"><Typography variant="caption" fontWeight={600} color="error.main">Układ sali</Typography></Divider>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" gutterBottom>Rzędy: <strong>{form.numRows}</strong> (A–{String.fromCharCode(64 + form.numRows)})</Typography>
              <Slider value={form.numRows} min={1} max={26} onChange={(_, v) => setForm({ ...form, numRows: v })} color="error" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" gutterBottom>Miejsc w rzędzie: <strong>{form.numCols}</strong></Typography>
              <Slider value={form.numCols} min={1} max={30} onChange={(_, v) => setForm({ ...form, numCols: v })} color="error" />
            </Box>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50", overflowX: "auto" }}>
            <RoomPreview numRows={form.numRows} numCols={form.numCols} />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.movie || !form.roomName || !form.startTime || !form.ticketPrice}>
            Dodaj ({form.numRows * form.numCols} miejsc)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
