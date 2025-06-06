document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('balance');
    const betInput = document.getElementById('betAmount');
    const headsBtn = document.getElementById('headsBtn');
    const tailsBtn = document.getElementById('tailsBtn');
    const coin = document.getElementById('coin');
    const resultElement = document.getElementById('result');

    let balance = 1000; // Начальный баланс
    let telegramId = null;
    let isPlaying = false;

    // Базовый URL для API - локальный backend
    const API_BASE_URL = 'http://localhost:8080';

    // Получаем telegramId из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    telegramId = urlParams.get('telegramId');

    // Если telegramId не передан, используем тестовый ID
    if (!telegramId) {
        telegramId = '123456';
        console.log('Используется тестовый telegramId:', telegramId);
    }

    // Загружаем начальный баланс с сервера
    fetchBalance();

    async function fetchBalance() {
        try {
            console.log('Запрос баланса для telegramId:', telegramId);
            const response = await fetch(`${API_BASE_URL}/game/balance?telegramId=${telegramId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при получении баланса: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Получен ответ:', data);
            balance = data.balance;
            updateBalance();
        } catch (error) {
            console.error('Ошибка при получении баланса:', error);
            resultElement.textContent = 'Ошибка при загрузке баланса: ' + error.message;
        }
    }

    function updateBalance() {
        balanceElement.textContent = balance;
    }

    async function flipCoin(choice) {
        if (isPlaying) return;
        
        const bet = parseInt(betInput.value);
        
        if (isNaN(bet) || bet <= 0) {
            resultElement.textContent = 'Пожалуйста, введите корректную ставку';
            return;
        }

        if (bet > balance) {
            resultElement.textContent = 'Недостаточно средств';
            return;
        }

        isPlaying = true;
        resultElement.textContent = 'Монета подбрасывается...';
        
        // Анимация подбрасывания монеты
        coin.classList.add('flip');
        
        try {
            console.log('Отправка запроса на игру:', { telegramId, bet, choice });
            const response = await fetch(`${API_BASE_URL}/game/play?telegramId=${telegramId}&bet=${bet}&choice=${choice}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при обработке игры: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Получен ответ от сервера:', data);
            
            setTimeout(() => {
                coin.classList.remove('flip');
                
                if (data.isWin) {
                    resultElement.textContent = `Поздравляем! Выпал ${data.result}. Вы выиграли ${bet} монет!`;
                } else {
                    resultElement.textContent = `К сожалению, выпал ${data.result}. Вы проиграли ${bet} монет.`;
                }
                
                balance = data.balance;
                updateBalance();
                isPlaying = false;
            }, 1000);
        } catch (error) {
            console.error('Ошибка при обработке игры:', error);
            resultElement.textContent = 'Произошла ошибка при обработке игры: ' + error.message;
            coin.classList.remove('flip');
            isPlaying = false;
        }
    }

    headsBtn.addEventListener('click', () => flipCoin('heads'));
    tailsBtn.addEventListener('click', () => flipCoin('tails'));
}); 