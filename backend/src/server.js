import express from 'express'
import cors from 'cors';
import {PORT, DOMAIN} from '../constants.js';
import todoRouter from './routes/route.js';

const app = express();
const port = PORT;
const domain = DOMAIN;

app.use(cors());
app.use(express.json());

app.use('/', todoRouter);

app.listen(port, ()=>{
    console.log(`Server Running At ${domain}:${port}`); 
});
