const canvas = document.getElementById("mazeCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// マスサイズを少し小さくしてスマホでも収まるよう調整
const rows = 20;
const cols = 20;
const cellSize = 25;  // 20x20 -> 500px Canvas
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

type Maze = number[][];

let maze: Maze = [];
let player = { x: 0, y: 0 };
const goal = { x: cols - 1, y: rows - 1 };
let gameOver = false;

// キャラクター画像読み込み
// TypeScript で import
import playerImgSrc from './assets/lv1.png';

const playerImg = new Image();
playerImg.src = playerImgSrc;

function generateMaze(): Maze {
    const m: Maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

    function shuffle<T>(arr: T[]): T[] {
        return arr.sort(() => Math.random() - 0.5);
    }

    function carve(x: number, y: number) {
        visited[y][x] = true;
        m[y][x] = 0;

        const dirs = shuffle([
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ]);

        for (const { dx, dy } of dirs) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[ny][nx]) {
                m[y + dy][x + dx] = 0; // 壁を壊す
                carve(nx, ny);
            }
        }
    }

    carve(0, 0);

    // ゴール周辺は必ず通路
    m[rows - 1][cols - 1] = 0;
    if (cols - 2 >= 0) m[rows - 1][cols - 2] = 0;
    if (rows - 2 >= 0) m[rows - 2][cols - 1] = 0;

    return m;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (x === goal.x && y === goal.y) ctx.fillStyle = "gold";
            else if (maze[y][x] === 1) ctx.fillStyle = "black";
            else ctx.fillStyle = "white";

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // キャラクター描画（マス内に収まるサイズ）
    ctx.drawImage(playerImg, player.x * cellSize + 2, player.y * cellSize + 2, cellSize - 4, cellSize - 4);
}

function movePlayer(dx: number, dy: number) {
    if (gameOver) return;
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
    }
    drawMaze();
    checkGoal();
}

function checkGoal() {
    if (player.x === goal.x && player.y === goal.y) {
        gameOver = true;
        drawMaze();
        // ポップな背景付きゴールメッセージ
        const text = "ゴール！おめでとう！";
        ctx.font = "30px Comic Sans MS";
        const textWidth = ctx.measureText(text).width;
        const x = (canvas.width - textWidth) / 2;
        const y = canvas.height / 2;
        ctx.fillStyle = "yellow";
        ctx.fillRect(x - 10, y - 30, textWidth + 20, 40);
        ctx.fillStyle = "red";
        ctx.fillText(text, x, y);
    }
}

// キー操作
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp": movePlayer(0, -1); break;
        case "ArrowDown": movePlayer(0, 1); break;
        case "ArrowLeft": movePlayer(-1, 0); break;
        case "ArrowRight": movePlayer(1, 0); break;
    }
});

// スタート・リトライ
document.getElementById("startBtn")!.addEventListener("click", () => {
    maze = generateMaze();
    player = { x: 0, y: 0 };
    gameOver = false;
    drawMaze();
});

document.getElementById("retryBtn")!.addEventListener("click", () => {
    maze = generateMaze();
    player = { x: 0, y: 0 };
    gameOver = false;
    drawMaze();
});

// スマホ用十字ボタン
document.querySelectorAll<HTMLButtonElement>(".dirBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        switch (btn.dataset.dir) {
            case "up": movePlayer(0, -1); break;
            case "down": movePlayer(0, 1); break;
            case "left": movePlayer(-1, 0); break;
            case "right": movePlayer(1, 0); break;
        }
    });
});
