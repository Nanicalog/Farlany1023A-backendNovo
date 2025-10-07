import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "mongodb";


interface ItemCarrinho {
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
}

interface Carrinho {
    usuarioId: ObjectId;
    itens: ItemCarrinho[];
    total: number;
    modificacao: Date;
}
class CarrinhoController {
    // GET 
    async getCarrinho(req: Request, res: Response) {
        const { usuarioId } = req.params;
        if (!usuarioId) {
            return res.status(400).json({ message: "usuarioId é obrigatório" });
        }

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: ObjectId.createFromHexString(usuarioId) });

        if (!carrinho) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        res.json(carrinho);
    }

    // POST 
    async adicionar(req: Request, res: Response) {
        const { usuarioId, produtoId, nome, preco, quantidade } = req.body;

        if (!usuarioId || !produtoId || !nome || !preco || quantidade == null) {
            return res.status(400).json({ message: "Campos obrigatórios: usuarioId, produtoId, nome, preco, quantidade" });
        }

        if (quantidade <= 0) {
            return res.status(400).json({ message: "Quantidade inválida" });
        }

        let carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: ObjectId.createFromHexString(usuarioId) });

        if (!carrinho) {
            const novoCarrinho: Carrinho = {
                usuarioId: ObjectId.createFromHexString(usuarioId),
                itens: [{ produtoId, nome, preco, quantidade }],
                total: preco * quantidade,
                modificacao: new Date(),
            };

            await db.collection("carrinhos").insertOne(novoCarrinho);
            return res.status(201).json(novoCarrinho);
        }

        const itemExistente: ItemCarrinho | undefined = carrinho.itens.find((i: ItemCarrinho) => i.produtoId === produtoId);

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            carrinho.itens.push({ produtoId, nome, preco, quantidade });
        }

        carrinho.total = carrinho.itens.reduce(
            (acc: number, item: ItemCarrinho): number => acc + item.preco * item.quantidade,
            0
        );

        carrinho.modificacao = new Date();

        await db.collection("carrinhos").updateOne(
            { usuarioId: ObjectId.createFromHexString(usuarioId) },
            {
                $set:
                {
                    itens: carrinho.itens,
                    total: carrinho.total,
                    modificacao: carrinho.modificacao
                }
            }
        );

        return res.status(200).json(carrinho);
    }
}

export default new CarrinhoController();

//buscar o preço do produto
//pegar o nome do produto

//verificar se um carrinho com o usuario ja existe
//se existir, criar um novo carrinho
//se não existir, deve criar um novo carrinho
//  existente
