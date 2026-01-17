// 게임 상태
const gameState = {
    playerChips: 1000,
    aiChips: 1000,
    pot: 0,
    deck: [],
    playerHand: [],
    aiHand: [],
    communityCards: [],
    currentBet: 0,
    playerBet: 0,
    aiBet: 0,
    smallBlind: 10,
    bigBlind: 20,
    gamePhase: 'preflop', // preflop, flop, turn, river, showdown
    isPlayerTurn: true,
    dealerIsPlayer: true
};

// 카드 덱 생성
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// DOM 요소
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const startPokerBtn = document.getElementById('startPokerBtn');
const pokerBackToMenuBtn = document.getElementById('pokerBackToMenuBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const playerChipsEl = document.getElementById('playerChips');
const aiChipsEl = document.getElementById('aiChips');
const potAmountEl = document.getElementById('potAmount');
const playerCardsEl = document.getElementById('playerCards');
const aiCardsEl = document.getElementById('aiCards');
const communityCardsEl = document.getElementById('communityCards');
const gameMessageEl = document.getElementById('gameMessage');
const aiActionEl = document.getElementById('aiAction');

const foldBtn = document.getElementById('foldBtn');
const checkBtn = document.getElementById('checkBtn');
const callBtn = document.getElementById('callBtn');
const raiseBtn = document.getElementById('raiseBtn');
const raiseSlider = document.getElementById('raiseSlider');
const raiseAmountEl = document.getElementById('raiseAmount');

// 이벤트 리스너
startPokerBtn.addEventListener('click', startGame);
pokerBackToMenuBtn.addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});
backToMenuBtn.addEventListener('click', backToMenu);
foldBtn.addEventListener('click', () => playerAction('fold'));
checkBtn.addEventListener('click', () => playerAction('check'));
callBtn.addEventListener('click', () => playerAction('call'));
raiseBtn.addEventListener('click', () => playerAction('raise', parseInt(raiseSlider.value)));
raiseSlider.addEventListener('input', () => {
    raiseAmountEl.textContent = raiseSlider.value;
});

// 덱 생성 및 셔플
function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// 게임 시작
function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // 게임 상태 초기화
    gameState.playerChips = 1000;
    gameState.aiChips = 1000;
    
    updateDisplay();
    startNewRound();
}

// 새 라운드 시작
function startNewRound() {
    // 상태 초기화
    gameState.deck = createDeck();
    gameState.playerHand = [];
    gameState.aiHand = [];
    gameState.communityCards = [];
    gameState.pot = 0;
    gameState.currentBet = gameState.bigBlind;
    gameState.playerBet = 0;
    gameState.aiBet = 0;
    gameState.gamePhase = 'preflop';
    gameState.isPlayerTurn = true;
    
    // 딜러 교대
    gameState.dealerIsPlayer = !gameState.dealerIsPlayer;
    
    // 블라인드
    if (gameState.dealerIsPlayer) {
        // 플레이어가 스몰 블라인드
        gameState.playerBet = gameState.smallBlind;
        gameState.playerChips -= gameState.smallBlind;
        gameState.aiBet = gameState.bigBlind;
        gameState.aiChips -= gameState.bigBlind;
        gameState.isPlayerTurn = true;
    } else {
        // AI가 스몰 블라인드
        gameState.aiBet = gameState.smallBlind;
        gameState.aiChips -= gameState.smallBlind;
        gameState.playerBet = gameState.bigBlind;
        gameState.playerChips -= gameState.bigBlind;
        gameState.isPlayerTurn = false;
    }
    
    gameState.pot = gameState.playerBet + gameState.aiBet;
    gameState.currentBet = gameState.bigBlind;
    
    // 카드 배분
    dealCards();
    
    updateDisplay();
    showMessage('새 라운드 시작! 블라인드: ' + gameState.smallBlind + '/' + gameState.bigBlind);
    
    if (!gameState.isPlayerTurn) {
        setTimeout(aiTurn, 1000);
    }
}

