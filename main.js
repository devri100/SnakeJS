const images = {
    horizontal: document.getElementById("imgHorizontal"),
    vertical: document.getElementById("imgVertical"),
    rightUp: document.getElementById("imgRightUp"),
    leftDown: document.getElementById("imgLeftDown"),
    food: document.getElementById("imgFood"),
}

const blockWidth = 20;
const blockHeight = 20;
const levelWidth = 20;
const levelHeight = 15;
const width = levelWidth * blockWidth;
const height = levelHeight * blockHeight;
const container = document.getElementById("container")
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreSpan = document.getElementById("score");
const msgSpan = document.getElementById("msg");
var score;
var snake;
var headIndex;
var tailIndex;
var oldDirection;
var newDirection;
var gameLooper = null;
var gameOver;
var delay = 100;
var food;

canvas.width = width;
canvas.height = height;
container.style.width = width + "px";
canvas.style.width = "100%";
canvas.style.height = height + "px";

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 32) {
        if (gameLooper == null) {
            if (gameOver) {
                init();
            }
            startGame();
        } else {
            stopGame();
        }
    }

    if (gameLooper !== null) {
        switch (event.keyCode) {
            case 38:
                if (oldDirection.y === 0) {
                    newDirection = {x: 0, y: -1};//up
                }
                break;
            case 40:
                if (oldDirection.y === 0) {
                    newDirection = {x: 0, y: 1};
                }
                break; //down
            case 39:
                if (oldDirection.x === 0) {
                    newDirection = {x: 1, y: 0};
                }
                break; //right
            case 37:
                if (oldDirection.x === 0) {
                    newDirection = {x: -1, y: 0};
                }
                break; //left
        }
    }
});

function clearBlock(x, y) {
    const dx = x * blockWidth;
    const dy = y * blockHeight;
    ctx.clearRect(dx, dy, blockWidth, blockHeight);
}

function drawImage(x, y, image) {
    const dx = x * blockWidth;
    const dy = y * blockHeight;
    ctx.drawImage(image, dx, dy, blockWidth, blockHeight);
}

function startGame() {
    gameLooper = setInterval(move, delay);
    updateMsg()
}

function stopGame() {
    clearInterval(gameLooper);
    gameLooper = null;
    updateMsg()
}

function init() {
    ctx.clearRect(0, 0, width, height);
    gameOver = false;
    score = 0;
    snake = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}];
    headIndex = snake.length - 1;
    tailIndex = 0;
    oldDirection = {x: 1, y: 0};
    newDirection = {x: 1, y: 0};
    for (var i = 0; i < snake.length; i++) {
        var p = snake[i];
        drawImage(p.x, p.y, images.horizontal);
    }
    placeFood();
    updateScore();
}

function move() {
    const tail = snake[tailIndex];
    const head = snake[headIndex];
    const tailX = tail.x;
    const tailY = tail.y;

    tail.x = head.x + newDirection.x;
    tail.y = head.y + newDirection.y;
    headIndex = tailIndex;
    tailIndex = (tailIndex + 1) % snake.length;

    const headX = tail.x;
    const headY = tail.y;

    if (!collision()) {
        if (!eat()) {
            clearBlock(tailX, tailY);
        } else {
            snake.splice(tailIndex, 0, {x: tailX, y: tailY});
            if (tailIndex === 0) {
                headIndex++;
            }
        }

        //Horizontal
        if (Math.abs(oldDirection.x) === 1 && Math.abs(newDirection.x) === 1) {
            clearBlock(head.x, head.y);
            drawImage(head.x, head.y, images.horizontal);
        }

        //Verticl
        else if (Math.abs(oldDirection.y) === 1 && Math.abs(newDirection.y) === 1) {
            clearBlock(head.x, head.y);
            drawImage(head.x, head.y, images.vertical);
        }

        //Left-Down
        else if (oldDirection.x === 1 && newDirection.y === 1 || oldDirection.y === -1 && newDirection.x === -1) {
            clearBlock(head.x, head.y);
            drawImage(head.x, head.y, images.leftDown);
        }

        //Left-Up
        else if (oldDirection.x === 1 && newDirection.y === -1 || oldDirection.y === 1 && newDirection.x === -1) {
            clearBlock(head.x, head.y);
            drawImage(head.x, head.y, images.vertical);
        }

        //Right-Down
        else if (oldDirection.x === -1 && newDirection.y === 1 || oldDirection.y === -1 && newDirection.x === 1) {
            clearBlock(head.x, head.y);
            drawImage(head.x, head.y, images.horizontal);
        }

        //Right-Up
        else if (oldDirection.x === -1 && newDirection.y === -1 || oldDirection.y === 1 && newDirection.x === 1) {
            clearBlock(head.x, head.y);
            drawImage(head.x, head.y, images.rightUp);
        }

        oldDirection = newDirection;

        //Right
        if (newDirection.x === 1) {
            drawImage(headX, headY, images.leftDown);
        }

        //Left
        else if (newDirection.x === -1) {
            drawImage(headX, headY, images.horizontal);
        }

        //Down
        else if (newDirection.y === 1) {
            drawImage(headX, headY, images.vertical);
        }

        //Up
        else if (newDirection.y === -1) {
            drawImage(headX, headY, images.leftDown);
        }
    } else {
        gameOver = true;
        stopGame();
    }
}

function placeFood() {
    do {
        var x = Math.floor(Math.random() * levelWidth);
        var y = Math.floor(Math.random() * levelHeight);

        var right = false;
        for (var i = 0; i < snake.length; i++) {
            const p = snake[i];
            if (x == p.x && y == p.y) {
                right = true;
                break;
            }
        }
    } while (right);

    food = {x, y};
    drawImage(food.x, food.y, images.food);
}

function eat() {
    const head = snake[headIndex];
    if (head.x == food.x && head.y == food.y) {
        score++;
        updateScore();
        placeFood();
        return true;
    }
    return false;
}

function collision() {
    const head = snake[headIndex];

    if (head.x < 0 || head.x >= levelWidth || head.y < 0 || head.y >= levelHeight) {
        return true;
    }

    for (var i = 0; i < snake.length; i++) {
        const p = snake[i];
        if (i !== headIndex && head.x == p.x && head.y == p.y) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    scoreSpan.innerText = score;
}

function updateMsg() {
    msgSpan.innerText = "GAME OVER, press SPACE to restart";

    if (gameLooper) {
        msgSpan.style.display = "none"
    } else {
        msgSpan.style.display = "block"
    }
}

init();


