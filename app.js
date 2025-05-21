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

    // Загружаем начальный баланс с сервера
    if (telegramId) {
        fetchBalance();
    } else {
        updateBalance();
    }

    async function fetchBalance() {
        try {
            const response = await fetch(`/game/balance?telegramId=${telegramId}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении баланса');
            }
            const data = await response.json();
            balance = data.balance;
            updateBalance();
        } catch (error) {
            console.error('Ошибка:', error);
            resultElement.textContent = 'Ошибка при загрузке баланса';
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
            const response = await fetch(`/game/play?telegramId=${telegramId}&bet=${bet}`);
            if (!response.ok) {
                throw new Error('Ошибка при обработке игры');
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
            resultElement.textContent = 'Произошла ошибка при обработке игры';
            coin.classList.remove('flip');
        }
    }

    headsBtn.addEventListener('click', () => flipCoin('heads'));
    tailsBtn.addEventListener('click', () => flipCoin('tails'));
}); 