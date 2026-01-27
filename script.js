// (MASTER_PATTERNS, RECIPES, SUITS 等の定義はそのまま)

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
