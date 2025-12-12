class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 40;
        this.currentPlayer = 'black'; // black先手
        this.gameOver = false;
        this.board = [];
        this.moves = []; // 记录每一步棋，用于悔棋
        this.scores = { black: 0, white: 0 };
        this.hintPosition = null;
        
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        
        this.init();
        this.setupEventListeners();
        this.drawBoard();
    }
    
    init() {
        // 初始化棋盘
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        
        // 设置Canvas尺寸
        const boardSize = this.boardSize * this.cellSize;
        this.canvas.width = boardSize;
        this.canvas.height = boardSize;
        
        // 更新UI
        this.updateGameInfo();
    }
    
    setupEventListeners() {
        // 棋盘点击事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 按钮事件
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize) {
            if (this.board[row][col] === null) {
                this.makeMove(row, col);
            }
        }
    }
    
    makeMove(row, col) {
        // 记录这一步棋
        this.moves.push({ row, col, player: this.currentPlayer });
        
        // 更新棋盘
        this.board[row][col] = this.currentPlayer;
        
        // 绘制棋子
        this.drawPiece(row, col, this.currentPlayer);
        
        // 检查胜负
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.scores[this.currentPlayer]++;
            this.updateGameInfo();
            this.showWinner();
            return;
        }
        
        // 检查平局
        if (this.isBoardFull()) {
            this.gameOver = true;
            document.getElementById('gameStatus').textContent = "平局！棋盘已满";
            document.getElementById('gameStatus').style.color = "#3498db";
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateGameInfo();
        
        // 清除提示
        this.hintPosition = null;
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#deb887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.boardSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.boardSize * this.cellSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.boardSize * this.cellSize, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制天元和星
        this.drawSpecialPoints();
        
        // 重新绘制所有棋子
        this.redrawAllPieces();
        
        // 绘制提示
        if (this.hintPosition) {
            this.drawHint();
        }
    }
    
    drawSpecialPoints() {
        this.ctx.fillStyle = '#000';
        
        // 天元
        const center = Math.floor(this.boardSize / 2);
        this.drawPoint(center, center);
        
        // 四个星位
        const starPositions = [3, 11];
        for (let i of starPositions) {
            for (let j of starPositions) {
                this.drawPoint(i, j);
            }
        }
    }
    
    drawPoint(row, col) {
        this.ctx.beginPath();
        this.ctx.arc(
            col * this.cellSize,
            row * this.cellSize,
            5, 0, Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawPiece(row, col, player) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const radius = this.cellSize * 0.4;
        
        // 绘制棋子阴影
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fill();
        
        // 绘制棋子
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (player === 'black') {
            // 黑棋渐变
            const gradient = this.ctx.createRadialGradient(
                x - 5, y - 5, 5,
                x, y, radius
            );
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            // 白棋渐变
            const gradient = this.ctx.createRadialGradient(
                x - 5, y - 5, 5,
                x, y, radius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();
        
        // 棋子边框
        this.ctx.strokeStyle = player === 'black' ? '#333' : '#999';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    redrawAllPieces() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    this.drawPiece(row, col, this.board[row][col]);
                }
            }
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        if (!player) return false;
        
        // 检查的四个方向: 水平、垂直、左上到右下、右上到左下
        const directions = [
            [0, 1],  // 水平
            [1, 0],  // 垂直
            [1, 1],  // 左上到右下
            [1, -1]  // 右上到左下
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 当前位置已经有一个棋子
            
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize || 
                    this.board[newRow][newCol] !== player) {
                    break;
                }
                count++;
            }
            
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize || 
                    this.board[newRow][newCol] !== player) {
                    break;
                }
                count++;
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    isBoardFull() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    showWinner() {
        const winner = this.currentPlayer === 'black' ? "黑棋" : "白棋";
        document.getElementById('gameStatus').textContent = `${winner}获胜！`;
        document.getElementById('gameStatus').style.color = "#e74c3c";
    }
    
    updateGameInfo() {
        // 更新当前玩家
        const playerName = this.currentPlayer === 'black' ? "黑棋" : "白棋";
        document.getElementById('currentPlayer').innerHTML = `
            <span class="player-icon ${this.currentPlayer}"></span>
            <span>当前回合：${playerName}</span>
        `;
        
        // 更新分数
        document.getElementById('blackScore').textContent = this.scores.black;
        document.getElementById('whiteScore').textContent = this.scores.white;
        
        // 更新游戏状态
        if (!this.gameOver) {
            document.getElementById('gameStatus').textContent = "游戏进行中...";
            document.getElementById('gameStatus').style.color = "#2ecc71";
        }
    }
    
    restartGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moves = [];
        this.hintPosition = null;
        this.drawBoard();
        this.updateGameInfo();
    }
    
    undoMove() {
        if (this.moves.length === 0 || this.gameOver) return;
        
        // 移除最后一步
        const lastMove = this.moves.pop();
        this.board[lastMove.row][lastMove.col] = null;
        
        // 切换回上一个玩家
        this.currentPlayer = lastMove.player;
        
        // 重绘棋盘
        this.drawBoard();
        this.updateGameInfo();
        
        // 如果游戏结束状态，清除它
        if (this.gameOver) {
            this.gameOver = false;
        }
    }
    
    showHint() {
        if (this.gameOver) return;
        
        // 寻找一个空的随机位置作为提示
        const emptyPositions = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    emptyPositions.push({ row, col });
                }
            }
        }
        
        if (emptyPositions.length > 0) {
            // 优先选择棋盘中央附近的空位
            const center = Math.floor(this.boardSize / 2);
            const sortedPositions = emptyPositions.sort((a, b) => {
                const distA = Math.abs(a.row - center) + Math.abs(a.col - center);
                const distB = Math.abs(b.row - center) + Math.abs(b.col - center);
                return distA - distB;
            });
            
            this.hintPosition = sortedPositions[0];
            this.drawBoard(); // 重绘以显示提示
        }
    }
    
    drawHint() {
        const { row, col } = this.hintPosition;
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const radius = this.cellSize * 0.3;
        
        // 绘制闪烁的提示圆圈
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new GomokuGame();
});