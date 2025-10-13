import usuarioController from "../usuarios/usuario.controller.js";
import { Router } from "express";

const rotasNaoAutenticadas = Router();

rotasNaoAutenticadas.post("/usuarios", usuarioController.login);

export default rotasNaoAutenticadas;