// 카드 배분
function dealCards() {
    gameState.playerHand = [gameState.deck.pop(), gameState.deck.pop()];
    gameState.aiHand = [gameState.deck.pop(), gameState.deck.pop()];
}

// 화면 업데이트
function updateDisplay() {
    playerChipsEl.textContent = gameState.playerChips;
    aiChipsEl.textContent = gameState.aiChips;
    potAmountEl.textContent = gameState.pot;
    
    // 플레이어 카드
    playerCardsEl.innerHTML = '';
    gameState.playerHand.forEach(card => {
        playerCardsEl.appendChild(createCardElement(card));
    });
    
    // AI 카드 (뒷면)
    aiCardsEl.innerHTML = '';
    gameState.aiHand.forEach(() => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card back';
        aiCardsEl.appendChild(cardEl);
    });
    
    // 커뮤니티 카드
    communityCardsEl.innerHTML = '';
    gameState.communityCards.forEach(card => {
        communityCardsEl.appendChild(createCardElement(card));
    });
    
    // 레이즈 슬라이더 업데이트
    const minRaise = gameState.currentBet - gameState.playerBet + gameState.bigBlind;
    const maxRaise = gameState.playerChips;
    raiseSlider.min = Math.min(minRaise, maxRaise);
    raiseSlider.max = maxRaise;
    raiseSlider.value = Math.min(minRaise, maxRaise);
    raiseAmountEl.textContent = raiseSlider.value;
    
    updateButtons();
}

// 카드 요소 생성
function createCardElement(card) {
    const cardEl = document.createElement('div');
    const isRed = card.suit === '♥' || card.suit === '♦';
    cardEl.className = `card ${isRed ? 'red' : 'black'}`;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'card-value';
    valueEl.textContent = card.value;
    
    const suitEl = document.createElement('div');
    suitEl.className = 'card-suit';
    suitEl.textContent = card.suit;
    
    cardEl.appendChild(valueEl);
    cardEl.appendChild(suitEl);
    
    return cardEl;
}

// 버튼 상태 업데이트
function updateButtons() {
    const callAmount = gameState.currentBet - gameState.playerBet;
    
    foldBtn.disabled = !gameState.isPlayerTurn;
    checkBtn.disabled = !gameState.isPlayerTurn || callAmount > 0;
    callBtn.disabled = !gameState.isPlayerTurn || callAmount === 0;
    raiseBtn.disabled = !gameState.isPlayerTurn || gameState.playerChips <= callAmount;
    
    if (callAmount > 0) {
        callBtn.textContent = `콜 (${callAmount})`;
    } else {
        callBtn.textContent = '콜';
    }
}

// 메시지 표시
function showMessage(message) {
    gameMessageEl.textContent = message;
}

// 플레이어 액션
function playerAction(action, amount = 0) {
    if (!gameState.isPlayerTurn) return;
    
    aiActionEl.textContent = '';
    
    switch (action) {
        case 'fold':
            showMessage('당신이 폴드했습니다.');
            endRound('ai');
            return;
            
        case 'check':
            if (gameState.currentBet === gameState.playerBet) {
                showMessage('당신이 체크했습니다.');
                gameState.isPlayerTurn = false;
                updateDisplay();
                setTimeout(aiTurn, 1000);
            }
            break;
            
        case 'call':
            const callAmount = gameState.currentBet - gameState.playerBet;
            if (callAmount > 0 && gameState.playerChips >= callAmount) {
                gameState.playerChips -= callAmount;
                gameState.playerBet += callAmount;
                gameState.pot += callAmount;
                showMessage(`당신이 ${callAmount} 콜했습니다.`);
                gameState.isPlayerTurn = false;
                updateDisplay();
                setTimeout(aiTurn, 1000);
            }
            break;
            
        case 'raise':
            if (amount > 0 && gameState.playerChips >= amount) {
                gameState.playerChips -= amount;
                gameState.playerBet += amount;
                gameState.pot += amount;
                gameState.currentBet = gameState.playerBet;
                showMessage(`당신이 ${amount} 레이즈했습니다.`);
                gameState.isPlayerTurn = false;
                updateDisplay();
                setTimeout(aiTurn, 1000);
            }
            break;
    }
}

