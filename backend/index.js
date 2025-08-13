// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require("dotenv");
const https = require('https');
const fs = require('fs');

const app = express();
app.use(cors());
dotenv.config();// Cargar variables de entorno antes de usarlas

require('./models'); // cargar modelos y asociaciones

// Sequelize setup
const sequelize = require('./config/database');
sequelize.authenticate()
.then(() => console.log('Conexi�n con MySQL establecida.'))
.catch(err => console.error('Error al conectar con MySQL:', err));

// Routers
const dashboardRouter = require('./routes/dashboard');
const registroRouter = require('./routes/registro');
const beneficiariosRouter = require('./routes/beneficiarios');
const produccionesRouter = require('./routes/producciones');
const productosRouter = require('./routes/productos');
const entregasRouter = require('./routes/entregas');
const getCic = require('./routes/cic');
const getCondicion = require('./routes/condicionfamiliar');
const getMantenimientosEconomico = require('./routes/mantenimiento');
const getFamiliares = require('./routes/familiares');


// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/dashboard', dashboardRouter);
app.use('/registro', registroRouter);
app.use('/beneficiarios', beneficiariosRouter);
app.use('/producciones', produccionesRouter);
app.use('/productos', productosRouter);
app.use('/entregas', entregasRouter);
app.use('/cic', getCic);
app.use('/condiciones-familiar', getCondicion);
app.use('/mantenimientos-economico', getMantenimientosEconomico);
app.use('/familiares', getFamiliares);


// Puerto
// const PORT = process.env.PORT || 3000;

const options = {
    key: fs.readFileSync('../scfx0vp99'),
    cert: fs.readFileSync('../scfx0vp99'),
    //ca: fs.readFileSync('/opt/psa/var/certificates/scfqdiDyQ') // si tienes un archivo CA bundle
  };

  https.createServer(options, app).listen(4321, () => {
    console.log(`server listening on port 4321`);
  });

module.exports = app;
