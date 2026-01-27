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

function displayHand(hand) {
    const display = document.getElementById('hand-display');
    display.innerHTML = "";
    hand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        
        // --- 変更点：文字の代わりに画像を挿入 ---
        const img = document.createElement('img');
        img.src = `img/${tile.suit}${tile.num}.png`; // 例: img/m1.png
        img.alt = tile.num + tile.suit;
        img.style.width = "100%";
        img.style.height = "100%";
        
        tileDiv.appendChild(img);
        // ------------------------------------

        tileDiv.onclick = () => discardTile(index);
        display.appendChild(tileDiv);
    });
}

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

// 受け入れ枚数を計算する関数
function countUkeire(hand) {
    if (hand.length !== 13) return 0;
    let ukeire = 0;
    const suits = ['m', 'p', 's'];
    for (let s of suits) {
        for (let n = 1; n <= 9; n++) {
            const tempHand = [...hand, { num: n, suit: s }];
            if (getShanten(tempHand) < getShanten(hand)) {
                // 場に出ている枚数（手牌にある枚数）を考慮
                const alreadyHave = hand.filter(t => t.num === n && t.suit === s).length;
                ukeire += (4 - alreadyHave);
            }
        }
    }
    return ukeire;
}

function discardTile(index) {
    if (document.getElementById('generate-btn').classList.contains('highlight')) return;

    const baseShanten = getShanten(currentHand);
    const discarded = currentHand[index];
    const newHand = currentHand.filter((_, i) => i !== index);
    const newShanten = getShanten(newHand);
    
    // 全ての打牌候補の受け入れ枚数を計算
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
        resultDiv.innerHTML = `<span style="color: #ff4444;">× 不正解（向聴戻り）</span><br><small>${discarded.num}${discarded.suit}を切るとシャンテン数が戻ります</small>`;
        genBtn.textContent = "もう一度挑戦";
    } else if (userUkeire < maxUkeire) {
        resultDiv.innerHTML = `<span style="color: #f1c40f;">▲ Good（正解）</span><br><small>受入: ${userUkeire}枚。最善手は ${maxUkeire}枚でした。</small>`;
        genBtn.textContent = "次の問題へ";
        genBtn.classList.add('highlight');
    } else {
        resultDiv.innerHTML = `<span style="color: #44ff44;">★ Excellent（最善手）</span><br><small>受入最大: ${userUkeire}枚</small>`;
        genBtn.textContent = "次の問題へ";
        genBtn.classList.add('highlight');
    }
}

document.getElementById('generate-btn').addEventListener('click', generateHand);
generateHand();
