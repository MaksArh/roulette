document.addEventListener('DOMContentLoaded', () => {
    // Получаем ID стола из URL
    const tableId = window.location.pathname.split('/').pop();
    
    // Элементы DOM
    const historyList = document.getElementById('history-list');
    
    // Обновляем селекторы для элементов лимитов ставок
    const minBetElement = document.querySelector('.limit-row:first-child .limit-value');
    const maxBetElement = document.querySelector('.limit-row:last-child .limit-value');
    
    // Секции статистики
    const lowSection = document.getElementById('low-section');
    const highSection = document.getElementById('high-section');
    const zeroSection1 = document.getElementById('zero-section-1');
    const oddSection = document.getElementById('odd-section');
    const evenSection = document.getElementById('even-section');
    const zeroSection2 = document.getElementById('zero-section-2');
    const blackSection = document.getElementById('black-section');
    const redSection = document.getElementById('red-section');
    const zeroSection3 = document.getElementById('zero-section-3');
    const oddSection2 = document.getElementById('odd-section-2');
    const evenSection2 = document.getElementById('even-section-2');
    const zeroSection4 = document.getElementById('zero-section-4');
    
    // Сетки горячих и холодных чисел
    const hotNumbersGrid = document.getElementById('hot-numbers-grid');
    const coldNumbersGrid = document.getElementById('cold-numbers-grid');
    
    // Хранение предыдущего состояния
    let prevNumbers = [];
    let isAnimationInProgress = false;
    
    // Инициализация Socket.IO
    const socket = io();
    
    // Присоединение к комнате стола
    socket.emit('joinTable', tableId);
    
    // Обработка обновлений стола
    socket.on('tableUpdate', (tableData) => {
        updateTableDisplay(tableData);
    });
    
    // Первоначальная загрузка данных стола
    async function loadInitialTableData() {
        try {
            const response = await fetch(`/api/table/${tableId}`);
            const tableData = await response.json();
            updateTableDisplay(tableData);
        } catch (error) {
            console.error('Ошибка при загрузке данных стола:', error);
        }
    }
    
    // Обновление отображения стола
    function updateTableDisplay(tableData) {
        // Обновление лимитов ставок
        minBetElement.textContent = tableData.minBet;
        maxBetElement.textContent = tableData.maxBet;
        
        // Обновление истории выпадений с улучшенной анимацией
        updateHistoryList(tableData.lastNumbers);
        
        // Обновление статистики
        updateStatistics(tableData.statistics);
        
        // Обновление горячих и холодных чисел
        updateHotColdNumbers(tableData.statistics.hotNumbers, tableData.statistics.coldNumbers);
        
        // Сохраняем текущие числа для следующего обновления
        prevNumbers = [...tableData.lastNumbers];
    }
    
    // Обновление истории выпадений с улучшенной анимацией
    function updateHistoryList(numbers) {
        // Если анимация уже выполняется, пропустить
        if (isAnimationInProgress) return;
        
        // Если история пуста, не отображаем ничего
        if (numbers.length === 0) {
            historyList.innerHTML = '';
            return;
        }
        
        // Если это первая загрузка или предыдущего состояния нет
        if (prevNumbers.length === 0 || historyList.childElementCount === 0) {
            historyList.innerHTML = '';
            
            // Создаем элементы для каждого числа в истории
            numbers.forEach((num, index) => {
                const container = document.createElement('div');
                const containerClasses = [`history-item-container`, `${num.color}-container`];
                
                // Добавляем класс last-container для первого элемента
                if (index === 0) {
                    containerClasses.push('last-container');
                }
                
                container.className = containerClasses.join(' ');
                
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${num.color}`;
                historyItem.textContent = num.value;
                
                // Первое число - самое последнее
                if (index === 0) {
                    historyItem.classList.add('last');
                }
                
                container.appendChild(historyItem);
                historyList.appendChild(container);
            });
            return;
        }
        
        // Проверяем, есть ли новое число (сравниваем с предыдущим состоянием)
        if (numbers[0].value !== prevNumbers[0].value || numbers[0].color !== prevNumbers[0].color) {
            isAnimationInProgress = true;
            
            // Шаг 1: Уменьшаем старую последнюю цифру
            const currentContainers = historyList.querySelectorAll('.history-item-container');
            if (currentContainers.length > 0) {
                const lastContainer = currentContainers[0];
                const lastItem = lastContainer.querySelector('.history-item');
                
                // Уменьшаем последний элемент (анимация)
                lastContainer.classList.remove('last-container');
                // lastItem.classList.add('shrink');
                lastItem.classList.remove('last');
                
                // Ждем завершения первой анимации (уменьшение)
                setTimeout(() => {
                    // Шаг 2: Создаем и добавляем новую цифру
                    const newContainer = document.createElement('div');
                    newContainer.className = `history-item-container ${numbers[0].color}-container last-container`;
                    
                    const newItem = document.createElement('div');
                    newItem.className = `history-item ${numbers[0].color} last`;
                    newItem.textContent = numbers[0].value;
                    
                    newContainer.appendChild(newItem);
                    historyList.insertBefore(newContainer, historyList.firstChild);
                    
                    // Шаг 3: Смещаем все цифры вниз только после добавления нового элемента
                    setTimeout(() => {
                        // После того как добавлена новая цифра, смещаем предыдущие вниз
                        for (let i = 1; i < currentContainers.length + 1; i++) {
                            const container = historyList.children[i];
                            if (container) {
                                container.classList.add('move-down');
                            }
                        }
                        
                        // Удаляем последний элемент, если их больше 15
                        if (currentContainers.length >= 15) {
                            setTimeout(() => {
                                if (historyList.children.length > 15) {
                                    historyList.removeChild(historyList.children[historyList.children.length - 1]);
                                }
                                
                                // Удаляем классы анимации после всех манипуляций
                                for (let i = 1; i < historyList.children.length; i++) {
                                    historyList.children[i].classList.remove('move-down');
                                    const item = historyList.children[i].querySelector('.history-item');
                                    if (item) item.classList.remove('shrink');
                                }
                                
                                // Позиционируем контейнеры по краям после завершения анимации
                                for (let i = 1; i < historyList.children.length; i++) {
                                    const container = historyList.children[i];
                                    if (container.classList.contains('black-container')) {
                                        container.style.justifyContent = 'flex-start';
                                    } else if (container.classList.contains('red-container')) {
                                        container.style.justifyContent = 'flex-end';
                                    }
                                }
                                
                                isAnimationInProgress = false;
                            }, 0);
                        } else {
                            // Удаляем классы анимации
                            setTimeout(() => {
                                for (let i = 1; i < historyList.children.length; i++) {
                                    historyList.children[i].classList.remove('move-down');
                                    const item = historyList.children[i].querySelector('.history-item');
                                    if (item) item.classList.remove('shrink');
                                }
                                
                                // Позиционируем контейнеры по краям после завершения анимации
                                for (let i = 1; i < historyList.children.length; i++) {
                                    const container = historyList.children[i];
                                    if (container.classList.contains('black-container')) {
                                        container.style.justifyContent = 'flex-start';
                                    } else if (container.classList.contains('red-container')) {
                                        container.style.justifyContent = 'flex-end';
                                    }
                                }
                                
                                isAnimationInProgress = false;
                            }, 0);
                        }
                    }, 0); // Небольшая задержка перед началом смещения вниз
                }, 0); // Задержка для завершения анимации уменьшения
            }
        }
    }
    
    // Обновление статистики
    function updateStatistics(statistics) {
        const { lowMidHigh, evenOddZero, colorDistribution } = statistics;
        
        // Получаем все заголовки для статистики
        const statsTitles = document.querySelectorAll('.stats-title');
        
        // Расчет для LOW / HIGH / ZERO
        const lowValue = lowMidHigh.low || 0;
        const highValue = lowMidHigh.high || 0;
        const zeroValue1 = lowMidHigh.zero || 0;
        const totalLowMidHigh = lowValue + highValue + zeroValue1;
        
        if (totalLowMidHigh > 0) {
            const lowPercent = Math.round((lowValue / totalLowMidHigh) * 100);
            const highPercent = Math.round((highValue / totalLowMidHigh) * 100);
            const zeroPercent1 = Math.round((zeroValue1 / totalLowMidHigh) * 100);
            
            // Обновляем заголовки первой секции (LOW / HIGH)
            statsTitles[0].children[0].textContent = `LOW ${lowPercent}%`;
            statsTitles[0].children[1].textContent = `HIGH ${highPercent}%`;
            
            // Обновляем ширины секций
            lowSection.style.width = `${lowPercent}%`;
            highSection.style.width = `${highPercent}%`;
            zeroSection1.style.width = `${zeroPercent1}%`;
        } else {
            // Сбрасываем заголовки
            statsTitles[0].children[0].textContent = 'LOW 0%';
            statsTitles[0].children[1].textContent = 'HIGH 0%';
            
            // Сбрасываем ширины
            lowSection.style.width = '0%';
            highSection.style.width = '0%';
            zeroSection1.style.width = '0%';
        }
        
        // Расчет для ODD / EVEN / ZERO
        const oddValue = evenOddZero.odd || 0;
        const evenValue = evenOddZero.even || 0;
        const zeroValue2 = evenOddZero.zero || 0;
        const totalEvenOddZero = oddValue + evenValue + zeroValue2;
        
        if (totalEvenOddZero > 0) {
            const oddPercent = Math.round((oddValue / totalEvenOddZero) * 100);
            const evenPercent = Math.round((evenValue / totalEvenOddZero) * 100);
            const zeroPercent2 = Math.round((zeroValue2 / totalEvenOddZero) * 100);
            
            // Обновляем заголовки секций ODD / EVEN
            statsTitles[1].children[0].textContent = `ODD ${oddPercent}%`;
            statsTitles[1].children[1].textContent = `EVEN ${evenPercent}%`;
            statsTitles[3].children[0].textContent = `ODD ${oddPercent}%`;
            statsTitles[3].children[1].textContent = `EVEN ${evenPercent}%`;
            
            // Обновляем ширины секций
            oddSection.style.width = `${oddPercent}%`;
            evenSection.style.width = `${evenPercent}%`;
            zeroSection2.style.width = `${zeroPercent2}%`;
            
            // Дублирование для второго ODD/ZERO/EVEN
            oddSection2.style.width = `${oddPercent}%`;
            evenSection2.style.width = `${evenPercent}%`;
            zeroSection4.style.width = `${zeroPercent2}%`;
        } else {
            // Сбрасываем заголовки
            statsTitles[1].children[0].textContent = 'ODD 0%';
            statsTitles[1].children[1].textContent = 'EVEN 0%';
            statsTitles[3].children[0].textContent = 'ODD 0%';
            statsTitles[3].children[1].textContent = 'EVEN 0%';
            
            // Сбрасываем ширины
            oddSection.style.width = '0%';
            evenSection.style.width = '0%';
            zeroSection2.style.width = '0%';
            oddSection2.style.width = '0%';
            evenSection2.style.width = '0%';
            zeroSection4.style.width = '0%';
        }
        
        // Расчет для BLACK / RED / GREEN
        const blackValue = colorDistribution.black || 0;
        const redValue = colorDistribution.red || 0;
        const greenValue = colorDistribution.green || 0;
        const totalColors = blackValue + redValue + greenValue;
        
        if (totalColors > 0) {
            const blackPercent = Math.round((blackValue / totalColors) * 100);
            const redPercent = Math.round((redValue / totalColors) * 100);
            const greenPercent = Math.round((greenValue / totalColors) * 100);
            
            // Обновляем заголовки для BLACK / RED
            statsTitles[2].children[0].textContent = `BLACK ${blackPercent}%`;
            statsTitles[2].children[1].textContent = `RED ${redPercent}%`;
            
            // Обновляем ширины секций
            blackSection.style.width = `${blackPercent}%`;
            redSection.style.width = `${redPercent}%`;
            zeroSection3.style.width = `${greenPercent}%`;
        } else {
            // Сбрасываем заголовки
            statsTitles[2].children[0].textContent = 'BLACK 0%';
            statsTitles[2].children[1].textContent = 'RED 0%';
            
            // Сбрасываем ширины
            blackSection.style.width = '0%';
            redSection.style.width = '0%';
            zeroSection3.style.width = '0%';
        }
    }
    
    // Обновление горячих и холодных чисел
    function updateHotColdNumbers(hotNumbers, coldNumbers) {
        // Обновление горячих чисел
        hotNumbersGrid.innerHTML = '';
        hotNumbers.forEach(num => {
            const numberItem = createNumberItem(num.value, num.count, getNumberColor(num.value));
            hotNumbersGrid.appendChild(numberItem);
        });
        
        // Обновление холодных чисел
        coldNumbersGrid.innerHTML = '';
        coldNumbers.forEach(num => {
            const numberItem = createNumberItem(num.value, num.count, getNumberColor(num.value));
            coldNumbersGrid.appendChild(numberItem);
        });
    }
    
    // Функция для создания элемента числа
    function createNumberItem(value, count, color) {
        const numberItem = document.createElement('div');
        numberItem.className = 'number-item';
        
        const numberCircle = document.createElement('div');
        numberCircle.className = `number-circle ${color}`;
        numberCircle.textContent = value;
        numberCircle.setAttribute('data-text', value);
        
        const numberCount = document.createElement('div');
        numberCount.className = 'number-count';
        numberCount.textContent = count;
        
        numberItem.appendChild(numberCircle);
        numberItem.appendChild(numberCount);
        
        return numberItem;
    }
    
    // Получение цвета для числа
    function getNumberColor(value) {
        if (value === 0) return 'green';
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        return redNumbers.includes(value) ? 'red' : 'black';
    }
    
    // Загружаем начальные данные
    loadInitialTableData();
    
    // Обработка переподключения при потере связи
    socket.on('disconnect', () => {
        console.log('Соединение потеряно. Пытаемся переподключиться...');
        
        // Попытка переподключения через 2 секунды
        setTimeout(() => {
            socket.connect();
            
            // После переподключения присоединяемся к комнате стола снова
            socket.on('connect', () => {
                console.log('Переподключение успешно');
                socket.emit('joinTable', tableId);
                loadInitialTableData();
            });
        }, 2000);
    });
}); 