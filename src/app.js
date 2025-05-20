document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('balance');
    const betInput = document.getElementById('betAmount');
    const headsBtn = document.getElementById('headsBtn');
    const tailsBtn = document.getElementById('tailsBtn');
    const coin = document.getElementById('coin');
    const resultElement = document.getElementById('result');

    let balance = 1000; // Начальный баланс
    updateBalance();

    function updateBalance() {
        balanceElement.textContent = balance;
    }

    function flipCoin(choice) {
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
        
        // Имитация подбрасывания монеты
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        
        setTimeout(() => {
            coin.classList.remove('flip');
            
            if (result === choice) {
                balance += bet;
                resultElement.textContent = `Поздравляем! Вы выиграли ${bet} ₽`;
            } else {
                balance -= bet;
                resultElement.textContent = `К сожалению, вы проиграли ${bet} ₽`;
            }
            
            updateBalance();
        }, 1000);
    }

    headsBtn.addEventListener('click', () => flipCoin('heads'));
    tailsBtn.addEventListener('click', () => flipCoin('tails'));
}); 