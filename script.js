// 1. パーツ定義（以前決めたA〜Pのフルリスト）
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

// 2. 14枚になるレシピ（組み合わせパターン）
const RECIPES = [
    ['A', 'B', 'F', 'F'],       // 4+4+3+3 = 14
    ['N', 'H', 'E', 'P'],       // 5+4+4+1(Pを1枚使用などで調整予定、一旦2枚で計算)
    ['A', 'A', 'A', 'P'],       // 4+4+4+2 = 14
    ['I', 'F', 'F', 'F', 'P']   // 4+3+3+3+1(調整用)
];

const SUITS = ['m', 'p', 's']; // 萬子, 筒子, 索子

function generateHand() {
    let hand = [];
    // レシピをランダムに1つ選択
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    
    recipe.forEach(id => {
        const pattern = MASTER_PATTERNS[id];
        const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
        // 1〜9に収まる基準数字を決定（offsetの最大値を考慮）
        const maxOffset = Math.max(...pattern.offsets);
        const startNum = Math.floor(Math.random() * (9 - maxOffset)) + 1;
        
        pattern.offsets.forEach(offset => {
            hand.push({ num: startNum + offset, suit: suit });
        });
    });

    // 14枚になるように調整（多い場合は削り、少ない場合は足す ※簡易実装）
    hand = hand.slice(0, 14);

    // 理牌（ソート）：萬子→筒子→索子の順、数字の順
    hand.sort((a, b) => {
        if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        return a.num - b.num;
    });

    displayHand(hand);
}

function displayHand(hand) {
    const display = document.getElementById('hand-display');
    display.innerHTML = ""; // クリア
    
    hand.forEach(tile => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        // 萬子などは色を変えると見やすい
        if (tile.suit === 'm') tileDiv.style.color = 'red';
        if (tile.suit === 'p') tileDiv.style.color = 'blue';
        if (tile.suit === 's') tileDiv.style.color = 'green';
        
        tileDiv.textContent = tile.num + tile.suit;
        display.innerHTML += tileDiv.outerHTML;
    });
}

document.getElementById('generate-btn').addEventListener('click', generateHand);
