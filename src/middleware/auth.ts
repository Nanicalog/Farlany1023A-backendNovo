import { Request, Response, NextFunction } from 'express';

function Auth(req: Request, res: Response, next: NextFunction) {
    console.log('Passou pelo middleware de autenticação');
    // Se quiser bloquear acesso, descomente essa linha e não chame next()
    // return res.status(401).json({ mensagem: "Você não tem permissão para acessar esse recurso!" });

    next(); // Continua para a próxima função/middleware
}

export default Auth;
