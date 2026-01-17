// 슬롯머신 게임 상태
const slotState = {
    playerChips: 1000,
    currentBet: 20,
    goalChips: 0,
    isSpinning: false,
    reels: [0, 0, 0]
};

// 심볼 정의 (다이아몬드 테마)
const symbols = [
    { icon: '💎', name: '큰다이아', payout: 50, weight: 20 },      // 레어
    { icon: '💎💎💎', name: '작은다이아3개', payout: 30, weight: 35 },
    { icon: '💎💎', name: '작은다이아2개', payout: 20, weight: 60 },
    { icon: '7️⃣', name: '럭키세븐', payout: 25, weight: 50 },
    { icon: '🪙', name: '황금동전', payout: 15, weight: 83 },
    { icon: '🍒', name: '체리', payout: 10, weight: 130 },
    { icon: '🍍', name: '파인애플', payout: 5, weight: 220 }
];

// 가중치 기반 심볼 풀 생성
let symbolPool = [];
symbols.forEach((symbol, index) => {
    for (let i = 0; i < symbol.weight; i++) {
        symbolPool.push(index);
    }
});

// DOM 요소
const slotGoalScreen = document.getElementById('slotGoalScreen');
const slotScreen = document.getElementById('slotScreen');
const startSlotBtn = document.getElementById('startSlotBtn');
const slotGoalBackBtn = document.getElementById('slotGoalBackBtn');
const slotBackToMenuBtn = document.getElementById('slotBackToMenuBtn');
const slotGoalButtons = document.querySelectorAll('.slot-goal-btn');

const slotChipsEl = document.getElementById('slotChips');
const slotBetAmountEl = document.getElementById('slotBetAmount');
const slotGoalAmountEl = document.getElementById('slotGoalAmount');
const slotGoalDisplayEl = document.getElementById('slotGoalDisplay');
const slotMessageEl = document.getElementById('slotMessage');

const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const reels = [reel1, reel2, reel3];

const spinBtn = document.getElementById('spinBtn');
const betBtns = document.querySelectorAll('.bet-btn');

// 이벤트 리스너
startSlotBtn.addEventListener('click', showSlotGoalSelection);

slotGoalBackBtn.addEventListener('click', () => {
    // 모든 화면 숨기기
    slotGoalScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('bjGoalScreen').classList.add('hidden');
    document.getElementById('blackjackScreen').classList.add('hidden');
    document.getElementById('slotScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
});

slotBackToMenuBtn.addEventListener('click', () => {
    // 모든 화면 숨기기
    slotScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('bjGoalScreen').classList.add('hidden');
    document.getElementById('blackjackScreen').classList.add('hidden');
    document.getElementById('slotGoalScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
});

slotGoalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // 이벤트 전파 방지
        const goal = parseInt(btn.dataset.goal);
        startSlot(goal);
    });
});

betBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!slotState.isSpinning) {
            betBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            slotState.currentBet = parseInt(btn.dataset.bet);
            updateSlotDisplay();
        }
    });
});

spinBtn.addEventListener('click', spin);

// 승리 조건 선택 화면
function showSlotGoalSelection() {
    // 모든 화면 숨기기
    startScreen.classList.add('hidden');
    slotGoalScreen.classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('bjGoalScreen').classList.add('hidden');
    document.getElementById('blackjackScreen').classList.add('hidden');
    document.getElementById('slotScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
}

// 슬롯 게임 시작
function startSlot(goalChips = 0) {
    // 모든 화면 숨기기
    slotGoalScreen.classList.add('hidden');
    slotScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('bjGoalScreen').classList.add('hidden');
    document.getElementById('blackjackScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    
    // 게임 상태 초기화
    slotState.playerChips = 1000;
    slotState.currentBet = 20;
    slotState.goalChips = goalChips;
    slotState.isSpinning = false;
    slotState.reels = [0, 0, 0];
    
    // 목표 표시
    if (goalChips === 0) {
        slotGoalAmountEl.textContent = '무제한';
        slotGoalDisplayEl.style.background = 'rgba(155, 89, 182, 0.3)';
    } else {
        slotGoalAmountEl.textContent = goalChips.toLocaleString();
        slotGoalDisplayEl.style.background = 'rgba(255, 215, 0, 0.3)';
    }
    
    // 초기 심볼 설정
    slotState.reels = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];
    
    updateSlotDisplay();
    showSlotMessage('베팅 금액을 선택하고 스핀 버튼을 누르세요!');
}

// 랜덤 심볼 선택
function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbolPool.length);
    return symbolPool[randomIndex];
}

