import {runDb, runDB} from "./db";
import { app } from "./settings";
import * as dotenv from "dotenv";

dotenv.config();



const port = process.env.PORT || 3999

const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

startApp()

export default app;
