import dotenv from 'dotenv'
dotenv.config({
    path: './.env',
})

const PORT = Number(process.env.PORT) || 8000;
const DOMAIN = String(process.env.DOMAIN) || 'http://127.0.0.1';

export {PORT, DOMAIN};