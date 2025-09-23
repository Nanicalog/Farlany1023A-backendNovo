interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nomeProduto: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}
class CarrinhoController {
    //adicionarItem
    //RemoverItem
    //AtualizarQuantidade
    //listar
    //remover
}
export default new CarrinhoController();