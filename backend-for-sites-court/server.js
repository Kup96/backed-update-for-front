import dotenv, { config } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
const app = express();
import esimRouter from './routes/esim.js';
import 'dotenv/config'
const port = process.env.PORT || 5000
dotenv.config();
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/auth', auth);
// app.use('/api', api);
app.use("/esim",esimRouter)
// app.use('/payments', payments);
// app.use('/user', userControl )
// app.use("/login/", authSteam) //login steam main routers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());

app.use(express.json())



app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})


