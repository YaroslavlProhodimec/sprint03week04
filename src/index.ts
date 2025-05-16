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

class DataMatrixUtils {
    static formatDataMatrixCode(inputCode: string): string {
        try {
            // Удаляем все пробелы и управляющие символы для начальной очистки
            let cleanCode = inputCode.replace(/\s+/g, '');

            // Если код начинается с 0, продолжаем обработку
            if (cleanCode[0] !== '0') {
                cleanCode = '0' + cleanCode;
            }

            // Определяем тип кода по длине серийного номера
            // Первые 16 символов одинаковы для всех (01 + 14 цифр GTIN)
            const gtinPart = cleanCode.substring(0, 16);
            const serialPart = cleanCode.substring(18); // После AI 21

            // Проверяем минимальную длину кода
            if (cleanCode.length < 24) { // Минимальная длина для консервов (2+14+2+6)
                console.log('Код слишком короткий для форматирования');
                return cleanCode;
            }

            // Определяем формат кода на основе его длины
            const totalLength = cleanCode.length;
            let firstPartLength;

            // Для консервов (серийный номер 6 символов)
            if (totalLength === 76) { // 78 - 2 (разделители)
                firstPartLength = 24; // 2(AI 01) + 14(GTIN) + 2(AI 21) + 6(серийный номер)
            }
            // Для фототоваров (серийный номер 20 символов)
            else if (totalLength === 90) { // 92 - 2 (разделители)
                firstPartLength = 38; // 2(AI 01) + 14(GTIN) + 2(AI 21) + 20(серийный номер)
            }
            // Для духов, шин, лекарств, велосипедов, кресел-колясок (серийный номер 13 символов)
            else if (totalLength === 83) { // 85 - 2 (разделители)
                firstPartLength = 31; // 2(AI 01) + 14(GTIN) + 2(AI 21) + 13(серийный номер)
            }
            // Для легкой промышленности (серийный номер 13 символов)
            else if (totalLength === 127) { // 129 - 2 (разделители)
                firstPartLength = 31; // 2(AI 01) + 14(GTIN) + 2(AI 21) + 13(серийный номер)
            }
            else {
                console.log(`Неожиданная длина кода: ${totalLength}. Ожидается: 
                - 76 для консервов (78 с разделителями)
                - 90 для фото (92 с разделителями)
                - 83 для духов/шин/лекарств/велосипедов/кресел-колясок (85 с разделителями)
                - 127 для легкой промышленности (129 с разделителями)`);
                return cleanCode;
            }

            // Разбиваем код на части
            const firstPart = cleanCode.substring(0, firstPartLength);
            const remainingPart = cleanCode.substring(firstPartLength);

            // Проверяем наличие AI 91
            if (remainingPart.startsWith('91')) {
                const ai91Part = remainingPart.substring(0, 6); // 91 + 4 символа keyId
                const ai92Part = remainingPart.substring(6); // оставшаяся часть

                // Проверяем наличие AI 92
                if (ai92Part.startsWith('92')) {
                    return firstPart +
                           String.fromCharCode(29) + // <GS>
                           ai91Part +
                           String.fromCharCode(29) + // <GS>
                           ai92Part;
                }
            }

            // Если формат не соответствует ожидаемому, возвращаем очищенный код без изменений
            return cleanCode;

        } catch (error) {
            console.error('Ошибка при форматировании кода:', error);
            return inputCode; // В случае ошибки возвращаем исходный код
        }
    }
}
