const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const paymentRoutes = require('./routes/payment.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    const allowed = [
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
      'https://www.mentp.com',
      'https://mentp.com'
    ]
      .filter(Boolean)
      .map(url => url.replace(/\/$/, ''));

    if (
      allowed.includes(cleanOrigin) || 
      cleanOrigin.includes('vercel.app') || 
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);

// Robots.txt for API domain (prevents search engines from indexing backend endpoints)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /\n');
});

// Root & Health check
app.get('/', (req, res) => res.json({ name: 'Mentara Labs API', status: 'online' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Exam scheduler — auto-starts and auto-ends exams, auto-submits attempts
const { startScheduler } = require('./services/examScheduler');
startScheduler();

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;