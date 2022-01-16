const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const scannerRouter = require('./routes/scannerRoutes');
const programRouter = require('./routes/programRoute');
const submissionRouter = require('./routes/submissionRoutes');
const messageRouter = require('./routes/messageRoutes');
const chatRouter = require('./routes/chatRoutes');
const app = express();

const socketIo = require("socket.io");
const http = require("http");

const httpServer = http.createServer();
const io = new socketIo.Server(httpServer, {
  // options
});

io.on("connection", (socket) => {
  const data= "socketUsed"
  console.log("incoming connection")
  app.set('socketio', io);
  // Emitting a new message. Will be consumed by the client
  // socket.emit("FromAPI",data );
});
const port1 = process.env.PORT1 || 4000;

httpServer.listen(port1, () =>{ console.log(`websocket on ${port1}`)});


// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(cors());
app.use(helmet());
app.use(cors());
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: []
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/programs', programRouter);
app.use('/api/v1/submissions', submissionRouter);
app.use('/api/v1/Scanner', scannerRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/chats', chatRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
