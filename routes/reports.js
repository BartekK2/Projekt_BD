const express = require('express');
const router = express.Router();
const { getRevenueByDateRange, getTopSpenders } = require("../reports");

// Przykładowe użycie: GET /api/reports/revenue?startDate=2023-11-01&endDate=2023-11-07
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate) { // endDate ma już domyślną wartość
      return res.status(400).json({ 
        message: "Brakuje parametrów startDate lub endDate w adresie URL." 
      });
    }

    const result = await getRevenueByDateRange(startDate, endDate);
    
    res.status(200).json(result);

  } catch (error) {
    console.error("Błąd w endpoincie /revenue:", error);
    res.status(500).json({ message: "Wewnętrzny błąd serwera." });
  }
});

// Przykładowe użycie: GET /api/reports/top-spenders?skip=10&limit=5
// Brak parametrów = domyślnie skip 0, limit 10
router.get('/top-spenders', async (req, res) => {
  try {
    const skipCount = req.query.skip ? parseInt(req.query.skip, 10) : undefined;
    const limitCount = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

    const result = await getTopSpenders(skipCount, limitCount);
    
    res.status(200).json(result);

  } catch (error) {
    console.error("Błąd w endpoincie /top-spenders:", error);
    res.status(500).json({ message: "Wewnętrzny błąd serwera." });
  }
});

module.exports = router;