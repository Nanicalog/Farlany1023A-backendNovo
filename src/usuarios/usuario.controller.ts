import usuarioController from "./usuarios/usuario.controller";
import produtoController from "./produtos/produto.controller"; 
import { Router } from "express";

const rotas = Router();

rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);


rotas.post("/produtos", produtoController.adicionar); 
rotas.get("/produtos", produtoController.listar); 