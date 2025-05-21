document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('balance');
    const betInput = document.getElementById('betAmount');
    const headsBtn = document.getElementById('headsBtn');
    const tailsBtn = document.getElementById('tailsBtn');
    const coin = document.getElementById('coin');
    const resultElement = document.getElementById('result');

    let balance = 1000; // Начальный баланс
    let telegramId = null;

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
            const response = await fetch(`https://super-casino-backend.onrender.com/game/balance?telegramId=${telegramId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при получении баланса: ${errorText}`);
            }
            const data = await response.json();
            balance = data.balance;
            updateBalance();
        } catch (error) {
            console.error('Ошибка:', error);
            resultElement.textContent = 'Ошибка при загрузке баланса: ' + error.message;
        }
    }

    function updateBalance() {
        balanceElement.textContent = balance;
    }

    async function flipCoin(choice) {
        const bet = parseInt(betInput.value);
        
        if (isNaN(bet) || bet <= 0) {
            resultElement.textContent = 'Пожалуйста, введите корректную ставку';
            return;
        }

        if (bet > balance) {
            resultElement.textContent = 'Недостаточно средств';
            return;
        }

        // Анимация подбрасывания монеты
        coin.classList.add('flip');
        
        try {
            const response = await fetch(`https://super-casino-backend.onrender.com/game/play?telegramId=${telegramId}&bet=${bet}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при обработке игры: ${errorText}`);
            }
            
            const data = await response.json();
            
            setTimeout(() => {
                coin.classList.remove('flip');
                
                if (data.isWin) {
                    balance = data.balance;
                    resultElement.textContent = `Поздравляем! Вы выиграли ${bet} ₽`;
                } else {
                    balance = data.balance;
                    resultElement.textContent = `К сожалению, вы проиграли ${bet} ₽`;
                }
                
                updateBalance();
            }, 1000);
        } catch (error) {
            console.error('Ошибка:', error);
            resultElement.textContent = 'Произошла ошибка при обработке игры: ' + error.message;
            coin.classList.remove('flip');
        }
    }

    headsBtn.addEventListener('click', () => flipCoin('heads'));
    tailsBtn.addEventListener('click', () => flipCoin('tails'));
}); 