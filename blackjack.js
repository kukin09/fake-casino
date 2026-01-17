// 블랙잭 게임 상태
const blackjackState = {
    playerChips: 1000,
    currentBet: 0,
    deck: [],
    playerHand: [],
    dealerHand: [],
    gamePhase: 'betting', // betting, playing, dealer, result
    canDouble: false,
    goalChips: 0 // 0 = 무제한, 그 외 = 목표 칩
};

// DOM 요소
const bjGoalScreen = document.getElementById('bjGoalScreen');
const blackjackScreen = document.getElementById('blackjackScreen');
const startBlackjackBtn = document.getElementById('startBlackjackBtn');
const bjGoalBackBtn = document.getElementById('bjGoalBackBtn');
const bjBackToMenuBtn = document.getElementById('bjBackToMenuBtn');
const goalButtons = document.querySelectorAll('.bj-goal-btn');

const bjPlayerChipsEl = document.getElementById('bjPlayerChips');
const bjBetAmountEl = document.getElementById('bjBetAmount');
const bjGoalAmountEl = document.getElementById('bjGoalAmount');
const bjGoalDisplayEl = document.getElementById('bjGoalDisplay');
const dealerCardsEl = document.getElementById('dealerCards');
const bjPlayerCardsEl = document.getElementById('bjPlayerCards');
const dealerScoreEl = document.getElementById('dealerScore');
const playerScoreEl = document.getElementById('playerScore');
const bjGameMessageEl = document.getElementById('bjGameMessage');

const bjBettingPhase = document.getElementById('bjBettingPhase');
const bjGamePhase = document.getElementById('bjGamePhase');
const bjResultPhase = document.getElementById('bjResultPhase');

const betChipBtns = document.querySelectorAll('.bet-chip-btn');
const bjDealBtn = document.getElementById('bjDealBtn');
const bjHitBtn = document.getElementById('bjHitBtn');
const bjStandBtn = document.getElementById('bjStandBtn');
const bjDoubleBtn = document.getElementById('bjDoubleBtn');
const bjNewRoundBtn = document.getElementById('bjNewRoundBtn');

// 이벤트 리스너
startBlackjackBtn.addEventListener('click', showGoalSelection);

bjGoalBackBtn.addEventListener('click', () => {
    // 모든 화면 숨기기
    bjGoalScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('blackjackScreen').classList.add('hidden');
    document.getElementById('slotGoalScreen').classList.add('hidden');
    document.getElementById('slotScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
});

bjBackToMenuBtn.addEventListener('click', () => {
    // 모든 화면 숨기기
    blackjackScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('bjGoalScreen').classList.add('hidden');
    document.getElementById('slotGoalScreen').classList.add('hidden');
    document.getElementById('slotScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
});

goalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // 이벤트 전파 방지
        const goal = parseInt(btn.dataset.goal);
        startBlackjack(goal);
    });
});

betChipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount);
        if (blackjackState.playerChips >= amount) {
            // 이전 선택 제거
            betChipBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            blackjackState.currentBet = amount;
            bjBetAmountEl.textContent = amount;
        } else {
            showBJMessage('칩이 부족합니다!');
        }
    });
});

bjDealBtn.addEventListener('click', dealCards);
bjHitBtn.addEventListener('click', playerHit);
bjStandBtn.addEventListener('click', playerStand);
bjDoubleBtn.addEventListener('click', playerDouble);
bjNewRoundBtn.addEventListener('click', startNewRound);

// 블랙잭 덱 생성
function createBlackjackDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    // 6덱 사용 (카지노처럼)
    for (let d = 0; d < 6; d++) {
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ value, suit });
            }
        }
    }
    
    return shuffleBJDeck(deck);
}

function shuffleBJDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// 승리 조건 선택 화면
function showGoalSelection() {
    // 모든 화면 숨기기
    startScreen.classList.add('hidden');
    bjGoalScreen.classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('blackjackScreen').classList.add('hidden');
    document.getElementById('slotGoalScreen').classList.add('hidden');
    document.getElementById('slotScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
}

// 블랙잭 시작
function startBlackjack(goalChips = 0) {
    // 모든 화면 숨기기
    bjGoalScreen.classList.add('hidden');
    blackjackScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('slotGoalScreen').classList.add('hidden');
    document.getElementById('slotScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    
    // 게임 상태 초기화
    blackjackState.playerChips = 1000;
    blackjackState.currentBet = 0;
    blackjackState.deck = createBlackjackDeck();
    blackjackState.gamePhase = 'betting';
    blackjackState.goalChips = goalChips;
    
    // 목표 표시
    if (goalChips === 0) {
        bjGoalAmountEl.textContent = '무제한';
        bjGoalDisplayEl.style.background = 'rgba(155, 89, 182, 0.3)';
    } else {
        bjGoalAmountEl.textContent = goalChips.toLocaleString();
        bjGoalDisplayEl.style.background = 'rgba(255, 215, 0, 0.3)';
    }
    
    updateBJDisplay();
    showBJMessage('베팅 금액을 선택하고 딜 버튼을 누르세요!');
}

// 새 라운드 시작
function startNewRound() {
    // 패배 체크
    if (blackjackState.playerChips <= 0) {
        endBlackjackGame('패배 💀', '모든 칩을 잃었습니다!');
        return;
    }
    
    // 승리 체크 (무제한 모드가 아닐 때만)
    if (blackjackState.goalChips > 0 && blackjackState.playerChips >= blackjackState.goalChips) {
        endBlackjackGame('승리 🎉', `목표 ${blackjackState.goalChips.toLocaleString()} 칩을 달성했습니다!`);
        return;
    }
    
    blackjackState.currentBet = 0;
    blackjackState.playerHand = [];
    blackjackState.dealerHand = [];
    blackjackState.gamePhase = 'betting';
    blackjackState.canDouble = false;
    
    // 덱이 부족하면 새로 섞기
    if (blackjackState.deck.length < 20) {
        blackjackState.deck = createBlackjackDeck();
    }
    
    // 선택 초기화
    betChipBtns.forEach(b => b.classList.remove('selected'));
    
    showPhase('betting');
    updateBJDisplay();
    showBJMessage('베팅 금액을 선택하고 딜 버튼을 누르세요!');
}

// 카드 배분
function dealCards() {
    if (blackjackState.currentBet <= 0) {
        showBJMessage('베팅 금액을 선택하세요!');
        return;
    }
    
    if (blackjackState.currentBet > blackjackState.playerChips) {
        showBJMessage('칩이 부족합니다!');
        return;
    }
    
    // 베팅 차감
    blackjackState.playerChips -= blackjackState.currentBet;
    blackjackState.gamePhase = 'playing';
    
    // 카드 배분 (플레이어, 딜러, 플레이어, 딜러)
    blackjackState.playerHand = [];
    blackjackState.dealerHand = [];
    
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    
    // 더블다운 가능 여부
    blackjackState.canDouble = true;
    
    showPhase('playing');
    updateBJDisplay();
    
    const playerScore = calculateScore(blackjackState.playerHand);
    const dealerScore = calculateScore([blackjackState.dealerHand[0]]);
    
    // 블랙잭 체크
    if (playerScore === 21) {
        if (calculateScore(blackjackState.dealerHand) === 21) {
            // 둘 다 블랙잭
            showBJMessage('둘 다 블랙잭! 무승부!');
            setTimeout(() => resolveRound('push'), 1500);
        } else {
            // 플레이어 블랙잭
            showBJMessage('블랙잭! 🎉 (1.5배 지급)');
            setTimeout(() => resolveRound('blackjack'), 1500);
        }
    } else {
        showBJMessage(`딜러는 ${dealerScore}를 보여주고 있습니다.`);
    }
}

// 히트
function playerHit() {
    blackjackState.canDouble = false;
    blackjackState.playerHand.push(blackjackState.deck.pop());
    updateBJDisplay();
    
    const score = calculateScore(blackjackState.playerHand);
    
    if (score > 21) {
        showBJMessage(`버스트! (${score}) 패배했습니다!`);
        setTimeout(() => resolveRound('bust'), 1500);
    } else if (score === 21) {
        showBJMessage('21! 자동으로 스탠드합니다.');
        setTimeout(playerStand, 1000);
    } else {
        showBJMessage(`현재 점수: ${score}`);
    }
}

// 스탠드
function playerStand() {
    blackjackState.gamePhase = 'dealer';
    showBJMessage('딜러 차례...');
    
    setTimeout(() => {
        dealerPlay();
    }, 1000);
}

// 더블 다운
function playerDouble() {
    if (!blackjackState.canDouble) return;
    
    if (blackjackState.playerChips < blackjackState.currentBet) {
        showBJMessage('칩이 부족합니다!');
        return;
    }
    
    blackjackState.playerChips -= blackjackState.currentBet;
    blackjackState.currentBet *= 2;
    blackjackState.canDouble = false;
    
    updateBJDisplay();
    
    // 카드 한 장만 받고 자동 스탠드
    blackjackState.playerHand.push(blackjackState.deck.pop());
    updateBJDisplay();
    
    const score = calculateScore(blackjackState.playerHand);
    
    if (score > 21) {
        showBJMessage(`더블 다운! 버스트! (${score})`);
        setTimeout(() => resolveRound('bust'), 1500);
    } else {
        showBJMessage(`더블 다운! 점수: ${score}`);
        setTimeout(playerStand, 1500);
    }
}

// 딜러 플레이
function dealerPlay() {
    updateBJDisplay(); // 딜러 카드 모두 공개
    
    const dealerScore = calculateScore(blackjackState.dealerHand);
    showBJMessage(`딜러 점수: ${dealerScore}`);
    
    // 딜러는 17 이상이면 스탠드
    if (dealerScore >= 17) {
        setTimeout(() => determineWinner(), 1500);
        return;
    }
    
    // 딜러 히트
    setTimeout(() => {
        blackjackState.dealerHand.push(blackjackState.deck.pop());
        updateBJDisplay();
        
        const newScore = calculateScore(blackjackState.dealerHand);
        
        if (newScore > 21) {
            showBJMessage(`딜러 버스트! (${newScore}) 승리!`);
            setTimeout(() => resolveRound('dealerBust'), 1500);
        } else {
            showBJMessage(`딜러가 히트했습니다. 점수: ${newScore}`);
            setTimeout(dealerPlay, 1500);
        }
    }, 1500);
}

// 승자 결정
function determineWinner() {
    const playerScore = calculateScore(blackjackState.playerHand);
    const dealerScore = calculateScore(blackjackState.dealerHand);
    
    if (playerScore > dealerScore) {
        showBJMessage(`${playerScore} vs ${dealerScore} - 승리!`);
        resolveRound('win');
    } else if (playerScore < dealerScore) {
        showBJMessage(`${playerScore} vs ${dealerScore} - 패배!`);
        resolveRound('lose');
    } else {
        showBJMessage(`${playerScore} vs ${dealerScore} - 무승부!`);
        resolveRound('push');
    }
}

// 라운드 결과 처리
function resolveRound(result) {
    blackjackState.gamePhase = 'result';
    
    switch (result) {
        case 'blackjack':
            // 블랙잭은 1.5배
            const bjWin = Math.floor(blackjackState.currentBet * 2.5);
            blackjackState.playerChips += bjWin;
            showBJMessage(`블랙잭! +${bjWin} 칩`);
            break;
            
        case 'win':
        case 'dealerBust':
            // 일반 승리는 2배
            const winAmount = blackjackState.currentBet * 2;
            blackjackState.playerChips += winAmount;
            showBJMessage(`승리! +${winAmount} 칩`);
            break;
            
        case 'push':
            // 무승부는 베팅 반환
            blackjackState.playerChips += blackjackState.currentBet;
            showBJMessage('무승부! 베팅 반환');
            break;
            
        case 'lose':
        case 'bust':
            // 패배는 이미 베팅 차감됨
            showBJMessage(`패배! -${blackjackState.currentBet} 칩`);
            break;
    }
    
    showPhase('result');
    updateBJDisplay();
    
    // 게임 종료 조건 체크
    setTimeout(() => {
        if (blackjackState.playerChips <= 0) {
            endBlackjackGame('패배 💀', '모든 칩을 잃었습니다!');
        } else if (blackjackState.goalChips > 0 && blackjackState.playerChips >= blackjackState.goalChips) {
            endBlackjackGame('승리 🎉', `목표 ${blackjackState.goalChips.toLocaleString()} 칩을 달성했습니다!`);
        }
    }, 2000);
}

// 점수 계산
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // Ace를 1로 계산 (21 초과 시)
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// 화면 업데이트
function updateBJDisplay() {
    bjPlayerChipsEl.textContent = blackjackState.playerChips;
    bjBetAmountEl.textContent = blackjackState.currentBet;
    
    // 플레이어 카드
    bjPlayerCardsEl.innerHTML = '';
    blackjackState.playerHand.forEach(card => {
        bjPlayerCardsEl.appendChild(createCardElement(card));
    });
    
    // 딜러 카드
    dealerCardsEl.innerHTML = '';
    blackjackState.dealerHand.forEach((card, index) => {
        if (blackjackState.gamePhase === 'playing' && index === 1) {
            // 첫 번째 카드 이후는 뒷면으로
            const backCard = document.createElement('div');
            backCard.className = 'card back';
            dealerCardsEl.appendChild(backCard);
        } else {
            dealerCardsEl.appendChild(createCardElement(card));
        }
    });
    
    // 점수 표시
    const playerScore = calculateScore(blackjackState.playerHand);
    playerScoreEl.textContent = playerScore;
    
    if (blackjackState.gamePhase === 'playing') {
        dealerScoreEl.textContent = calculateScore([blackjackState.dealerHand[0]]);
    } else {
        dealerScoreEl.textContent = calculateScore(blackjackState.dealerHand);
    }
    
    // 더블 다운 버튼 상태
    bjDoubleBtn.disabled = !blackjackState.canDouble || 
                           blackjackState.playerChips < blackjackState.currentBet;
}

// 페이즈 표시
function showPhase(phase) {
    bjBettingPhase.classList.add('hidden');
    bjGamePhase.classList.add('hidden');
    bjResultPhase.classList.add('hidden');
    
    switch (phase) {
        case 'betting':
            bjBettingPhase.classList.remove('hidden');
            break;
        case 'playing':
            bjGamePhase.classList.remove('hidden');
            break;
        case 'result':
            bjResultPhase.classList.remove('hidden');
            break;
    }
}

// 메시지 표시
function showBJMessage(message) {
    bjGameMessageEl.textContent = message;
}

// 게임 종료
function endBlackjackGame(result, message) {
    blackjackScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    document.getElementById('resultTitle').textContent = result;
    document.getElementById('resultMessage').textContent = message;
}

