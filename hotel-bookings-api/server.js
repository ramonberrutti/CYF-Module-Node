const express = require("express");
const cors = require("cors");
const moment = require("moment");

const app = express();

app.use(express.json());

// Enable CORS because the client is served from a different hostname than the server.
app.use(cors());

// Use this array as your (in-memory) data store.
const bookings = require("./bookings.json");

// Next Booking ID to be used.
let nextBookingId = bookings.length + 1;

app.get("/", function (request, response) {
  response.send("Hotel booking server.  Ask for /bookings, etc.");
});

// Get all bookings
app.get("/bookings", (_, res) => {
    res.json(bookings);
});

// Create a new booking
app.post("/bookings", (req, res) => {
    const newBooking = req.body;
    if (!newBooking.title 
        || !newBooking.firstName 
        || !newBooking.surname 
        || !newBooking.email 
        || !newBooking.roomId 
        || !newBooking.checkInDate 
        || !newBooking.checkOutDate
    ) {
        res.status(400).json({ message: "Invalid booking" });
        return;
    }

    newBooking.id = nextBookingId++;
    bookings.push(newBooking);
    res.status(201).json(newBooking);
});

// Get a booking by ID
app.get("/bookings/:id(\d+)", (req, res) => {
    const id = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
    }

    res.json(booking);
});

// Delete a booking by ID
app.delete("/bookings/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
        res.status(404).json({ message: "Booking not found" });
        return;
    }

    bookings.splice(index, 1);
    res.status(204).end();
});

// Search bookings by date range
app.get("/bookings/search", (req, res) => {
    const { term, date } = req.query;
    if (!term && !date) {
        res.status(400).json({ message: "missing term or date" });
        return;
    }

    const lowerTerm = term ? term.toLowerCase() : null;
    const filteredBookings = bookings.filter(b => {
        const withDate = date ? moment(date).isBetween(b.checkInDate, b.checkOutDate, null, "[]") : true;
        const withTerm = term ? 
                b.firstName.toLowerCase().includes(lowerTerm) || 
                b.surname.toLowerCase().includes(lowerTerm) || 
                b.email.toLowerCase().includes(lowerTerm) 
            : true;

        return withDate && withTerm;
    });

    res.json(filteredBookings);
});


const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