// 스핀
function spin() {
    if (slotState.isSpinning) return;
    
    // 베팅 가능 확인
    if (slotState.playerChips < slotState.currentBet) {
        showSlotMessage('칩이 부족합니다!');
        return;
    }
    
    // 베팅 차감
    slotState.playerChips -= slotState.currentBet;
    slotState.isSpinning = true;
    spinBtn.disabled = true;
    
    updateSlotDisplay();
    showSlotMessage('스핀 중...');
    
    // 릴에 스피닝 클래스 추가
    reels.forEach(reel => reel.classList.add('spinning'));
    
    // 랜덤 심볼 생성
    const newReels = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];
    
    // 각 릴을 다른 시간에 멈춤
    setTimeout(() => stopReel(0, newReels[0]), 1000);
    setTimeout(() => stopReel(1, newReels[1]), 1500);
    setTimeout(() => stopReel(2, newReels[2]), 2000);
    
    // 결과 확인
    setTimeout(() => {
        checkResult(newReels);
    }, 2500);
}

// 릴 정지
function stopReel(index, symbolIndex) {
    slotState.reels[index] = symbolIndex;
    const reel = reels[index];
    const symbol = reel.querySelector('.symbol');
    
    reel.classList.remove('spinning');
    symbol.textContent = symbols[symbolIndex].icon;
}

// 결과 확인
function checkResult(resultReels) {
    slotState.isSpinning = false;
    spinBtn.disabled = false;
    
    // 3개 일치 확인
    if (resultReels[0] === resultReels[1] && resultReels[1] === resultReels[2]) {
        // 승리!
        const symbol = symbols[resultReels[0]];
        const winAmount = slotState.currentBet * symbol.payout;
        slotState.playerChips += winAmount;
        
        // 승리 애니메이션
        reels.forEach(reel => reel.classList.add('win'));
        setTimeout(() => {
            reels.forEach(reel => reel.classList.remove('win'));
        }, 1500);
        
        showSlotMessage(`🎉 ${symbol.name} × 3! +${winAmount} 칩 (${symbol.payout}배)`, 'win');
    } else {
        // 패배
        showSlotMessage('아쉽네요! 다시 도전하세요!');
    }
    
    updateSlotDisplay();
    
    // 게임 종료 조건 확인
    setTimeout(() => {
        if (slotState.playerChips <= 0) {
            endSlotGame('패배 💀', '모든 칩을 잃었습니다!');
        } else if (slotState.playerChips < slotState.currentBet) {
            showSlotMessage('⚠️ 칩이 부족합니다! 베팅을 줄이거나 계속 도전하세요.');
        } else if (slotState.goalChips > 0 && slotState.playerChips >= slotState.goalChips) {
            endSlotGame('승리 🎉', `목표 ${slotState.goalChips.toLocaleString()} 칩을 달성했습니다!`);
        }
    }, 2000);
}

// 화면 업데이트
function updateSlotDisplay() {
    slotChipsEl.textContent = slotState.playerChips;
    slotBetAmountEl.textContent = slotState.currentBet;
    
    // 현재 심볼 표시
    slotState.reels.forEach((symbolIndex, i) => {
        const symbol = reels[i].querySelector('.symbol');
        symbol.textContent = symbols[symbolIndex].icon;
    });
}

// 메시지 표시
function showSlotMessage(message, type = 'normal') {
    slotMessageEl.textContent = message;
    
    if (type === 'win') {
        slotMessageEl.style.color = '#2ecc71';
        slotMessageEl.style.fontSize = '2.2rem';
        setTimeout(() => {
            slotMessageEl.style.color = '#ffd700';
            slotMessageEl.style.fontSize = '1.8rem';
        }, 2000);
    } else {
        slotMessageEl.style.color = '#ffd700';
        slotMessageEl.style.fontSize = '1.8rem';
    }
}

// 게임 종료
function endSlotGame(result, message) {
    slotScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    document.getElementById('resultTitle').textContent = result;
    document.getElementById('resultMessage').textContent = message;
}

