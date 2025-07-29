const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
require('./models'); // cargar modelos y asociaciones

// Sequelize setup
const sequelize = require('./config/database');
sequelize.authenticate()
.then(() => console.log('Conexión con MySQL establecida.'))
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

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: '*'
}));

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
app.use('/familiares',  getFamiliares);

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
res.status(err.status || 500);
res.json({ error: err.message });
});

module.exports = app;
