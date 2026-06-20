const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const newsRoutes = require('./routes/news');
const documentRoutes = require('./routes/documents');
const appointmentRoutes = require('./routes/appointments');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Route prefixes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes); // backwards compatibility
app.use('/api/news', newsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Forestry Law Web App API is running. Visit /api-docs for documentation.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
