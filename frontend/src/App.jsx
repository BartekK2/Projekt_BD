import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Box, Container, Tabs, Tab } from "@mui/material";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BarChartIcon from "@mui/icons-material/BarChart";
import Movies from "./components/Movies";
import Users from "./components/Users";
import Screenings from "./components/Screenings";
import Reservations from "./components/Reservations";
import Discounts from "./components/Discounts";
import Reports from "./components/Reports";

const theme = createTheme({
  palette: {
    primary: { main: "#c62828", dark: "#8e0000", contrastText: "#fff" },
    error:   { main: "#c62828", dark: "#8e0000", light: "#ef5350", 50: "#ffebee", 200: "#ef9a9a" },
  },
  typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
  components: {
    MuiButton: { defaultProps: { color: "error" } },
    MuiTabs:   { styleOverrides: { indicator: { backgroundColor: "#fff", height: 3 } } },
  },
});

const TABS = [
  { label: "Filmy",       icon: <LocalMoviesIcon />,       component: <Movies /> },
  { label: "Użytkownicy", icon: <PeopleIcon />,            component: <Users /> },
  { label: "Seanse",      icon: <EventIcon />,             component: <Screenings /> },
  { label: "Rezerwacje",  icon: <ConfirmationNumberIcon />, component: <Reservations /> },
  { label: "Zniżki",      icon: <LocalOfferIcon />,        component: <Discounts /> },
  { label: "Raporty",     icon: <BarChartIcon />,          component: <Reports /> },
];

const tabSx = { minHeight: 48, fontSize: "0.82rem", fontWeight: 600, opacity: 0.85, "&.Mui-selected": { opacity: 1 } };

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="error" elevation={2}>
        <Toolbar>
          <LocalMoviesIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>CineManager — Panel administracyjny</Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" variant="scrollable" scrollButtons="auto" sx={{ bgcolor: "error.dark", px: 1 }}>
          {TABS.map((t, i) => <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" sx={tabSx} />)}
        </Tabs>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>{TABS[tab].component}</Container>
    </ThemeProvider>
  );
}
