const MASTER_PATTERNS = {
    P2_1: [0, 2], P2_2: [0, 0], P2_3: [0, 1],
    P3_1: [0, 2, 4], P3_2: [0, 1, 1], P3_3: [0, 2, 2], P3_4: [0, 0, 1], P3_5: [0, 0, 2],
    P4_1: [0, 1, 2, 3], P4_2: [0, 1, 1, 2], P4_3: [0, 0, 1, 2], P4_4: [0, 0, 2, 2],
    P4_5: [0, 0, 0, 1], P4_6: [0, 2, 5, 7], P4_7: [0, 1, 3, 4], P4_8: [0, 0, 1, 1], P4_9: [0, 0, 3, 3],
    P5_1: [0, 0, 1, 2, 2], P5_2: [0, 1, 3, 4, 6]
};

const STRONG_PATTERNS = { P2_S: [0, 1], P3_S1: [0, 1, 2], P3_S2: [0, 0, 0] };
const SUITS = ['m', 'p', 's'];
let currentHand = [];
let correctCount = 0;
let totalCount = 0;

function generateHand() {
    let hand = [];
    let shanten = -1;
    while (shanten !== 1) {
        hand = [];
        const allCombos = [[8, 3, 3], [7, 4, 3], [6, 5, 3], [6, 4, 4], [5, 5, 4], [11, 3, 0], [10, 4, 0], [9, 5, 0], [8, 6, 0], [7, 7, 0], [14, 0, 0]];
        let combo = allCombos[Math.floor(Math.random() * allCombos.length)];
        const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5);

        combo.forEach((totalSize, sIdx) => {
            if (totalSize === 0) return;
            const suit = shuffledSuits[sIdx];
            let currentSize = 0;
            let partsInSuit = 0;
            while (currentSize < totalSize) {
                const remaining = totalSize - currentSize;
                const possibleSizes = [2, 3, 4, 5].filter(v => v <= remaining && (remaining - v !== 1));
                const size = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];
                let pattern;
                if (totalSize > size && partsInSuit > 0 && Math.random() < 0.4) {
                    const keys = Object.keys(STRONG_PATTERNS).filter(k => k.startsWith(`P${size}`));
                    if (keys.length > 0) pattern = STRONG_PATTERNS[keys[Math.floor(Math.random() * keys.length)]];
                }
                if (!pattern) {
                    const keys = Object.keys(MASTER_PATTERNS).filter(k => k.startsWith(`P${size}`));
                    pattern = MASTER_PATTERNS[keys[Math.floor(Math.random() * keys.length)]];
                }
                const n = Math.floor(Math.random() * (9 - Math.max(...pattern))) + 1;
                pattern.forEach(off => hand.push({ num: n + off, suit: suit }));
                currentSize += size;
                partsInSuit++;
            }
        });
        const counts = {};
        let overLimit = false;
        hand.forEach(t => {
            const id = t.num + t.suit;
            counts[id] = (counts[id] || 0) + 1;
            if (counts[id] > 4) overLimit = true;
        });
        if (!overLimit) shanten = getShanten(hand);
    }
    hand.sort((a, b) => (a.suit !== b.suit) ? SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) : a.num - b.num);
    currentHand = hand;
    displayHand(hand);
    document.getElementById('analysis-area').innerHTML = "";
    document.getElementById('result').textContent = "牌を選んで切ってください";
    const genBtn = document.getElementById('generate-btn');
    genBtn.classList.remove('highlight');
    genBtn.textContent = "問題を生成";
}

function getShanten(hand) {
    const counts = { m: Array(10).fill(0), p: Array(10).fill(0), s: Array(10).fill(0) };
    hand.forEach(t => counts[t.suit][t.num]++);
    let maxMelds = 0;
    function backtrack(m, t) {
        maxMelds = Math.max(maxMelds, m + t / 2);
        for (let s of SUITS) {
            for (let i = 1; i <= 9; i++) {
                if (counts[s][i] >= 3) { counts[s][i] -= 3; backtrack(m + 1, t); counts[s][i] += 3; }
                if (i <= 7 && counts[s][i] > 0 && counts[s][i + 1] > 0 && counts[s][i + 2] > 0) {
                    counts[s][i]--; counts[s][i + 1]--; counts[s][i + 2]--;
                    backtrack(m + 1, t);
                    counts[s][i]++; counts[s][i + 1]++; counts[s][i + 2]++;
                }
            }
        }
    }
    for (let s of SUITS) { for (let i = 1; i <= 9; i++) { if (counts[s][i] >= 2) { counts[s][i] -= 2; backtrack(0, 1); counts[s][i] += 2; } } }
    backtrack(0, 0);
    return 8 - (maxMelds * 2);
}