// AI 턴
function aiTurn() {
    if (gameState.isPlayerTurn) return;
    
    const callAmount = gameState.currentBet - gameState.aiBet;
    
    // 공격적인 AI 로직
    const handStrength = evaluateHandStrength(gameState.aiHand, gameState.communityCards);
    const random = Math.random();
    const aggressiveness = 0.3; // 공격성 30%
    
    let action = '';
    
    if (callAmount === 0) {
        // 체크 가능한 상황 - 더 자주 레이즈
        if (handStrength > 0.4 && random > 0.4) {
            // 좋은 핸드로 레이즈
            const raiseAmount = Math.min(gameState.bigBlind * 3, gameState.aiChips);
            gameState.aiChips -= raiseAmount;
            gameState.aiBet += raiseAmount;
            gameState.pot += raiseAmount;
            gameState.currentBet = gameState.aiBet;
            action = `AI가 ${raiseAmount} 레이즈했습니다.`;
            aiActionEl.textContent = `레이즈 ${raiseAmount}`;
        } else if (random < aggressiveness) {
            // 블러핑 레이즈 (30% 확률)
            const raiseAmount = Math.min(gameState.bigBlind * 2, gameState.aiChips);
            gameState.aiChips -= raiseAmount;
            gameState.aiBet += raiseAmount;
            gameState.pot += raiseAmount;
            gameState.currentBet = gameState.aiBet;
            action = `AI가 ${raiseAmount} 레이즈했습니다.`;
            aiActionEl.textContent = `레이즈 ${raiseAmount}`;
        } else {
            // 체크
            action = 'AI가 체크했습니다.';
            aiActionEl.textContent = '체크';
        }
    } else {
        // 콜이 필요한 상황 - 도박꾼 AI (거의 항상 콜)
        const callRatio = callAmount / gameState.aiChips;
        
        // 폴드 조건 (극도로 제한적 - 거의 폴드 안함)
        // 올인 당했을 때만 핸드 강도 체크
        if (callRatio >= 0.95 && handStrength < 0.05 && random < 0.3) {
            // 거의 올인 상황 + 극악의 핸드 + 30% 확률로만 폴드
            action = 'AI가 폴드했습니다.';
            aiActionEl.textContent = '폴드';
            showMessage(action);
            setTimeout(() => endRound('player'), 1000);
            return;
        } else if (handStrength > 0.6 && random > 0.5 && gameState.aiChips > callAmount * 2) {
            // 강한 핸드로 레이즈
            const raiseAmount = Math.min(callAmount + gameState.bigBlind * 3, gameState.aiChips);
            gameState.aiChips -= raiseAmount;
            gameState.aiBet += raiseAmount;
            gameState.pot += raiseAmount;
            gameState.currentBet = gameState.aiBet;
            action = `AI가 ${raiseAmount} 레이즈했습니다.`;
            aiActionEl.textContent = `레이즈 ${raiseAmount}`;
        } else if (handStrength > 0.55 && random > 0.4 && callRatio < 0.6) {
            // 준수한 핸드로 공격적인 레이즈 (큰 베팅에도 맞레이즈)
            const raiseAmount = Math.min(callAmount + gameState.bigBlind * 4, gameState.aiChips);
            gameState.aiChips -= raiseAmount;
            gameState.aiBet += raiseAmount;
            gameState.pot += raiseAmount;
            gameState.currentBet = gameState.aiBet;
            action = `AI가 ${raiseAmount} 레이즈했습니다.`;
            aiActionEl.textContent = `레이즈 ${raiseAmount}`;
        } else if (random < 0.15 && callRatio < 0.7) {
            // 15% 확률로 블러핑 올인급 레이즈
            const raiseAmount = Math.min(callAmount + gameState.bigBlind * 5, gameState.aiChips);
            gameState.aiChips -= raiseAmount;
            gameState.aiBet += raiseAmount;
            gameState.pot += raiseAmount;
            gameState.currentBet = gameState.aiBet;
            action = `AI가 ${raiseAmount} 레이즈했습니다.! (블러핑?)`;
            aiActionEl.textContent = `레이즈 ${raiseAmount}`;
        } else {
            // 나머지 모든 경우 무조건 콜 (큰 베팅도 받아줌!)
            const actualCall = Math.min(callAmount, gameState.aiChips);
            gameState.aiChips -= actualCall;
            gameState.aiBet += actualCall;
            gameState.pot += actualCall;
            action = `AI가 ${actualCall} 콜했습니다.`;
            aiActionEl.textContent = `콜 ${actualCall}`;
        }
    }
    
    showMessage(action);
    updateDisplay();
    
    // 다음 단계로
    setTimeout(() => {
        if (gameState.currentBet === gameState.playerBet && gameState.currentBet === gameState.aiBet) {
            nextPhase();
        } else {
            gameState.isPlayerTurn = true;
            updateDisplay();
        }
    }, 1000);
}

