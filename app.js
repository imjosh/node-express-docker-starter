/* eslint global-require: 0 */
const ConsoleHrTime = require('console-hrtime');

const timer = new ConsoleHrTime();
timer.start('init');

require('make-promises-safe');
const exphbs = require('express-handlebars');
const express = require('express');
const http = require('http');
const stoppable = require('stoppable');

/* middleware - look at others at http://expressjs.com/en/resources/middleware.html */
const bodyParser = require('body-parser'); // process body
const cookieParser = require('cookie-parser');
const compression = require('compression'); // used for compression responses
const morgan = require('morgan'); // logging
const session = require('cookie-session');

const config = require('./config');
const logger = require('./lib/logger')('APP');

/* create express instance */
const app = express();
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const sessionKey = 'changeThisToSomethingElse';

app.use(session({
  keys: [sessionKey],
  cookie: {
    name: 'sessionId',
    domain: config.domain,
    httpOnly: true,
    maxAge: 172800000, // 48 hours
    sameSite: 'lax',
    secure: true,
  }
}));

// extend session
app.use((req, res, next) => {
  // fixme test w/ very short duration
  req.session.nowInHours = Math.floor(Date.now() / 3600000);
  next();
});

// allow secure cookie behind proxy
app.set('trust proxy', 'uniquelocal');

app.disable('x-powered-by');

app.use(morgan('dev', {
  skip(req, res) { return res.statusCode < 400; }
}));

/* view engine (handlebars) */
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    section(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
}));

app.set('view engine', '.hbs');

// inject custom header
const customHeader = JSON.stringify({
  v: config.version,
  b: config.branch,
  h: config.osHostname
});

app.use((req, res, next) => {
  res.header('X-App-Info', customHeader);
  next();
});

// webhooks route config - must init before csrf
require('./routes/webhooks')(app);

// app.use(csrfMiddleware);

// main route configuration
require('./routes')(app);

app.use(express.static(`${__dirname}/public`));

/* setup error routes */
// 404
app.use((req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(404);
  res.render('error/404', { url: req.url });
});

// 500
app.use((appErr, req, res, next) => { // eslint-disable-line consistent-return
  if (res.headersSent) {
    return next(appErr);
  }

  logger.error(`Uncaught server error: ${appErr.name}: ${appErr.message}. Stack: \n ${appErr.stack}`);
  res.status(500);
  if (req.xhr) {
    res.send({ error: 'Internal Server Error' });
  } else if (req.method === 'GET') {
    res.render('error/500');
  } else {
    res.send('Internal Server Error');
  }
});

/* listen on port defined in ./config  Wrap with `stoppable` */
const server = stoppable(http.createServer(app).listen(config.port));

// graceful shutdown on SIGTERM (via stoppable)
process.on('SIGTERM', () => {
  logger.log('APP:SHUTDOWN', 'SIGTERM received, will attempt graceful shutdown in 5 seconds');
  setTimeout(() => {
    logger.log('APP:SHUTDOWN', 'Now attempting graceful shutdown');
    server.stop((stopErr) => {
      if (stopErr) {
        logger.error('APP:SHUTDOWN', `Graceful shutdown error: ${stopErr}`);
        process.exitCode = 1;
      } else {
        logger.log('APP:SHUTDOWN', 'Graceful shutdown complete');
      }
      process.exit();
    });
  }, 5000);
});

logger.log(`Listening on port ${config.port}`);

const time = timer.end('init');
const timeUnits = timer.msToUnits(time, 3);
logger.log(`Startup time: ${timeUnits.value} ${timeUnits.units}`);

if (time > 10000) {
  logger.error(`Slow startup: ${time}`);
}
