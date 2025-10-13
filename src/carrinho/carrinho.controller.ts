import { Request, Response } from "express";
import { ObjectId } from "bson";
import { db } from "../database/banco-mongo.js";
import { ListSearchIndexesCursor } from "mongodb";

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}

interface Produto {
    _id: ObjectId;
    nome: string,
    preco: number,
    descricao: string,
    urlfoto: string
}

class CarrinhoController {
    //adicionarItem
    async adicionarItem(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade } = req.body as { usuarioId: string, produtoId: string, quantidade: number };
        console.log(usuarioId, produtoId, quantidade)

        //Buscar o produto no banco de dados
        const produto = await db.collection<Produto>('produtos')
            .findOne({ _id: ObjectId.createFromHexString(produtoId) });
        if (!produto)
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        //Pegar o preço do produto
        //Pegar o nome do produto
        const nomeProduto = produto.nome;
        const precoProduto = produto.preco;

        // Verificar se um carrinho com o usuário já existe
        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: usuarioId });

        if (!carrinho) {
            const novoCarrinho: Carrinho = {
                usuarioId: usuarioId,
                itens: [{
                    produtoId: produtoId,
                    quantidade: quantidade,
                    precoUnitario: precoProduto,
                    nome: nomeProduto
                }],
                dataAtualizacao: new Date(),
                total: precoProduto * quantidade
            }
            const resposta = await db.collection<Carrinho>("carrinhos").insertOne(novoCarrinho);
            const carrinhoResposta = {
                usuarioId: novoCarrinho.usuarioId,
                itens: novoCarrinho.itens,
                dataAtualizacao: novoCarrinho.dataAtualizacao,
                total: novoCarrinho.total,
                _id: resposta.insertedId

            }
            //return res.status(201).json({...novoCarrinho, _id: resposta.insertedId});

            //Early Return
            return res.status(201).json(carrinhoResposta);

        }
        //ELSE
        // Se existir, deve adicionar o item ao carrinho existente
        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
            carrinho.total += precoProduto * quantidade;
            carrinho.dataAtualizacao = new Date();
        }
        else {
            carrinho.itens.push({
                produtoId: produtoId,
                quantidade: quantidade,
                precoUnitario: precoProduto,
                nome: nomeProduto
            });
            carrinho.total += precoProduto * quantidade;
            carrinho.dataAtualizacao = new Date();
        }
        // Atualizar o carrinho no banco de dados
        await db.collection<Carrinho>("carrinhos").updateOne({ usuarioId: usuarioId },
            {
                $set: {
                    itens: carrinho.itens,
                    total: carrinho.total,
                    dataAtualizacao: carrinho.dataAtualizacao
                }
            }
        )
        res.status(200).json(carrinho);
    }
    //remove item
    removerItem(req: Request, res: Response) {
        const { produtoIdd, usuarioId } = req.body;

        if (!usuarioId) {
            return res.status(400).json({ mensagem: "usuarioId é obrigatório" });
        }
        if (!produtoIdd) {
            return res.status(400).json({ mensagem: "produtoId é obrigatório" });
        }
        
    }
    //atualizarQuantidade
    async atualizaQuantidade(req: Request, res: Response) {
        const { produtoId, usuarioId, quantidade } = req.body;
        
        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho)
            return res.status(404).json({ mensagem: "Carrinho não encontrado" });

        const item = carrinho.itens.find(i => i.produtoId === produtoId);
        if (!item)
            return res.status(404).json({ mensagem: "Produto não encontrado no carrinho" });

        item.quantidade = quantidade;

        carrinho.total = carrinho.itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0);
        carrinho.dataAtualizacao = new Date();

        await db.collection<Carrinho>("carrinhos").updateOne({ usuarioId }, { $set: carrinho });
        return res.status(200).json(carrinho);
    }
        //listar quantidade
    async listar(req: Request, res: Response) {
        const { usuarioId } = req.body;
        if (!usuarioId) {
            return res.status(400).json({ mensagem: "usuarioId é obrigatório" });
        }

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho) {
            return res.status(404).json({ mensagem: "Carrinho não encontrado" });
        }

        return res.status(200).json(carrinho);
    }
//remover carrinho
    async remover(req: Request, res: Response) {
        const { usuarioId } = req.body;
        if (!usuarioId) {
            return res.status(400).json({ mensagem: "usuarioId é obrigatório" });
        }

        const resultado = await db.collection<Carrinho>("carrinhos").deleteOne({ usuarioId });
        if (resultado.deletedCount === 0)
            return res.status(404).json({ mensagem: "Carrinho não encontrado" });

        return res.status(200).json({ mensagem: "Carrinho removido com sucesso" });
    }
}

export default new CarrinhoController();


//atualizarQuantidade

//listar
//remover   -> Remover o carrinho todo


