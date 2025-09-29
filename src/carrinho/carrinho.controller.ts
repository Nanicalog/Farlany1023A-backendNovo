import { Request, Response } from "express";
import { db } from "../database/banco-mongo"; // Corrigido nome e removida extensão .js
import { ObjectId } from "mongodb";

// Tipagem para item do carrinho
interface ProdutoCarrinho {
    produtoId: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
}

// Tipagem para o carrinho do usuário
interface CarrinhoDeUsuario {
    usuarioId: string;
    itens: ProdutoCarrinho[];
    total: number;
}

class CarrinhoController {
    // GET - Obter carrinho por ID de usuário
    async buscarCarrinho(req: Request, res: Response) {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            return res.status(400).json({ erro: "O campo usuarioId é obrigatório." });
        }

        try {
            const carrinho = await db
                .collection<CarrinhoDeUsuario>("carrinhos")
                .findOne({ usuarioId });

            if (!carrinho) {
                return res.status(404).json({ erro: "Carrinho não localizado." });
            }

            res.status(200).json(carrinho);
        } catch (e) {
            res.status(500).json({ erro: "Erro ao buscar carrinho." });
        }
    }

    // POST - Criar ou substituir carrinho para o usuário
    async adicionarAoCarrinho(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade } = req.body;

        if (!usuarioId || !produtoId || !quantidade) {
            return res.status(400).json({ erro: "Dados incompletos." });
        }

        try {
            const produto = await db.collection("produtos").findOne({ _id: new ObjectId(produtoId) });

            if (!produto) {
                return res.status(404).json({ erro: "Produto não encontrado." });
            }

            const novoItem: ProdutoCarrinho = {
                produtoId,
                nome: produto.nome,
                quantidade,
                precoUnitario: produto.preco
            };

            const novoCarrinho: CarrinhoDeUsuario = {
                usuarioId,
                itens: [novoItem],
                total: novoItem.quantidade * novoItem.precoUnitario
            };

            const resultado = await db.collection("carrinhos").updateOne(
                { usuarioId },
                { $set: novoCarrinho },
                { upsert: true }
            );

            res.status(201).json({ ...novoCarrinho, _id: resultado.upsertedId ?? undefined });
        } catch (e) {
            res.status(500).json({ erro: "Erro ao adicionar produto ao carrinho." });
        }
    }

    // PUT - Atualizar quantidade de um item no carrinho
    async modificarQuantidade(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade } = req.body;

        if (!usuarioId || !produtoId || quantidade == null) {
            return res.status(400).json({ erro: "Parâmetros inválidos." });
        }

        try {
            const carrinho = await db.collection<CarrinhoDeUsuario>("carrinhos").findOne({ usuarioId });

            if (!carrinho) {
                return res.status(404).json({ erro: "Carrinho não encontrado." });
            }

            const index = carrinho.itens.findIndex(item => item.produtoId === produtoId);
            if (index === -1) {
                return res.status(404).json({ erro: "Produto não está no carrinho." });
            }

            carrinho.itens[index].quantidade = quantidade;

            // Recalcular total
            carrinho.total = carrinho.itens.reduce((total, item) =>
                total + item.quantidade * item.precoUnitario, 0);

            await db.collection("carrinhos").updateOne(
                { usuarioId },
                { $set: carrinho }
            );

            res.status(200).json(carrinho);
        } catch (e) {
            res.status(500).json({ erro: "Erro ao atualizar quantidade." });
        }
    }

    // DELETE - Remover carrinho do usuário
    async excluirCarrinho(req: Request, res: Response) {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            return res.status(400).json({ erro: "usuarioId obrigatório." });
        }

        try {
            const resultado = await db.collection("carrinhos").deleteOne({ usuarioId });

            if (resultado.deletedCount === 0) {
                return res.status(404).json({ erro: "Carrinho não encontrado para exclusão." });
            }

            res.status(200).json({ mensagem: "Carrinho removido com sucesso."
            }); 
        