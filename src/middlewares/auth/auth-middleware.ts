import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {jwtService} from "../../application/jwt-service";


const login = 'admin'
const password = 'qwerty'


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const auth = req.headers['authorization']

    if (!auth) {
        res.sendStatus(401)
        return
    }

    const [basic, token] = auth.split(' ')
    // console.log(basic, 'basic')
    // console.log(token, 'token')
    if (basic !== 'Basic') {
        res.sendStatus(401)
        return;
    }

    const decodedData = Buffer.from(token, 'base64').toString()
    // console.log(decodedData, 'decodedData')
    const [decodedLogin, decodedPassword] = decodedData.split(':')

    if (decodedLogin !== login || decodedPassword !== password) {
        res.sendStatus(401)
        return;
    }

    return next()

}

// export const bearerAuth = async (req: any, res: Response, next: NextFunction) => {
//
//     if (!req.headers.authorization) {
//         res.send(HTTP_STATUSES.UNAUTHORIZED_401)
//         return ;
//     }
//
//     const token = req.headers.authorization.split(' ')[1]
//     const userId = await jwtService.getUserIdByToken(token)
//
//     console.log(userId, 'userId await jwtService.getUserIdByToken(token)')
//
//     let id =  new ObjectId(userId)
//     if (userId) {
//         req.user = await usersCollection.findOne({_id: id })
//         console.log(req.user,'req.user ')
//         return next()
//     }
//
//     // res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
//
//     res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
// }
export const accessTokenValidityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    let accessTokenValue = req.headers.authorization;
    if (!accessTokenValue || accessTokenValue.split(" ")[0].toLowerCase() !== "bearer") {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }
    const token = accessTokenValue.split(" ")[1];
    const accessTokenJWTPayloadResult = await jwtService.getJwtPayloadResult(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
    );
    console.log(token, 'token')
    if (!accessTokenJWTPayloadResult) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
    } else {

        // @ts-ignore
        req.userId = accessTokenJWTPayloadResult.userId;
        next();
    }
};

// export const bearerAuth = async (req: any, res: Response, next: NextFunction) => {
//     const auth = req.headers['authorization']
//     if (!auth) {
//         return res.send(401)
//     }
//     const token = auth.split(' ')[1]  //bearer fasdfasdfasdf
//
//     const userId = await jwtService.getUserIdByToken(token)
//     let id =  new ObjectId(userId)
//     console.log(userId, 'its userid')
//     if (!userId) return res.sendStatus(401)
//     if (!ObjectId.isValid(userId)) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
//
//     const user = await usersCollection.findOne({_id: id})
//     if (user) {
//         req.user = user
//         return next()
//     }
//     console.log('not user')
//     res.sendStatus(401)
// }