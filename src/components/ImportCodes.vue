                    // Обрабатываем импортируемые данные
                    jsonData.forEach(item => {
                        if ((item as any).code) {
                            let kiCode = (item as any).code;
                            // Удаляем символы _x001d_ из кода
                            kiCode = kiCode.replace(/_x001d_/g, '');
                            // Обновляем код после удаления символов
                            (item as any).code = kiCode;
                        }

                        // Обрезаем код до 31 символа для сравнения
                        const truncatedCode = ((item as any).code || '').substring(0, 31);
                    });

                    // Обрабатываем импортируемые данные
                    jsonData.forEach(item => {
                        if (!(item as any).gtin && (item as any).code) {
                            let kiCode = (item as any).code;
                            // Удаляем символы _x001d_ из кода
                            kiCode = kiCode.replace(/_x001d_/g, '');
                            const gtinMatch = kiCode.match(/01(\d{14})/);
                            if (gtinMatch && gtinMatch[1]) {
                                (item as any).gtin = gtinMatch[1];
                            }
                            // Обновляем код после удаления символов
                            (item as any).code = kiCode;
                        }

                        // Обрезаем код до 31 символа для сравнения
                        const truncatedCode = ((item as any).code || '').substring(0, 31); 
                    });

                    // Создаем Map для хранения уникальных записей по КИ
                    const uniqueData = new Map();

                    // ... rest of the existing code ... 

                    console.log('Исходные данные:', jsonData);

                    // Обрабатываем импортируемые данные
                    jsonData.forEach(item => {
                        console.log('Обработка элемента:', item);
                        if ((item as any).code) {
                            let kiCode = (item as any).code;
                            console.log('Исходный код:', kiCode);
                            // Удаляем символы _x001d_ из кода
                            kiCode = kiCode.replace(/_x001d_/g, '');
                            console.log('Код после удаления _x001d_:', kiCode);
                            // Форматируем код
                            kiCode = formatDataMatrixCode(kiCode);
                            console.log('Код после форматирования:', kiCode);
                            // Обновляем код после удаления символов
                            (item as any).code = kiCode;
                        }

                        // Обрезаем код до 31 символа для сравнения
                        const truncatedCode = ((item as any).code || '').substring(0, 31);
                        console.log('Обрезанный код:', truncatedCode);
                    });

                    console.log('Данные после обработки:', jsonData);

                    // Создаем Map для хранения уникальных записей по КИ
                    const uniqueData = new Map();

                    // ... rest of the existing code ... 