import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // ✅ importar jsonwebtoken
import dotenv from 'dotenv';
dotenv.config(); // ✅ carregar variáveis do .env

class UsuarioController {
    async adicionar(req: Request, res: Response) {
        const { nome, idade, email, senha } = req.body;

        if (!nome || !idade || !email || !senha) {
            return res.status(400).json({ mensagem: "Dados incompletos (nome, email, senha, idade)" });
        }

        // Hash da senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);

        const usuario = { nome, idade, email, senha: senhaHash };
        const resultado = await db.collection('usuarios').insertOne(usuario);

        res.status(201).json({ ...usuario, _id: resultado.insertedId });
    }

    async listar(req: Request, res: Response) {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.status(200).json(usuarios);
    }

    async login(req: Request, res: Response) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
        }

        // Verifica se o usuário existe
        const usuario = await db.collection('usuarios').findOne({ email });
        if (!usuario) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" });
        }

        // Compara a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" });
        }

        const token = jwt.sign({usuarioId: usuario._id}, process.env.JWT_SECRET!, {expiresIn: '1h'}); 
        //devolver token
         res.status(200).json({token});

export default new UsuarioController();
    