import express from 'express';
import { router } from './routes.js';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { apiRouter } from './routes/api.js';
import { initSocket } from './routes/sockets.js';
import dotenv from 'dotenv';

const privateKey = fs.readFileSync('sslcert/private_no_pass.key', 'utf8');
const certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8')
const credentials = {key: privateKey, cert: certificate};
const app = express();
const port = 3000;
dotenv.config();

app.use(cors());
app.use(express.static('./public'));
app.use('./public/uploads', express.static('uploads'));
app.set('views', './public/views');
app.set('view engine', 'pug');

app.use("/", router);
app.use('/api', apiRouter);

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

initSocket(httpsServer);
