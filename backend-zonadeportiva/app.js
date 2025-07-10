import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import productRoutes from './src/routes/product.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import webpayRoutes from './src/routes/webpay.routes.js'; 
import userRoutes from './src/routes/user.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import customerRoutes from './src/routes/customer.routes.js';
import paymentProviderRoutes from './src/routes/paymentProvider.routes.js';
import citiesRoutes from './src/routes/city.routes.js';
import statesRoutes from './src/routes/state.routes.js';
import shippingRoutes from './src/routes/shippingMethod.routes.js';
import linkifyRoutes from './src/routes/linkify.routes.js';
import authEmail from './src/routes/authEmail.routes.js';
import bsaleRoutes from './src/routes/bsale.routes.js';
import productMetaRoutes from './src/routes/productMeta.routes.js';



const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://zonadeportiva.loca.lt' || 'http://localhost:3001' || 'https://zonadeportiva-yyqc.onrender.com' || 'http://localhost:3000',
  credentials: true, // IMPORTANTE: Permite cookies en requests cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token-response'],
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
//Transbank
app.use(express.urlencoded({ extended: true }));
//Cookies
app.use(cookieParser()); 

// Servir archivos estáticos
app.use(express.static('public'));

// Rutas internas
app.use('/product', productRoutes);
app.use('/product-meta', productMetaRoutes);
app.use('/category', categoryRoutes);
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/customer', customerRoutes);
app.use('/methods', paymentProviderRoutes);
app.use('/city', citiesRoutes);
app.use('/state', statesRoutes);
app.use('/shipping-method', shippingRoutes);

// Rutas externas
app.use('/webpay', webpayRoutes); 
app.use('/linkify', linkifyRoutes); 
app.use('/linkify', linkifyRoutes);
app.use('/auth-email', authEmail);
app.use('/bsale', bsaleRoutes); 
//app.post('/webhook/bsale', bsaleRoutes);





// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal!',
    code: 'INTERNAL_ERROR'
  });
});

export default app;
