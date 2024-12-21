
const express = require('express')
const http = require("http");
const dotenv = require("dotenv"); dotenv.config();
const morgan = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const SessionStore = require("connect-mongodb-session")(session);

const globalError = require('./src/middlewares/errorMiddleware');
const dbConnection = require('./config/database');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);


const userRoute = require("./src/Modules/User/user.Route");
const authRoute = require("./src/Modules/Auth/auth.Route");
const bookRoute = require("./src/Modules/Books/book.Route");
const ReviewRoute = require("./src/Modules/Reviews/review.Route");

dbConnection();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const STORE = new SessionStore({ 
  uri: process.env.MONGO_URL,
  collection: 'sessions'
});

app.use(session({ // Use session
  secret: 'this is my secrt to hash express session',
  saveUninitialized: false,
  resave: false,
  store: STORE,
  cookie: {
    secure: process.env.NODE_ENV === 'development', 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  },
}));



if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use('/', authRoute);
app.use('/users', userRoute);
app.use('/books', bookRoute);
app.use('/books', ReviewRoute);

app.use(globalError);
// Listen
app.listen(PORT, () => {
  console.log(`App Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
