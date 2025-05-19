import {CallToAPIType} from "./types";
import moment from "moment";
import {apiLogsCollection} from "../../db";

export class ApiCallHistoryRepository {
    async recordAPICall(call: CallToAPIType) {
        await apiLogsCollection.insertOne(call)
    }

    async countRequests(IP: string, URL: string, timeIntervalSeconds: number) {
        const now = moment().valueOf()
        const startTime = now - timeIntervalSeconds * 1000
        const count = await apiLogsCollection.countDocuments({
            $and: [
                {IP},
                {URL},
                {dateToNumber: {$gt: startTime}}
            ]
        })
        return count
    }

    async deleteAllRecords() {
        await apiLogsCollection.deleteMany({})
        return true
    }
}

export const apiCallHistoryRepository = new ApiCallHistoryRepository()