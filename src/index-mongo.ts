import 'dotenv/config'
import express from 'express';
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js';
import { NextFunction, Request, Response } from "express";

const app = express();
app.use(express.json());

//Explicando o que é um middleware
app.use(rotasNaoAutenticadas)
app.use(Middleware)
app.use(rotasAutenticadas);

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});