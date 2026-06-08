import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, MenuItem, Select, InputLabel, FormControl,
  Chip, ToggleButton, Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import { getReservations, bookTickets, deleteReservation, getUsers, getScreenings, getDiscounts } from "../api";

const THEAD_SX = { "& th": { fontWeight: 700, bgcolor: "error.main", color: "white" } };

function SeatPicker({ seats, selectedSeats, onToggle }) {
  if (!seats?.length) return <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>Wybierz seans, aby zobaczyć mapę miejsc</Typography>;
  const rows = [...new Set(seats.map(s => s.row))].sort();
  const isSelected = (s) => selectedSeats.some(x => x.row === s.row && x.number === s.number);
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Kliknij miejsce, aby je zaznaczyć. Zaznaczono: {selectedSeats.length}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {rows.map(row => (
          <Box key={row} sx={{ display: "flex", gap: 0.3, alignItems: "center" }}>
            <Typography sx={{ width: 20, fontSize: 11, fontWeight: 700, color: "text.secondary" }}>{row}</Typography>
            {seats.filter(s => s.row === row).sort((a, b) => a.number - b.number).map(s => (
              <ToggleButton
                key={s.number} value={`${s.row}${s.number}`}
                selected={isSelected(s)} disabled={!s.isAvailable}
                onChange={() => s.isAvailable && onToggle(s)}
                size="small"
                sx={{
                  width: 32, height: 26, minWidth: 0, fontSize: 11, fontWeight: 600, p: 0,
                  borderColor: !s.isAvailable ? "grey.300" : isSelected(s) ? "error.main" : "grey.400",
                  bgcolor: !s.isAvailable ? "grey.200" : isSelected(s) ? "error.main" : "background.paper",
                  color: !s.isAvailable ? "grey.400" : isSelected(s) ? "white" : "text.primary",
                  "&.Mui-selected": { bgcolor: "error.main", color: "white", "&:hover": { bgcolor: "error.dark" } },
                }}
              >
                {s.number}
              </ToggleButton>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", screeningId: "", discountId: "" });
  const [selectedSeats, setSelectedSeats] = useState([]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [res, us, sc, dc] = await Promise.all([getReservations(), getUsers(), getScreenings(), getDiscounts()]);
      setReservations(res); setUsers(us); setScreenings(sc); setDiscounts(dc);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const selectedScreening = screenings.find(s => s._id === form.screeningId);
  const filteredDiscounts = discounts.filter(d => (d.user?._id ?? d.user) === form.userId && !d.isUsed);

  const handleToggleSeat = (seat) => {
    setSelectedSeats(prev =>
      prev.some(s => s.row === seat.row && s.number === seat.number)
        ? prev.filter(s => !(s.row === seat.row && s.number === seat.number))
        : [...prev, { row: seat.row, number: seat.number }]
    );
  };

  const handleClose = () => { setOpen(false); setForm({ userId: "", screeningId: "", discountId: "" }); setSelectedSeats([]); };

  const handleBook = async () => {
    try {
      await bookTickets({ userId: form.userId, screeningId: form.screeningId, requestedSeats: selectedSeats, discountId: form.discountId || undefined });
      setSuccess("Rezerwacja zakończona sukcesem!"); handleClose(); load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteReservation(id); setSuccess("Rezerwacja anulowana!"); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Rezerwacje</Typography>
        <Button variant="contained" startIcon={<ConfirmationNumberIcon />} onClick={() => setOpen(true)}>Zarezerwuj bilety</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress color="error" /></Box> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={THEAD_SX}>
                <TableCell>Użytkownik</TableCell>
                <TableCell>Film / Seans</TableCell>
                <TableCell>Miejsca</TableCell>
                <TableCell>Zniżka</TableCell>
                <TableCell>Cena</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="center">Akcja</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>
                    {r.user?.firstName} {r.user?.lastName}
                    <br /><Typography variant="caption" color="text.secondary">{r.user?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <strong>{r.screening?.movie?.title ?? "—"}</strong>
                    <br /><Typography variant="caption" color="text.secondary">{r.screening?.startTime ? new Date(r.screening.startTime).toLocaleString("pl-PL") : "—"}</Typography>
                  </TableCell>
                  <TableCell>{r.bookedSeats?.map(s => `${s.row}${s.number}`).join(", ")}</TableCell>
                  <TableCell>{r.appliedDiscount ? <Chip label={`-${r.appliedDiscount.percentDiscount}%`} color="success" size="small" /> : "—"}</TableCell>
                  <TableCell><strong>{r.totalPrice} zł</strong></TableCell>
                  <TableCell><Chip label={r.status === "CONFIRMED" ? "Potwierdzona" : "Anulowana"} color={r.status === "CONFIRMED" ? "success" : "error"} size="small" /></TableCell>
                  <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("pl-PL") : "—"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Anuluj rezerwację">
                      <IconButton color="error" size="small" onClick={() => handleDelete(r._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {reservations.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>Brak rezerwacji w bazie danych</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}><EventSeatIcon color="error" /> Zarezerwuj bilety</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Użytkownik *</InputLabel>
            <Select value={form.userId} label="Użytkownik *" onChange={e => setForm({ ...form, userId: e.target.value, discountId: "" })}>
              {users.map(u => <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName} — {u.email}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Seans *</InputLabel>
            <Select value={form.screeningId} label="Seans *" onChange={e => { setForm({ ...form, screeningId: e.target.value }); setSelectedSeats([]); }}>
              {screenings.map(s => (
                <MenuItem key={s._id} value={s._id}>{s.movie?.title ?? s.movie} — {new Date(s.startTime).toLocaleString("pl-PL")} ({s.roomName})</MenuItem>
              ))}
            </Select>
          </FormControl>
          {form.screeningId && (
            <>
              <Divider textAlign="left"><Typography variant="caption" color="text.secondary">Wybierz miejsca</Typography></Divider>
              <SeatPicker seats={selectedScreening?.seats ?? []} selectedSeats={selectedSeats} onToggle={handleToggleSeat} />
              {selectedSeats.length > 0 && selectedScreening && (
                <Alert severity="info" icon={false} sx={{ py: 0.5 }}>
                  Zaznaczone: <strong>{selectedSeats.map(s => `${s.row}${s.number}`).join(", ")}</strong>
                  {" · "}Szacowana cena: <strong>{(selectedSeats.length * selectedScreening.ticketPrice).toFixed(2)} zł</strong>
                </Alert>
              )}
            </>
          )}
          <FormControl fullWidth>
            <InputLabel>Zniżka (opcjonalnie)</InputLabel>
            <Select value={form.discountId} label="Zniżka (opcjonalnie)" onChange={e => setForm({ ...form, discountId: e.target.value })}>
              <MenuItem value="">Brak zniżki</MenuItem>
              {filteredDiscounts.map(d => <MenuItem key={d._id} value={d._id}>{d.title} — {d.percentDiscount}%</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button variant="contained" onClick={handleBook} disabled={!form.userId || !form.screeningId || selectedSeats.length === 0}>
            Zarezerwuj ({selectedSeats.length} {selectedSeats.length === 1 ? "miejsce" : "miejsc"})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
