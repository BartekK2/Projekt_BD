import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, CircularProgress, Alert,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { getRevenue, getTopSpenders } from "../api";

const THEAD_SX = { "& th": { fontWeight: 700, bgcolor: "error.main", color: "white" } };

function ReportSection({ icon, title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight={600}>{title}</Typography>
      </Box>
      {children}
    </Paper>
  );
}

export default function Reports() {
  const [revForm, setRevForm] = useState({ startDate: "", endDate: "" });
  const [revResult, setRevResult] = useState(null);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState("");

  const [spForm, setSpForm] = useState({ skip: "", limit: "" });
  const [spResult, setSpResult] = useState(null);
  const [spLoading, setSpLoading] = useState(false);
  const [spError, setSpError] = useState("");

  const handleRevenue = async () => {
    setRevLoading(true); setRevError(""); setRevResult(null);
    try { setRevResult(await getRevenue(revForm.startDate, revForm.endDate || undefined)); }
    catch (e) { setRevError(e.message); }
    finally { setRevLoading(false); }
  };

  const handleSpenders = async () => {
    setSpLoading(true); setSpError(""); setSpResult(null);
    try { setSpResult(await getTopSpenders(spForm.skip !== "" ? Number(spForm.skip) : undefined, spForm.limit !== "" ? Number(spForm.limit) : undefined)); }
    catch (e) { setSpError(e.message); }
    finally { setSpLoading(false); }
  };

  const revTotal = revResult?.reduce((a, r) => ({
    revenue: a.revenue + (r.dailyRevenue ?? 0),
    reservations: a.reservations + (r.reservationsCount ?? 0),
    tickets: a.tickets + (r.totalTickets ?? 0),
  }), { revenue: 0, reservations: 0, tickets: 0 });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Typography variant="h5" fontWeight={700}>Raporty</Typography>

      <ReportSection icon={<AssessmentIcon color="error" />} title="Przychód w zakresie dat">
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TextField label="Data od *" type="date" value={revForm.startDate} onChange={e => setRevForm({ ...revForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
          <TextField label="Data do (opcjonalnie)" type="date" value={revForm.endDate} onChange={e => setRevForm({ ...revForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} size="small" />
          <Button variant="contained" onClick={handleRevenue} disabled={!revForm.startDate || revLoading} startIcon={revLoading ? <CircularProgress size={16} color="inherit" /> : null}>Generuj</Button>
        </Box>
        {revError && <Alert severity="error" sx={{ mt: 2 }}>{revError}</Alert>}
        {Array.isArray(revResult) && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            {revResult.length === 0 ? <Alert severity="info">Brak rezerwacji w podanym zakresie dat.</Alert> : (
              <>
                <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                  {[["Łączny przychód", `${revTotal.revenue.toFixed(2)} zł`], ["Rezerwacje", revTotal.reservations], ["Bilety", revTotal.tickets]].map(([label, value]) => (
                    <Paper key={label} sx={{ p: 1.5, flex: 1, minWidth: 140, border: "1px solid", borderColor: "error.200", bgcolor: "error.50" }}>
                      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                      <Typography variant="h6" fontWeight={700} color="error.main">{value}</Typography>
                    </Paper>
                  ))}
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow sx={THEAD_SX}><TableCell>Data</TableCell><TableCell align="right">Przychód</TableCell><TableCell align="right">Rezerwacje</TableCell><TableCell align="right">Bilety</TableCell></TableRow></TableHead>
                    <TableBody>
                      {revResult.map(row => (
                        <TableRow key={row._id} hover>
                          <TableCell><strong>{row._id}</strong></TableCell>
                          <TableCell align="right"><strong style={{ color: "#c62828" }}>{row.dailyRevenue?.toFixed(2)} zł</strong></TableCell>
                          <TableCell align="right">{row.reservationsCount}</TableCell>
                          <TableCell align="right">{row.totalTickets}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}
      </ReportSection>

      <ReportSection icon={<EmojiEventsIcon color="error" />} title="Top klientów (najwyższe wydatki)">
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TextField label="Pomiń (skip)" type="number" value={spForm.skip} onChange={e => setSpForm({ ...spForm, skip: e.target.value })} size="small" sx={{ width: 130 }} placeholder="0" />
          <TextField label="Limit" type="number" value={spForm.limit} onChange={e => setSpForm({ ...spForm, limit: e.target.value })} size="small" sx={{ width: 130 }} placeholder="10" />
          <Button variant="contained" onClick={handleSpenders} disabled={spLoading} startIcon={spLoading ? <CircularProgress size={16} color="inherit" /> : null}>Generuj</Button>
        </Box>
        {spError && <Alert severity="error" sx={{ mt: 2 }}>{spError}</Alert>}
        {Array.isArray(spResult) && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow sx={THEAD_SX}><TableCell>#</TableCell><TableCell>Użytkownik</TableCell><TableCell>Email</TableCell><TableCell align="right">Łączne wydatki</TableCell><TableCell align="right">Rezerwacje</TableCell></TableRow></TableHead>
                <TableBody>
                  {spResult.map((s, i) => (
                    <TableRow key={s.userId ?? i} hover>
                      <TableCell fontWeight={700}>{["🥇","🥈","🥉"][i] ?? i + 1}</TableCell>
                      <TableCell><strong>{s.firstName} {s.lastName}</strong></TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell align="right"><strong style={{ color: "#c62828" }}>{s.totalSpent?.toFixed(2)} zł</strong></TableCell>
                      <TableCell align="right">{s.reservationsCount}</TableCell>
                    </TableRow>
                  ))}
                  {spResult.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>Brak wyników</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </ReportSection>
    </Box>
  );
}
