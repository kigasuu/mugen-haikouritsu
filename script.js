const MASTER_PATTERNS = {
    A: { name: "4連形", offsets: [0, 1, 2, 3] },
    B: { name: "中膨れ", offsets: [0, 1, 1, 2] },
    E: { name: "対子両面", offsets: [0, 0, 1, 2] },
    H: { name: "サンドイッチ", offsets: [0, 0, 2, 2] },
    I: { name: "暗刻くっつき", offsets: [0, 0, 0, 1] },
    G: { name: "雀頭面子", offsets: [0, 1, 2, 0] },
    C: { name: "両面", offsets: [0, 1] },
    D: { name: "カンチャン", offsets: [0, 2] },
    F: { name: "リャンカン", offsets: [0, 2, 4] },
    P: { name: "独立対子", offsets: [0, 0] },
    N: { name: "凹凸", offsets: [0, 0, 1, 2, 2] }
};

const RECIPES = [
    ['A', 'B', 'F', 'F'], ['N', 'H', 'E', 'P'], ['A', 'A', 'A', 'P'], ['I', 'F', 'F', 'F', 'P']
];

const SUITS = ['m', 'p', 's'];
let currentHand = [];
let correctCount = 0; // スコア用

// --- 1. 生成ロジック ---
function generateHand() {
    let hand = [];
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    recipe.forEach(id => {
        const pattern = MASTER_PATTERNS[id];
        const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
        const maxOffset = Math.max(...pattern.offsets);
        const startNum = Math.floor(Math.random() * (9 - maxOffset)) + 1;
        pattern.offsets.forEach(offset => {
            hand.push({ num: startNum + offset, suit: suit });
        });
    });
    hand = hand.slice(0, 14);
    hand.sort((a, b) => (a.suit !== b.suit) ? SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) : a.num - b.num);
    currentHand = hand;
    displayHand(hand);
    
    const genBtn = document.getElementById('generate-btn');
    genBtn.textContent = "新しい問題を生成";
    genBtn.classList.remove('highlight');
    document.getElementById('result').textContent = "牌を選んで切ってください";
}

// --- 2. 表示ロジック ---
function displayHand(hand) {
    const display = document.getElementById('hand-display');
    display.innerHTML = "";
    hand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        const img = document.createElement('img');
        img.src = `img/${tile.num}${tile.suit}.png`;
        img.alt = tile.num + tile.suit;
        img.style.width = "100%";
        img.style.height = "100%";
        tileDiv.appendChild(img);
        tileDiv.onclick = () => discardTile(index);
        display.appendChild(tileDiv);
    });
}

// --- 3. 判定ロジック（重要：ここが抜けていました） ---
function getShanten(hand) {
    const counts = { m: Array(10).fill(0), p: Array(10).fill(0), s: Array(10).fill(0) };
    hand.forEach(t => counts[t.suit][t.num]++);
    let maxMelds = 0;

    function backtrack(m, t) {
        maxMelds = Math.max(maxMelds, m + t / 2);
        for (let s of SUITS) {
            for (let i = 1; i <= 9; i++) {
                if (counts[s][i] >= 3) {
                    counts[s][i] -= 3; backtrack(m + 1, t); counts[s][i] += 3;
                }
                if (i <= 7 && counts[s][i] > 0 && counts[s][i+1] > 0 && counts[s][i+2] > 0) {
                    counts[s][i]--; counts[s][i+1]--; counts[s][i+2]--;
                    backtrack(m + 1, t);
                    counts[s][i]++; counts[s][i+1]++; counts[s][i+2]++;
                }
            }
        }
    }

    for (let s of SUITS) {
        for (let i = 1; i <= 9; i++) {
            if (counts[s][i] >= 2) {
                counts[s][i] -= 2; backtrack(0, 1); counts[s][i] += 2;
            }
        }
    }
    backtrack(0, 0);
    return 8 - (maxMelds * 2);
}

function countUkeire(hand) {
    if (hand.length !== 13) return 0;
    let ukeire = 0;
    for (let s of SUITS) {
        for (let n = 1; n <= 9; n++) {
            const tempHand = [...hand, { num: n, suit: s }];
            if (getShanten(tempHand) < getShanten(hand)) {
                const alreadyHave = hand.filter(t => t.num === n && t.suit === s).length;
                ukeire += (4 - alreadyHave);
            }
        }
    }
    return ukeire;
}

// --- 4. 打牌処理 ---
function discardTile(index) {
    if (document.getElementById('generate-btn').classList.contains('highlight')) return;

    const baseShanten = getShanten(currentHand);
    const discarded = currentHand[index];
    const newHand = currentHand.filter((_, i) => i !== index);
    const newShanten = getShanten(newHand);
    
    const tileDivs = document.querySelectorAll('.tile');
    tileDivs[index].classList.add('discarded');

    let maxUkeire = 0;
    const allOptions = currentHand.map((_, i) => {
        const h = currentHand.filter((__, j) => i !== j);
        const s = getShanten(h);
        const u = (s === baseShanten) ? countUkeire(h) : -1;
        if (u > maxUkeire) maxUkeire = u;
        return u;
    });

    const userUkeire = allOptions[index];
    const resultDiv = document.getElementById('result');
    const genBtn = document.getElementById('generate-btn');

    if (newShanten > baseShanten) {
        resultDiv.innerHTML = `<span style="color: #ff4444;">× 不正解（向聴戻り）</span>`;
        genBtn.textContent = "もう一度挑戦";
    } else {
        correctCount++;
        const scoreDisplay = document.getElementById('correct-score');
        if (scoreDisplay) scoreDisplay.textContent = correctCount;
        
        if (userUkeire < maxUkeire) {
            resultDiv.innerHTML = `<span style="color: #f1c40f;">▲ Good（受入:${userUkeire}枚）</span><br><small>最善手は ${maxUkeire}枚でした</small>`;
        } else {
            resultDiv.innerHTML = `<span style="color: #44ff44;">★ Excellent（受入最大:${userUkeire}枚）</span>`;
        }
        genBtn.textContent = "次の問題へ";
        genBtn.classList.add('highlight');
    }
}

document.getElementById('generate-btn').addEventListener('click', generateHand);
generateHand();