// 다음 페이즈로
function nextPhase() {
    gameState.playerBet = 0;
    gameState.aiBet = 0;
    gameState.currentBet = 0;
    aiActionEl.textContent = '';
    
    switch (gameState.gamePhase) {
        case 'preflop':
            // 플랍
            gameState.gamePhase = 'flop';
            gameState.communityCards.push(
                gameState.deck.pop(),
                gameState.deck.pop(),
                gameState.deck.pop()
            );
            showMessage('플랍!');
            break;
            
        case 'flop':
            // 턴
            gameState.gamePhase = 'turn';
            gameState.communityCards.push(gameState.deck.pop());
            showMessage('턴!');
            break;
            
        case 'turn':
            // 리버
            gameState.gamePhase = 'river';
            gameState.communityCards.push(gameState.deck.pop());
            showMessage('리버!');
            break;
            
        case 'river':
            // 쇼다운
            gameState.gamePhase = 'showdown';
            showdown();
            return;
    }
    
    updateDisplay();
    
    // 딜러의 왼쪽(빅 블라인드)이 먼저
    gameState.isPlayerTurn = !gameState.dealerIsPlayer;
    
    if (!gameState.isPlayerTurn) {
        setTimeout(aiTurn, 1500);
    } else {
        updateDisplay();
    }
}

// 쇼다운
function showdown() {
    // AI 카드 공개
    aiCardsEl.innerHTML = '';
    gameState.aiHand.forEach(card => {
        aiCardsEl.appendChild(createCardElement(card));
    });
    
    const playerHandRank = evaluateHand(gameState.playerHand, gameState.communityCards);
    const aiHandRank = evaluateHand(gameState.aiHand, gameState.communityCards);
    
    let winner = '';
    if (playerHandRank.rank > aiHandRank.rank) {
        winner = 'player';
    } else if (playerHandRank.rank < aiHandRank.rank) {
        winner = 'ai';
    } else {
        // 같은 랭크, 키커 비교
        winner = compareKickers(playerHandRank.values, aiHandRank.values);
    }
    
    showMessage(`당신: ${playerHandRank.name} vs AI: ${aiHandRank.name}`);
    
    setTimeout(() => {
        endRound(winner);
    }, 3000);
}

// 키커 비교
function compareKickers(player, ai) {
    for (let i = 0; i < Math.max(player.length, ai.length); i++) {
        if (player[i] > ai[i]) return 'player';
        if (player[i] < ai[i]) return 'ai';
    }
    return 'draw';
}

