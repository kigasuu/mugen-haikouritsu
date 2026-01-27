// パーツ定義（A〜Pの一部を抜粋して実装開始）
const MASTER_PATTERNS = {
    A: { name: "4連形", offsets: [0, 1, 2, 3] },
    B: { name: "中膨れ", offsets: [0, 1, 1, 2] },
    F: { name: "リャンカン", offsets: [0, 2, 4] },
    C: { name: "両面", offsets: [0, 1] },
    P: { name: "独立対子", offsets: [0, 0] }
};

// 14枚になるレシピ（例：4+4+3+3）
const RECIPES = [
    ['A', 'B', 'F', 'F'], // 4+4+3+3
    ['A', 'A', 'P', 'C', 'C'] // 4+4+2+2+2
];

function generateHand() {
    const display = document.getElementById('hand-display');
    display.innerHTML = "生成中...";
    
    // ここに今後、本格的なランダムロジックを実装していきます
    // 今は動作確認用に「A(4連形)」を1つ出すテストをします
    const testTile = "4m 5m 6m 7m"; 
    display.innerHTML = `<div class="tile">${testTile}</div>`;
}

document.getElementById('generate-btn').addEventListener('click', generateHand);
