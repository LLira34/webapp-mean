require('./config/passport.config');
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const pdf = require('express-pdf');

// Inicializando
const app = express();
require('./database');

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(pdf);
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});
app.use(multer({ storage }).single('image'));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    var valErrors = [];
    Object.keys(err.errors).forEach((key) =>
      valErrors.push(err.errors[key].message)
    );
    res.status(422).send(valErrors);
  } else {
    console.log(err);
  }
});
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Routes
app.use('/api', require('./routes/user.routes'));
app.use('/api/photos/', require('./routes/photo.routes'));
app.use('/api/suppliers/', require('./routes/supplier.routes'));
app.use('/api/internal/', require('./routes/internal.routes'));
app.use('/api/menus/', require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/external', require('./routes/external.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));

// Static Files
app.use(express.static(path.join(__dirname, 'public/dist')));
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/dist/index.html'));
});

module.exports = app;
