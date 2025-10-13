import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import bcrypt from 'bcrypt'


class UsuarioController {
    async adicionar(req: Request, res: Response) {
        const {nome,idade,email,senha} = req.body
    
        if(!nome || !idade || !email || !senha){ //validação
             return res.status(400).json({mensagem: "Ddaos incpompletos (nome,email,senha,idade)"})
        }
        const usuario = { nome, idade, email, senha}
        const resultado = await db.collection('usuarios')
            .insertOne(usuario)
        res.status(201).json({ ...usuario, _id: resultado.insertedId })
    }
    async listar(req: Request, res: Response) {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.status(200).json(usuarios);
    }
}

async function login(req: Request, res: Response) {
    
}
export default new UsuarioController();





