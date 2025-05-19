import {NextFunction, Request, Response} from "express";
import moment from "moment";
import {apiCallHistoryRepository} from "../features/apiCallHistory/api-call-history-repository";
import { HTTP_STATUSES } from "../utils/common";
import {StatusCodes} from "http-status-codes";

//TODO количество попыток обращения с одного ип адреса

export const attemptsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const IP = req.ip!
    const URL = req.url
    const date = moment().format()
    const dateToNumber = moment().valueOf()
    const requestTimeInterval = 10
    await apiCallHistoryRepository.recordAPICall({IP, URL, date, dateToNumber})
    const attempts= await apiCallHistoryRepository.countRequests(IP,URL,requestTimeInterval)
    attempts > 5 ? res.sendStatus(StatusCodes.TOO_MANY_REQUESTS) : next()
};