// 라운드 종료
function endRound(winner) {
    if (winner === 'player') {
        gameState.playerChips += gameState.pot;
        showMessage('당신이 이겼습니다! +' + gameState.pot);
    } else if (winner === 'ai') {
        gameState.aiChips += gameState.pot;
        showMessage('AI가 이겼습니다. -' + gameState.pot);
    } else {
        const split = Math.floor(gameState.pot / 2);
        gameState.playerChips += split;
        gameState.aiChips += split;
        showMessage('무승부! 팟을 나눕니다.');
    }
    
    updateDisplay();
    
    // 승리/패배 확인
    setTimeout(() => {
        if (gameState.playerChips <= 0) {
            endGame('패배', '모든 칩을 잃었습니다!');
        } else if (gameState.aiChips <= 0) {
            endGame('승리', '상대의 모든 칩을 획득했습니다!');
        } else {
            // 다음 라운드
            setTimeout(startNewRound, 2000);
        }
    }, 2000);
}

// 게임 종료
function endGame(result, message) {
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    document.getElementById('resultTitle').textContent = result;
    document.getElementById('resultMessage').textContent = message;
}

// 메뉴로 돌아가기
function backToMenu() {
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// 핸드 평가 (간단한 버전)
function evaluateHand(hand, community) {
    const allCards = [...hand, ...community];
    const values = allCards.map(c => getCardValue(c.value));
    const suits = allCards.map(c => c.suit);
    
    const valueCounts = {};
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const uniqueValues = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);
    
    const isFlush = suits.some(suit => suits.filter(s => s === suit).length >= 5);
    const isStraight = checkStraight(uniqueValues);
    
    // 핸드 랭킹
    if (isFlush && isStraight) {
        return { rank: 8, name: '스트레이트 플러시', values: uniqueValues.slice(0, 5) };
    }
    if (counts[0] === 4) {
        return { rank: 7, name: '포카드', values: uniqueValues.slice(0, 5) };
    }
    if (counts[0] === 3 && counts[1] >= 2) {
        return { rank: 6, name: '풀하우스', values: uniqueValues.slice(0, 5) };
    }
    if (isFlush) {
        return { rank: 5, name: '플러시', values: uniqueValues.slice(0, 5) };
    }
    if (isStraight) {
        return { rank: 4, name: '스트레이트', values: uniqueValues.slice(0, 5) };
    }
    if (counts[0] === 3) {
        return { rank: 3, name: '트리플', values: uniqueValues.slice(0, 5) };
    }
    if (counts[0] === 2 && counts[1] === 2) {
        return { rank: 2, name: '투페어', values: uniqueValues.slice(0, 5) };
    }
    if (counts[0] === 2) {
        return { rank: 1, name: '원페어', values: uniqueValues.slice(0, 5) };
    }
    
    return { rank: 0, name: '하이카드', values: uniqueValues.slice(0, 5) };
}

// 핸드 강도 평가 (AI용, 0-1)
function evaluateHandStrength(hand, community) {
    const result = evaluateHand(hand, community);
    return result.rank / 8 + Math.random() * 0.1;
}

// 카드 값 변환
function getCardValue(value) {
    const map = { 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return map[value] || parseInt(value);
}

// 스트레이트 체크
function checkStraight(values) {
    for (let i = 0; i < values.length - 4; i++) {
        let isStraight = true;
        for (let j = 0; j < 4; j++) {
            if (values[i + j] - values[i + j + 1] !== 1) {
                isStraight = false;
                break;
            }
        }
        if (isStraight) return true;
    }
    
    // A-2-3-4-5 스트레이트 (휠)
    if (values.includes(14) && values.includes(2) && values.includes(3) && 
        values.includes(4) && values.includes(5)) {
        return true;
    }
    
    return false;
}

