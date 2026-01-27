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
        
        // 画像を表示
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

let correctCount = 0; // スコア用

function discardTile(index) {
    // 既に判定済み（ボタンが光っている）なら何もしない
    if (document.getElementById('generate-btn').classList.contains('highlight')) return;

    const baseShanten = getShanten(currentHand);
    const discarded = currentHand[index];
    const newHand = currentHand.filter((_, i) => i !== index);
    const newShanten = getShanten(newHand);
    
    // 視覚演出：クリックした牌を少し浮かせて消す準備
    const tileDivs = document.querySelectorAll('.tile');
    tileDivs[index].classList.add('discarded');

    // 全ての選択肢の受け入れ枚数を計算して比較
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
        // 向聴戻りの場合
        resultDiv.innerHTML = `<span style="color: #ff4444;">× 不正解（向聴戻り）</span>`;
        genBtn.textContent = "もう一度挑戦";
    } else {
        // 正解の場合：スコアを加算
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
