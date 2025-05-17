import {runDB} from "./db";
import { app } from "./settings";
import * as dotenv from "dotenv";

dotenv.config();

const startApp = async () => {
    try {
        await runDB();
        const port = process.env.PORT || 5001;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Запуск только если файл запущен напрямую
if (require.main === module) {
    startApp();
}

export default app;