function getUkeireDetails(hand) {
    let tiles = [];
    let totalCount = 0;
    const currentShanten = getShanten(hand);
    for (let s of SUITS) {
        for (let n = 1; n <= 9; n++) {
            const tempHand = [...hand, { num: n, suit: s }];
            if (getShanten(tempHand) < currentShanten) {
                const alreadyHave = hand.filter(t => t.num === n && t.suit === s).length;
                if (4 - alreadyHave > 0) {
                    tiles.push({ num: n, suit: s, count: 4 - alreadyHave });
                    totalCount += (4 - alreadyHave);
                }
            }
        }
    }
    return { tiles, totalCount };
}

function discardTile(index) {
    if (document.getElementById('generate-btn').classList.contains('highlight')) return;
    totalCount++;
    document.getElementById('total-count').textContent = totalCount;

    const baseShanten = getShanten(currentHand);
    const userDiscard = currentHand[index];

    // 全ての打牌パターンを計算
    const allAnalysis = currentHand.map((tile, i) => {
        const nextHand = currentHand.filter((_, j) => i !== j);
        const nextShanten = getShanten(nextHand);
        const ukeire = (nextShanten === baseShanten) ? getUkeireDetails(nextHand) : null;
        return { tile, nextShanten, ukeire };
    });

    // 牌の種類ごとに集約（同じ牌なら結果は同じなので1つにまとめる）
    const uniqueAnalysis = [];
    const seenTiles = new Set();

    allAnalysis.forEach(d => {
        const tileId = `${d.tile.num}${d.tile.suit}`;
        if (!seenTiles.has(tileId)) {
            uniqueAnalysis.push(d);
            seenTiles.add(tileId);
        }
    });

    const maxUkeire = Math.max(...uniqueAnalysis.map(d => d.ukeire ? d.ukeire.totalCount : 0));
    const userData = allAnalysis[index];
    const resultDiv = document.getElementById('result');

    // 結果表示（上部のメッセージエリア）
    if (userData.nextShanten > baseShanten) {
        resultDiv.innerHTML = `<span style="color: #ff4444;">× 向聴戻り</span>`;
    } else {
        const isBest = userData.ukeire.totalCount === maxUkeire;
        if (isBest) correctCount++;
        document.getElementById('correct-score').textContent = correctCount;

        let st = isBest ? `<span style="color: #44ff44;">★ Excellent!</span>` : `<span style="color: #f1c40f;">▲ Good</span>`;
        st += ` 打:<img src="img/${userDiscard.num}${userDiscard.suit}.png" style="height:45px; vertical-align:middle; margin:0 10px;"> `;
        st += `(${userData.ukeire.totalCount}枚) 有効牌: `;
        st += userData.ukeire.tiles.map(t => `<img src="img/${t.num}${t.suit}.png" style="height:35px; vertical-align:middle; margin: 2px;">`).join('');
        resultDiv.innerHTML = st;
    }

    // 解析テーブルの生成（重複カット版）
    let tableHtml = `<h3>打牌解析一覧</h3><table class="analysis-table"><tr><th>打牌</th><th>状態</th><th>受入</th><th>有効牌</th></tr>`;

    uniqueAnalysis.forEach(d => {
        const isBest = d.ukeire && d.ukeire.totalCount === maxUkeire;
        tableHtml += `<tr style="${isBest ? 'background: rgba(68,255,68,0.2); font-weight:bold;' : ''}">
            <td><img src="img/${d.tile.num}${d.tile.suit}.png" style="height:60px;"></td> <td>${d.nextShanten > baseShanten ? '<span style="color:red">向聴戻り</span>' : '維持'}</td>
            <td>${d.ukeire ? d.ukeire.totalCount + '枚' : "-"}</td>
            <td class="ukeire-tiles-cell"> ${d.ukeire ? d.ukeire.tiles.map(t => `<img src="img/${t.num}${t.suit}.png" class="ukeire-tile-img">`).join('') : "-"}
            </td></tr>`;
    });

    document.getElementById('analysis-area').innerHTML = tableHtml + `</table>`;
    document.querySelectorAll('.tile')[index].classList.add('discarded');

    const genBtn = document.getElementById('generate-btn');
    genBtn.classList.add('highlight');
    genBtn.textContent = "次の問題へ";
}

function displayHand(hand) {
    const display = document.getElementById('hand-display');
    display.innerHTML = "";
    hand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        tileDiv.innerHTML = `<img src="img/${tile.num}${tile.suit}.png" style="width:100%;">`;
        tileDiv.onclick = () => discardTile(index);
        display.appendChild(tileDiv);
    });
}

document.getElementById('generate-btn').addEventListener('click', generateHand);
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('theme-green');
    document.body.classList.toggle('theme-blue');
});
generateHand();