import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN } from './utils/env';

const app = express();

app.use(cors({
    origin : CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({
    limit : '16kb'
}));

app.use(express.urlencoded({
    extended : true,
    limit : '16kb',
}));

app.use(express.static('public'));

app.use(cookieParser());

import userRouter from './routes/user.routes';
import restaurantRouter from './routes/restaurant.routes';
import foodRouter from './routes/food.routes';
import orderRouter from './routes/order.routes';
import favouritesRouter from './routes/favourites.routes';
import cartRouter from './routes/cart.routes';


app.use('/api/v1/users', userRouter);
app.use('/api/v1/restaurants', restaurantRouter);
app.use('/api/v1/foods', foodRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/favourites', favouritesRouter);
app.use('/api/v1/cart', cartRouter);

export { app }