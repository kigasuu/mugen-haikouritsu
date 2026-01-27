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
    document.getElementById('result').textContent = "牌を選んで切ってください";
}

function displayHand(hand) {
    const display = document.getElementById('hand-display');
    display.innerHTML = "";
    hand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        if (tile.suit === 'm') tileDiv.style.color = 'red';
        if (tile.suit === 'p') tileDiv.style.color = 'blue';
        if (tile.suit === 's') tileDiv.style.color = 'green';
        tileDiv.textContent = tile.num + tile.suit;
        tileDiv.onclick = () => discardTile(index);
        display.appendChild(tileDiv);
    });
}

// 簡易シャンテン数計算（数牌のみ・1シャンテン問題用）
function getShanten(hand) {
    let count = 0;
    const counts = { m: Array(10).fill(0), p: Array(10).fill(0), s: Array(10).fill(0) };
    hand.forEach(t => counts[t.suit][t.num]++);

    let maxMelds = 0;
    function backtrack(h, m, t) {
        maxMelds = Math.max(maxMelds, m + t / 2);
        for (let s of SUITS) {
            for (let i = 1; i <= 9; i++) {
                if (counts[s][i] >= 3) { // 刻子
                    counts[s][i] -= 3; backtrack(h, m + 1, t); counts[s][i] += 3;
                }
                if (i <= 7 && counts[s][i] > 0 && counts[s][i+1] > 0 && counts[s][i+2] > 0) { // 順子
                    counts[s][i]--; counts[s][i+1]--; counts[s][i+2]--;
                    backtrack(h, m + 1, t);
                    counts[s][i]++; counts[s][i+1]++; counts[s][i+2]++;
                }
            }
        }
    }
    // 雀頭抜き出し
    for (let s of SUITS) {
        for (let i = 1; i <= 9; i++) {
            if (counts[s][i] >= 2) {
                counts[s][i] -= 2; backtrack(hand, 0, 1); counts[s][i] += 2;
            }
        }
    }
    backtrack(hand, 0, 0);
    return 8 - (maxMelds * 2); // 簡易式
}

function discardTile(index) {
    const baseShanten = getShanten(currentHand);
    const newHand = currentHand.filter((_, i) => i !== index);
    const newShanten = getShanten(newHand);

    if (newShanten > baseShanten) {
        document.getElementById('result').textContent = "不正解：向聴数が戻りました";
    } else {
        document.getElementById('result').textContent = "正解！次の問題へどうぞ";
    }
}

document.getElementById('generate-btn').addEventListener('click', generateHand);
generateHand();

function displayHand(hand) {
    const display = document.getElementById('hand-display');
    display.innerHTML = "";
    hand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        if (tile.suit === 'm') tileDiv.style.color = 'red';
        if (tile.suit === 'p') tileDiv.style.color = 'blue';
        if (tile.suit === 's') tileDiv.style.color = 'green';
        tileDiv.textContent = tile.num + tile.suit;
        // クリックイベント
        tileDiv.onclick = () => discardTile(index);
        display.appendChild(tileDiv);
    });
}

function discardTile(index) {
    // 既に判定済みなら何もしない
    if (document.getElementById('generate-btn').classList.contains('highlight')) return;

    const baseShanten = getShanten(currentHand);
    const discarded = currentHand[index];
    const newHand = currentHand.filter((_, i) => i !== index);
    const newShanten = getShanten(newHand);

    const resultDiv = document.getElementById('result');
    const genBtn = document.getElementById('generate-btn');

    if (newShanten > baseShanten) {
        resultDiv.innerHTML = `<span style="color: #ff4444;">× 不正解（向聴戻り）</span><br><small>${discarded.num}${discarded.suit}を切るとシャンテン数が戻ります</small>`;
        genBtn.textContent = "もう一度挑戦";
    } else {
        resultDiv.innerHTML = `<span style="color: #44ff44;">★ 正解！</span><br><small>シャンテン数を維持しました</small>`;
        genBtn.textContent = "次の問題へ";
        genBtn.classList.add('highlight'); // ボタンを強調
    }
}

// (getShanten 関数等はそのまま)
