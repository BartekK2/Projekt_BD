const BASE = "http://localhost:3000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Błąd serwera");
  return data;
}

// Movies
export const getMovies = () => request("/movies");
export const createMovie = (body) =>
  request("/movies", { method: "POST", body: JSON.stringify(body) });
export const deleteMovie = (id) =>
  request(`/movies/${id}`, { method: "DELETE" });

// Users
export const getUsers = () => request("/users");
export const createUser = (body) =>
  request("/users", { method: "POST", body: JSON.stringify(body) });
export const deleteUser = (id) =>
  request(`/users/${id}`, { method: "DELETE" });

// Screenings
export const getScreenings = () => request("/screenings");
export const createScreening = (body) =>
  request("/screenings", { method: "POST", body: JSON.stringify(body) });
export const deleteScreening = (id) =>
  request(`/screenings/${id}`, { method: "DELETE" });

// Reservations
export const getReservations = () => request("/reservations");
export const bookTickets = (body) =>
  request("/reservations/book", { method: "POST", body: JSON.stringify(body) });
export const deleteReservation = (id) =>
  request(`/reservations/${id}`, { method: "DELETE" });

// Discounts
export const getDiscounts = () => request("/discounts");
export const createDiscount = (body) =>
  request("/discounts", { method: "POST", body: JSON.stringify(body) });
export const deleteDiscount = (id) =>
  request(`/discounts/${id}`, { method: "DELETE" });

// Reports
export const getRevenue = (startDate, endDate) => {
  const params = new URLSearchParams({ startDate });
  if (endDate) params.set("endDate", endDate);
  return request(`/reports/revenue?${params}`);
};
export const getTopSpenders = (skip, limit) => {
  const params = new URLSearchParams();
  if (skip !== undefined) params.set("skip", skip);
  if (limit !== undefined) params.set("limit", limit);
  return request(`/reports/top-spenders?${params}`);
};
