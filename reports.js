const Reservation = require('./models/Reservation');

/*
----------- WERSJA WSTĘPNA --------------
TODO:
coś można jeszcze dodać, zależnie od tego jakie jeszcze będziemy mieli rzeczy

*/


// Do śledzenia przychodów na stronie w formie jakiegoś wykresu/kalendarza
const getRevenueByDateRange = async (startDateString, endDateString) => {
  try {
    const startDate = new Date(startDateString);
    startDate.setHours(0, 0, 0, 0);

    const endDate = endDateString ? new Date(endDateString) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const result = await Reservation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
          status: "CONFIRMED" // Pomijamy anulowane rezerwacje
        }
      },
      {
        $group: {
          // Zamieniamy datę na string YYYY-MM-DD, co pozwoli zgrupować dokumenty z tego samego dnia
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$createdAt" 
            } 
          },
          dailyRevenue: { $sum: "$totalPrice" },
          reservationsCount: { $sum: 1 },
          totalTickets: { $sum: { $size: "$bookedSeats" } }
        }
      },
      {
        $sort: { _id: 1 } 
      }
    ]);

    return result;

  } catch (error) {
    console.error("Błąd podczas generowania raportu zakresu dat:", error);
    throw error;
  }
};

// Przykład użycia:
// getRevenueByDateRange("2023-11-01", "2023-11-07");


// Do np tabeli na frontendzie zrobić se taką liste top klientów z paginacją
// Można argumentować że chcielibyśmy wysłać zniżki dla jakichś najlepszych klientów
// albo maile do najgorszych z jakimś info o nowym filmie

const getTopSpenders = async (skipCount = 0, limitCount = 10) => {
  try {
    const result = await Reservation.aggregate([
      {
        $match: { status: "CONFIRMED" }
      },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          reservationsCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $skip: skipCount
      },
      {
        $limit: limitCount
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          userId: "$_id",
          _id: 0,
          totalSpent: 1,
          reservationsCount: 1,
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email"
        }
      }
    ]);
    return result;

  } catch (error) {
    console.error("Błąd podczas pobierania top użytkowników:", error);
    throw error;
  }
};

// --- Przykłady wywołania ---

// 1. Pobierz absolutne TOP 5 użytkowników (pomijasz 0, pobierasz 5)
// await getTopSpenders(0, 5);

// 2. Pobierz "drugą stronę" (od 6 do 10 miejsca w rankingu)
// await getTopSpenders(5, 5);

/* Przykładowy output
{
  "totalSpent": 1250.50,
  "reservationsCount": 8,
  "userId": "654321abcdef...",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan@example.com"
}
*/


module.exports = {
    getRevenueByDateRange,
    getTopSpenders
};

