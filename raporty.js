
// Do śledzenia przychodów na stronie w formie jakiegoś wykresu/kalendarza
const getRevenueByDateRange = async (startDateString, endDateString) => {
  try {
    const startDate = new Date(startDateString);
    startDate.setHours(0, 0, 0, 0); // Początek pierwszego dnia

    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999); // Koniec ostatniego dnia

    // 2. Agregacja
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
      // Krok 2: Grupowanie po dniu
      {
        $group: {
          // Zamieniamy datę na string YYYY-MM-DD, co pozwoli zgrupować dokumenty z tego samego dnia
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$createdAt" 
            } 
          },
          dailyRevenue: { $sum: "$totalPrice" },        // Suma przychodów z danego dnia
          reservationsCount: { $sum: 1 },               // Liczba rezerwacji w danym dniu
          totalTickets: { $sum: { $size: "$bookedSeats" } } // Łączna liczba sprzedanych biletów w danym dniu
        }
      },
      // Krok 3: Sortowanie wyników chronologicznie (po _id, którym teraz jest nasza data)
      {
        $sort: { _id: 1 } 
      }
    ]);

    console.log(`Raport od ${startDateString} do ${endDateString}:`);
    console.log(result);
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
      // 1. Bierzemy pod uwagę tylko potwierdzone rezerwacje
      {
        $match: { status: "CONFIRMED" }
      },
      // 2. Grupujemy po ID użytkownika i sumujemy to, co wydał
      {
        $group: {
          _id: "$user", // _id w tym kontekście to będzie ObjectId użytkownika
          totalSpent: { $sum: "$totalPrice" },
          reservationsCount: { $sum: 1 } // Przy okazji liczymy, ile miał rezerwacji
        }
      },
      // 3. Sortujemy malejąco po wydanej kwocie (najwięcej na samej górze)
      {
        $sort: { totalSpent: -1 }
      },
      // 4. Paginacja: Pomijamy pierwszych X dokumentów (zmienna skipCount)
      {
        $skip: skipCount
      },
      // 5. Paginacja: Pobieramy tylko Y dokumentów (zmienna limitCount)
      {
        $limit: limitCount
      },
      // 6. DOPIERO TERAZ dociągamy dane użytkownika z kolekcji 'users' (łączymy po ID)
      {
        $lookup: {
          from: "users", // Nazwa kolekcji w bazie (domyślnie Mongoose tworzy z nazwy "User" kolekcję "users")
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      // 7. $lookup zwraca tablicę, a użytkownik jest jeden, więc "rozpakowujemy"
      {
        $unwind: "$userDetails"
      },
      // 8. Opcjonalnie: formatujemy wynik wyjściowy, żeby był płaski i ładny
      {
        $project: {
          userId: "$_id",
          _id: 0, // Ukrywamy oryginalne _id z grupowania, bo przenieśliśmy je wyżej
          totalSpent: 1,
          reservationsCount: 1,
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email"
        }
      }
    ]);

    console.log(`Top ${limitCount} użytkowników (pominięto ${skipCount}):`);
    console.log(result);
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

// const { ... } = require("../raporty"); - tak importujemy