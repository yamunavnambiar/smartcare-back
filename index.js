require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./db');
const replicateRoutes = require('./routes/replicate'); // ✅ ADD THIS

const journalRoutes = require("./routes/journalRoute");

console.log("✅ Loaded token:", process.env.REPLICATE_API_TOKEN);


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // ✅ ADD THIS
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // ✅ Mount profile route
app.use('/api/admin/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/replicate', replicateRoutes); // ✅ ADD THIS

app.use("/api/journal", journalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
