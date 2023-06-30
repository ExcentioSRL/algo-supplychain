import {Request,Response} from "express"

export function authenticate(req : Request, res: Response, next: () => void){
    if (req.session) {
        next();
    } else {
        res.status(401).json({ error: 'User isn\'t authenticated' });
    }
}
