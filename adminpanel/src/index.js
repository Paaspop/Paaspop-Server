require('dotenv').config()

const path = require('path')
const express = require('express')
const app = express()
const port = process.env.PORT;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon')
var cors = require('cors')

// Use cors
app.use(cors({
	credentials: true,
	origin: true
}))



// Import all database related things (models and stuff)
import db from './server/db'

// Import websocket connection
import websocket_connections from './server/websocket'
websocket_connections.connect('admin');

import osc_connection from './server/osc'
osc_connection.osc_connect();

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json())

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// Require all the database logic
require('./server/db')(app);

// Set momentJS
app.locals.moment = require('moment');
// Use favicon
app.use(favicon(path.join(__dirname, '/front-end/public', 'favicon.ico')))
// Set frontend things
app.set('view engine', 'pug')
app.set('public', path.join(__dirname, '/front-end/public'));
app.set('views', path.join(__dirname, '/front-end/views'));
app.use(express.static(path.join(__dirname, '/front-end/public')));
app.locals.basedir = path.join(__dirname, '/front-end/public');

// admin routes
require('./server/routes/adminRoutes')(app);
// user api routes
require('./server/routes/userRoutes')(app);

app.listen(port, () => console.log(`Admin panel listening on port ${port}!`))