// Audio
var audio = document.getElementById("myAudio");
function togglePlay() {
  const e = document.getElementById("musicIcon");
  audio.paused ? (audio.play(), e.className = "fas fa-pause") : (audio.pause(), e.className = "fas fa-play");
}

// Modal functions
function toggleModal(e) {
  const t = document.getElementById(e);
  t.style.display = "block" === t.style.display ? "none" : "block";
}

function openGame(e) {
  stopAllGames(), toggleModal("menuModal"), toggleModal(e);
  "pongModal" === e && initPong();
  "snakeModal" === e && initSnake();
  "brickModal" === e && initBrick();
  "modal2048" === e && init2048();
  "memoryModal" === e && initMemory();
  "catchModal" === e && initCatch();
  "dinoModal" === e && initDino();
  "birdModal" === e && initBird();
}

function stopAllGames() {
  pongRunning = snakeRunning = catchRunning = brickRunning = dinoRunning = birdRunning = !1;
  void 0 !== pacRunning && (pacRunning = !1);
  try {
    clearTimeout(snakeTimeout);
    cancelAnimationFrame(pongReq);
    cancelAnimationFrame(catchReq);
    cancelAnimationFrame(brickReq);
    cancelAnimationFrame(dinoReq);
    cancelAnimationFrame(birdReq);
    void 0 !== pacReq && cancelAnimationFrame(pacReq);
  } catch (e) {}
}

// Theme
function toggleTheme() {
  const e = document.body,
    t = document.getElementById("themeIcon");
  e.hasAttribute("data-theme") ? (e.removeAttribute("data-theme"), t.className = "fas fa-moon", localStorage.setItem("theme", "light")) : (e.setAttribute("data-theme", "dark"), t.className = "fas fa-sun", localStorage.setItem("theme", "dark"));
}

// Text scramble
class TextScramble {
  constructor(e) {
    this.el = e;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(e) {
    const t = this.el.innerText,
      n = Math.max(t.length, e.length),
      a = new Promise((e => this.resolve = e));
    this.queue = [];
    for (let a = 0; a < n; a++) {
      const n = t[a] || "",
        l = e[a] || "",
        o = Math.floor(40 * Math.random()),
        i = o + Math.floor(40 * Math.random());
      this.queue.push({
        from: n,
        to: l,
        start: o,
        end: i
      });
    }
    return cancelAnimationFrame(this.frameRequest), this.frame = 0, this.update(), a;
  }
  update() {
    let e = "",
      t = 0;
    for (let n = 0, a = this.queue.length; n < a; n++) {
      let {
        from: a,
        to: l,
        start: o,
        end: i,
        char: s
      } = this.queue[n];
      this.frame >= i ? (t++, e += l) : this.frame >= o ? ((!s || Math.random() < .28) && (s = this.chars[Math.floor(Math.random() * this.chars.length)], this.queue[n].char = s), e += `<span style="color: #666;">${s}</span>`) : e += a;
    }
    this.el.innerHTML = e;
    t === this.queue.length ? this.resolve() : (this.frameRequest = requestAnimationFrame(this.update), this.frame++);
  }
}

const fx = new TextScramble(document.getElementById("scramble-text")),
  runScramble = () => {
    fx.setText("MweheheXcode"), setTimeout(runScramble, 1e4);
  };
runScramble();

// 2048 Game
let board2048 = [];
function init2048() {
  board2048 = Array(16).fill(0), addTile(), addTile(), render2048();
}
function addTile() {
  let e = board2048.map(((e, t) => 0 === e ? t : null)).filter((e => null !== e));
  e.length && (board2048[e[Math.floor(Math.random() * e.length)]] = Math.random() < .9 ? 2 : 4);
}
function render2048() {
  const e = document.getElementById("grid2048");
  e.innerHTML = "";
  board2048.forEach((t => {
    let n = document.createElement("div");
    n.className = "cell-2048", n.innerText = t || "", t >= 1024 && (n.style.fontSize = "0.7rem"), e.appendChild(n);
  }));
}
function move2048(e) {
  let t = !1;
  const n = e => [board2048[4 * e], board2048[4 * e + 1], board2048[4 * e + 2], board2048[4 * e + 3]],
    a = e => [board2048[e], board2048[e + 4], board2048[e + 8], board2048[e + 12]],
    l = (e, n) => {
      for (let a = 0; a < 4; a++) board2048[4 * e + a] !== n[a] && (t = !0), board2048[4 * e + a] = n[a];
    },
    o = (e, n) => {
      for (let a = 0; a < 4; a++) board2048[e + 4 * a] !== n[a] && (t = !0), board2048[e + 4 * a] = n[a];
    },
    i = e => {
      let n = e.filter((e => 0 !== e));
      for (let e = 0; e < n.length - 1; e++) n[e] === n[e + 1] && (n[e] *= 2, n.splice(e + 1, 1), t = !0);
      for (; n.length < 4;) n.push(0);
      return n;
    };
  if ("left" === e)
    for (let e = 0; e < 4; e++) l(e, i(n(e)));
  if ("right" === e)
    for (let e = 0; e < 4; e++) l(e, i(n(e).reverse()).reverse());
  if ("up" === e)
    for (let e = 0; e < 4; e++) o(e, i(a(e)));
  if ("down" === e)
    for (let e = 0; e < 4; e++) o(e, i(a(e).reverse()).reverse());
  t && (addTile(), render2048(), board2048.includes(0) || alert("GAME OVER!"));
}

// Brick Game
const brCanvas = document.getElementById("brickCanvas"),
  brCtx = brCanvas.getContext("2d");
let brickReq, brickRunning = !1,
  ballB = {
    x: 140,
    y: 200,
    dx: 2.5,
    dy: -2.5
  },
  padB = {
    x: 110,
    w: 60
  },
  bricks = [];
const rowCount = 5,
  colCount = 8;
function initBrick() {
  brickRunning = !1, ballB = {
    x: 140,
    y: 200,
    dx: 2.5,
    dy: -2.5
  }, bricks = [];
  for (let e = 0; e < 8; e++) {
    bricks[e] = [];
    for (let t = 0; t < 5; t++) bricks[e][t] = {
      x: 0,
      y: 0,
      s: 1
    };
  }
  drawBr(), document.getElementById("startBrickBtn").style.display = "block";
}
function startBrick() {
  brickRunning = !0, document.getElementById("startBrickBtn").style.display = "none", animateBr();
}
function drawBr() {
  brCtx.clearRect(0, 0, 280, 250), brCtx.fillStyle = "#000", brCtx.beginPath(), brCtx.arc(ballB.x, ballB.y, 4, 0, 7), brCtx.fill(), brCtx.fillRect(padB.x, 235, padB.w, 8);
  for (let e = 0; e < 8; e++)
    for (let t = 0; t < 5; t++)
      if (1 === bricks[e][t].s) {
        let n = 30,
          a = 10,
          l = 4,
          o = e * (n + l) + 5,
          i = t * (a + l) + 30;
        bricks[e][t].x = o, bricks[e][t].y = i, brCtx.fillRect(o, i, n, a);
      }
}
function animateBr() {
  if (brickRunning) {
    ballB.x += ballB.dx, ballB.y += ballB.dy, (ballB.x < 0 || ballB.x > 280) && (ballB.dx *= -1), ballB.y < 0 && (ballB.dy *= -1), ballB.y > 225 && ballB.x > padB.x && ballB.x < padB.x + padB.w && (ballB.dy = -Math.abs(ballB.dy));
    for (let e = 0; e < 8; e++)
      for (let t = 0; t < 5; t++) {
        let n = bricks[e][t];
        1 === n.s && ballB.x > n.x && ballB.x < n.x + 30 && ballB.y > n.y && ballB.y < n.y + 10 && (ballB.dy *= -1, n.s = 0);
      }
    if (ballB.y > 250) return alert("OVER!"), void initBrick();
    if (bricks.every((e => e.every((e => 0 === e.s))))) return alert("WIN!"), void initBrick();
    drawBr(), brickReq = requestAnimationFrame(animateBr);
  }
}
brCanvas.addEventListener("mousemove", (e => {
  let t = brCanvas.getBoundingClientRect();
  padB.x = e.clientX - t.left - padB.w / 2;
}));
brCanvas.addEventListener("touchmove", (e => {
  let t = brCanvas.getBoundingClientRect();
  padB.x = e.touches[0].clientX - t.left - padB.w / 2, e.preventDefault();
}), {
  passive: !1
});

// Pong Game
const pCanvas = document.getElementById("pongCanvas"),
  pCtx = pCanvas.getContext("2d");
let pongReq, pongRunning = !1,
  ballP = {
    x: 140,
    y: 125,
    dx: 2,
    dy: 2
  },
  padP = {
    x: 110,
    w: 60
  },
  aiP = {
    x: 110,
    w: 60
  };
function initPong() {
  pongRunning = !1, ballP = {
    x: 140,
    y: 125,
    dx: 2,
    dy: 2
  }, drawP(), document.getElementById("startPongBtn").style.display = "block";
}
function startPong() {
  pongRunning = !0, document.getElementById("startPongBtn").style.display = "none", animateP();
}
function drawP() {
  pCtx.clearRect(0, 0, 280, 250), pCtx.fillStyle = "#000", pCtx.beginPath(), pCtx.arc(ballP.x, ballP.y, 6, 0, 7), pCtx.fill(), pCtx.fillRect(padP.x, 235, padP.w, 10), pCtx.fillRect(aiP.x, 5, aiP.w, 10);
}
function animateP() {
  if (pongRunning) {
    if (ballP.x += ballP.dx, ballP.y += ballP.dy, (ballP.x < 0 || ballP.x > 280) && (ballP.dx *= -1), aiP.x += .12 * (ballP.x - (aiP.x + 30)), ballP.y <= 15 && ballP.x > aiP.x && ballP.x < aiP.x + aiP.w && (ballP.dy = Math.abs(ballP.dy)), ballP.y >= 225 && ballP.x > padP.x && ballP.x < padP.x + padP.w && (ballP.dy = -Math.abs(ballP.dy)), ballP.y < 0) return alert("WIN!"), void initPong();
    if (ballP.y > 250) return alert("AI WIN!"), void initPong();
    drawP(), pongReq = requestAnimationFrame(animateP);
  }
}
pCanvas.addEventListener("mousemove", (e => {
  let t = pCanvas.getBoundingClientRect();
  padP.x = e.clientX - t.left - padP.w / 2;
}));
pCanvas.addEventListener("touchmove", (e => {
  let t = pCanvas.getBoundingClientRect();
  padP.x = e.touches[0].clientX - t.left - padP.w / 2, e.preventDefault();
}), {
  passive: !1
});

// Snake Game
const sCanvas = document.getElementById("snakeCanvas"),
  sCtx = sCanvas.getContext("2d");
let snakeTimeout, snake = [{
    x: 10,
    y: 8
  }],
  snakeDir = {
    x: 0,
    y: 0
  },
  snakeRunning = !1,
  sFood = {
    x: 15,
    y: 5
  };
function initSnake() {
  snakeRunning = !1, snake = [{
    x: 10,
    y: 8
  }], snakeDir = {
    x: 0,
    y: 0
  }, sFood = {
    x: Math.floor(27 * Math.random()),
    y: Math.floor(17 * Math.random())
  }, drawS(), document.getElementById("startSnakeBtn").style.display = "inline-flex";
}
function startSnake() {
  snakeRunning = !0, snakeDir = {
    x: 1,
    y: 0
  }, document.getElementById("startSnakeBtn").style.display = "none", animateS();
}
function changeSnakeDir(e, t) {
  e === -snakeDir.x && t === -snakeDir.y || (snakeDir = {
    x: e,
    y: t
  });
}
function drawS() {
  sCtx.clearRect(0, 0, 280, 180), sCtx.font = "12px FontAwesome", snake.forEach(((e, t) => {
    sCtx.fillText(0 === t ? "" : "", 10 * e.x, 10 * e.y + 10);
  })), sCtx.fillText("", 10 * sFood.x, 10 * sFood.y + 10);
}
function animateS() {
  if (!snakeRunning) return;
  let e = {
    x: snake[0].x + snakeDir.x,
    y: snake[0].y + snakeDir.y
  };
  if (e.x < 0 || e.x >= 28 || e.y < 0 || e.y >= 18 || snake.some((t => t.x === e.x && t.y === e.y))) return alert("OVER!"), void initSnake();
  snake.unshift(e), e.x === sFood.x && e.y === sFood.y ? sFood = {
    x: Math.floor(27 * Math.random()),
    y: Math.floor(17 * Math.random())
  } : snake.pop(), drawS(), snakeTimeout = setTimeout(animateS, 100);
}

// Catch Game
const cCanvas = document.getElementById("catchCanvas"),
  cCtx = cCanvas.getContext("2d");
let catchReq, catchRunning = !1,
  basketX = 110,
  items = [],
  score = 0;
function initCatch() {
  catchRunning = !1, items = [], score = 0, drawC(), document.getElementById("startCatchBtn").style.display = "block";
}
function startCatch() {
  catchRunning = !0, document.getElementById("startCatchBtn").style.display = "none", animateC();
}
function drawC() {
  cCtx.clearRect(0, 0, 280, 250), cCtx.font = "20px FontAwesome", cCtx.fillText("", basketX + 20, 240), items.forEach((e => cCtx.fillText("", e.x, e.y))), cCtx.font = "12px JetBrains Mono", cCtx.fillText("Score: " + score, 10, 20);
}
function animateC() {
  catchRunning && (Math.random() < .04 && items.push({
    x: 260 * Math.random(),
    y: 0
  }), items.forEach(((e, t) => {
    if (e.y += 3.5, e.y > 220 && e.x > basketX && e.x < basketX + 60) items.splice(t, 1), score++;
    else if (e.y > 250) return alert("OVER!"), void initCatch();
  })), drawC(), catchReq = requestAnimationFrame(animateC));
}
cCanvas.addEventListener("mousemove", (e => {
  let t = cCanvas.getBoundingClientRect();
  basketX = e.clientX - t.left - 30;
}));
cCanvas.addEventListener("touchmove", (e => {
  let t = cCanvas.getBoundingClientRect();
  basketX = e.touches[0].clientX - t.left - 30, e.preventDefault();
}), {
  passive: !1
});

// Memory Game
const icons_mem = ["fa-bug", "fa-code", "fa-terminal", "fa-microchip", "fa-shield-halved", "fa-user-secret", "fa-key", "fa-wifi"];
let flipped = [];
function initMemory() {
  const e = document.getElementById("memoryGrid");
  e.innerHTML = "";
  [...icons_mem, ...icons_mem].sort((() => Math.random() - .5)).forEach(((t, n) => {
    let a = document.createElement("div");
    a.className = "memory-card", a.dataset.icon = t, a.onclick = () => {
      flipped.length < 2 && !a.classList.contains("flipped") && (a.classList.add("flipped"), a.innerHTML = `<i class="fas ${t}"></i>`, flipped.push(a), 2 === flipped.length && (flipped[0].dataset.icon === flipped[1].dataset.icon ? (flipped.forEach((e => e.classList.add("matched"))), flipped = []) : setTimeout((() => {
        flipped.forEach((e => {
          e.classList.remove("flipped"), e.innerHTML = "";
        })), flipped = [];
      }), 600)));
    }, e.appendChild(a);
  }));
}

// Dino Game
const dCanvas = document.getElementById("dinoCanvas"),
  dCtx = dCanvas.getContext("2d");
let dinoReq, dinoRunning = !1,
  dY = 148,
  dV = 0,
  obsX = 300,
  currentChar = "";
function initDino() {
  dinoRunning = !1, obsX = 300, dY = 148, drawD(), document.getElementById("startDinoBtn").style.display = "block";
}
function startDino() {
  dinoRunning = !0, document.getElementById("startDinoBtn").style.display = "none", animateD();
}
function drawD() {
  dCtx.clearRect(0, 0, 280, 150), dCtx.font = "22px FontAwesome", dCtx.fillStyle = getComputedStyle(document.body).getPropertyValue("--text") || "#000", dCtx.fillText(currentChar, 20, dY), dCtx.fillRect(obsX, 130, 15, 20), dCtx.fillRect(0, 149, 280, 1);
}
function animateD() {
  if (dinoRunning) {
    if (dV += .45, dY += dV, dY > 148 && (dY = 148, dV = 0), obsX -= 4.2, obsX < -20 && (obsX = 300), obsX < 40 && obsX > 15 && dY > 130) return alert("OVER!"), void initDino();
    drawD(), dinoReq = requestAnimationFrame(animateD);
  }
}
dCanvas.addEventListener("touchstart", (e => {
  dY >= 148 && (dV = -8.5), e.preventDefault();
}), {
  passive: !1
});

function toggleCharMenu() {
  const e = document.getElementById("charOverlay");
  e && (e.style.display = "none" === e.style.display || "" === e.style.display ? "block" : "none");
}
function setChar(e) {
  currentChar = e, dinoRunning || drawD(), toggleCharMenu();
}

// Bird Game
const bCanvas = document.getElementById("birdCanvas"),
  bCtx = bCanvas.getContext("2d");
let birdReq, birdRunning = !1,
  bY = 150,
  bV = 0,
  piX = 280,
  gY = 80;
function initBird() {
  birdRunning = !1, bY = 150, bV = 0, piX = 280, drawB(), document.getElementById("startBirdBtn").style.display = "block";
}
function startBird() {
  birdRunning = !0, document.getElementById("startBirdBtn").style.display = "none", animateB();
}
function drawB() {
  bCtx.clearRect(0, 0, 280, 300), bCtx.font = "22px FontAwesome", bCtx.fillText("", 50, bY), bCtx.fillRect(piX, 0, 40, gY), bCtx.fillRect(piX, gY + 110, 40, 300);
}
function animateB() {
  if (birdRunning) {
    if (bV += .18, bY += bV, piX -= 2.5, piX < -40 && (piX = 280, gY = 130 * Math.random() + 40), bY > 300 || bY < 0) return alert("OVER!"), void initBird();
    if (piX < 75 && piX + 40 > 50 && (bY - 18 < gY || bY > gY + 110)) return alert("OVER!"), void initBird();
    drawB(), birdReq = requestAnimationFrame(animateB);
  }
}
bCanvas.addEventListener("touchstart", (e => {
  bV = -4.5, e.preventDefault();
}), {
  passive: !1
});

// XOX Game
let board_xox = ["", "", "", "", "", "", "", "", ""];
function makeMove(e) {
  "" === board_xox[e] && (board_xox[e] = "X", renderXox(), checkXox() || setTimeout(aiXox, 400));
}
function aiXox() {
  let e = board_xox.map(((e, t) => "" === e ? t : null)).filter((e => null !== e));
  e.length && (board_xox[e[Math.floor(Math.random() * e.length)]] = "O", renderXox(), checkXox());
}
function checkXox() {
  const e = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let t of e)
    if (board_xox[t[0]] && board_xox[t[0]] === board_xox[t[1]] && board_xox[t[0]] === board_xox[t[2]]) return alert(board_xox[t[0]] + " WIN!"), resetGame(), !0;
  return !board_xox.includes("") && (alert("SERI!"), resetGame(), !0);
}
function renderXox() {
  document.querySelectorAll(".cell").forEach(((e, t) => e.innerText = board_xox[t]));
}
function resetGame() {
  board_xox = ["", "", "", "", "", "", "", "", ""], renderXox();
}

// Pacman Game
const pacCanvas = document.getElementById("pacmanCanvas"),
  pacCtx = pacCanvas ? pacCanvas.getContext("2d") : null;
let pacReq, pacRunning = !1,
  pacPos = {
    x: 1,
    y: 1
  },
  pacDir = {
    x: 0,
    y: 0
  },
  nextDir = {
    x: 0,
    y: 0
  },
  ghostPos = {
    x: 12,
    y: 5
  },
  pellets = [];
const tileSize = 20,
  pacMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
function initPacman() {
  if (pacCtx) {
    pacRunning = !1, pacPos = {
      x: 1,
      y: 1
    }, pacDir = {
      x: 1,
      y: 0
    }, nextDir = {
      x: 1,
      y: 0
    }, ghostPos = {
      x: 12,
      y: 5
    }, pellets = [];
    for (let e = 0; e < pacMaze.length; e++)
      for (let t = 0; t < pacMaze[e].length; t++) 0 === pacMaze[e][t] && pellets.push({
        x: t,
        y: e,
        s: 1
      });
    drawPac(), document.getElementById("startPacmanBtn").style.display = "block";
  }
}
function startPacman() {
  pacRunning = !0, document.getElementById("startPacmanBtn").style.display = "none", animatePac();
}
function drawPac() {
  pacCtx.clearRect(0, 0, 280, 250);
  for (let e = 0; e < pacMaze.length; e++)
    for (let t = 0; t < pacMaze[e].length; t++) 1 === pacMaze[e][t] && (pacCtx.fillStyle = "#000", pacCtx.fillRect(20 * t, 20 * e, 20, 20));
  pacCtx.fillStyle = "#999", pellets.forEach((e => {
    e.s && (pacCtx.beginPath(), pacCtx.arc(20 * e.x + 10, 20 * e.y + 10, 2, 0, 7), pacCtx.fill());
  })), pacCtx.fillStyle = "#f1c40f", pacCtx.font = "16px FontAwesome", pacCtx.fillText("", 20 * pacPos.x + 2, 20 * pacPos.y + 16), pacCtx.fillStyle = "#e74c3c", pacCtx.fillText("", 20 * ghostPos.x + 2, 20 * ghostPos.y + 16);
}
function animatePac() {
  if (!pacRunning) return;
  pacMaze[pacPos.y + nextDir.y] && 0 === pacMaze[pacPos.y + nextDir.y][pacPos.x + nextDir.x] && (pacDir = nextDir);
  let e = pacPos.x + pacDir.x,
    t = pacPos.y + pacDir.y;
  pacMaze[t] && 0 === pacMaze[t][e] && (pacPos.x = e, pacPos.y = t), pellets.forEach((e => {
    e.x === pacPos.x && e.y === pacPos.y && (e.s = 0);
  }));
  let n = ghostPos.x,
    a = ghostPos.y,
    l = pacPos.x - n,
    o = pacPos.y - a,
    i = 0 !== l ? Math.sign(l) : 0,
    s = 0 !== o ? Math.sign(o) : 0;
  if (Math.random() < .7)
    if (0 !== i && 0 === pacMaze[a][n + i]) n += i;
    else if (0 !== s && 0 === pacMaze[a + s][n]) a += s;
  else {
    let e = [{
      x: 1,
      y: 0
    }, {
      x: -1,
      y: 0
    }, {
      x: 0,
      y: 1
    }, {
      x: 0,
      y: -1
    }][Math.floor(4 * Math.random())];
    pacMaze[a + e.y] && 0 === pacMaze[a + e.y][n + e.x] && (n += e.x, a += e.y);
  }
  return ghostPos.x = n, ghostPos.y = a, pacPos.x === ghostPos.x && pacPos.y === ghostPos.y ? (alert("CAUGHT BY ADMIN!"), void initPacman()) : pellets.every((e => 0 === e.s)) ? (alert("SYSTEM HACKED!"), void initPacman()) : (drawPac(), void setTimeout((() => {
    pacReq = requestAnimationFrame(animatePac);
  }), 180));
}

// Sudoku
let sudokuLives = 3,
  selectedCell = null;
const sudokuSolution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ],
  sudokuPuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
function initSudoku() {
  sudokuLives = 3, selectedCell = null;
  const e = document.querySelector("#sudokuModal .modal-header span");
  e && (e.innerHTML = `SUDOKU | ${"❤️".repeat(sudokuLives)}`);
  const t = document.getElementById("sudokuContainer"),
    n = document.getElementById("sudokuKeypad");
  if (t && n) {
    t.innerHTML = "", n.innerHTML = "";
    for (let e = 0; e < 9; e++)
      for (let n = 0; n < 9; n++) {
        const a = document.createElement("div");
        a.className = "sudoku-cell", (n + 1) % 3 == 0 && n < 8 && (a.style.borderRight = "2px solid #000"), (e + 1) % 3 == 0 && e < 8 && (a.style.borderBottom = "2px solid #000"), 0 !== sudokuPuzzle[e][n] ? (a.classList.add("fixed"), a.innerText = sudokuPuzzle[e][n]) : (a.dataset.row = e, a.dataset.col = n, a.onclick = function() {
          document.querySelectorAll(".sudoku-cell").forEach((e => e.style.background = e.classList.contains("fixed") ? "#efefef" : "#fff")), this.style.background = "#e0e0ff", selectedCell = this;
        }), t.appendChild(a);
      }
    for (let t = 1; t <= 9; t++) {
      const a = document.createElement("button");
      a.className = "btn-action", a.innerText = t, a.onclick = function() {
        if (selectedCell) {
          const n = selectedCell.dataset.row,
            a = selectedCell.dataset.col;
          t === sudokuSolution[n][a] ? (selectedCell.innerText = t, selectedCell.style.color = "green", selectedCell.style.background = "#eaffea", selectedCell.onclick = null, selectedCell = null) : (selectedCell.style.background = "#ffeaea", sudokuLives--, e && (e.innerHTML = `SUDOKU | ${"❤️".repeat(sudokuLives)}`), sudokuLives <= 0 ? (alert("GAME OVER! NYAWA HABIS."), initSudoku()) : setTimeout((() => selectedCell.style.background = "#fff"), 300));
        }
      }, n.appendChild(a);
    }
  }
}

// Simon Game
let simonSeq = [],
  userSeq = [],
  isWaitingSimon = !1,
  level = 1;
function startSimon() {
  level = 1, simonSeq = [], userSeq = [], document.getElementById("currentLevel").innerText = level, document.getElementById("startSimonBtn").style.display = "none", simonNextRound();
}
function simonNextRound() {
  userSeq = [], isWaitingSimon = !1, document.getElementById("statusSimon").innerText = "WATCH!", simonSeq.push(Math.floor(4 * Math.random())), setTimeout(playSimonSeq, 800);
}
async function playSimonSeq() {
  for (let e of simonSeq) await new Promise((e => setTimeout(e, 600))), flashIndicator(e);
  isWaitingSimon = !0, document.getElementById("statusSimon").innerText = "YOUR TURN";
}
function flashIndicator(e) {
  const t = document.getElementById(`dot${e}`),
    n = document.getElementById(`sim${e}`);
  t && (t.classList.add("active"), n.style.borderColor = "var(--text)", setTimeout((() => {
    t.classList.remove("active"), n.style.borderColor = "";
  }), 400));
}
function userClick(e) {
  if (!isWaitingSimon) return;
  flashIndicator(e), userSeq.push(e);
  const t = userSeq.length - 1;
  if (userSeq[t] !== simonSeq[t]) return isWaitingSimon = !1, document.getElementById("statusSimon").innerText = "GAME OVER!", void setTimeout((() => {
    document.getElementById("startSimonBtn").style.display = "block", document.getElementById("startSimonBtn").innerText = "PLAY AGAIN";
  }), 1e3);
  userSeq.length === simonSeq.length && (isWaitingSimon = !1, level++, document.getElementById("statusSimon").innerText = "PERFECT!", setTimeout((() => {
    document.getElementById("currentLevel").innerText = level, simonNextRound();
  }), 1e3));
}

// Minesweeper
let bombs = [],
  gameOver = !1;
function openMinesweeper() {
  document.querySelectorAll(".modal").forEach((e => e.style.display = "none"));
  document.getElementById("mineModal").style.display = "block", initMine();
}
function initMine() {
  gameOver = !1, bombs = [], document.getElementById("statusMine").innerText = "SCANNING SAFE PATH...";
  const e = document.getElementById("mineGrid");
  for (e.innerHTML = ""; bombs.length < 4;) {
    let e = Math.floor(25 * Math.random());
    bombs.includes(e) || bombs.push(e);
  }
  for (let n = 0; n < 25; n++) {
    const t = document.createElement("div");
    t.className = "mine-cell", t.onclick = function() {
      if (!gameOver && !this.classList.contains("open"))
        if (bombs.includes(n)) gameOver = !0, this.classList.add("bomb"), this.innerHTML = '<i class="fas fa-skull"></i>', bombs.forEach((e => {
          const n = document.querySelectorAll(".mine-cell");
          n[e].classList.add("bomb"), n[e].innerHTML = '<i class="fas fa-bomb"></i>';
        })), document.getElementById("statusMine").innerText = "CRITICAL: BOOM!";
        else {
          this.classList.add("open");
          let e = 0,
            t = Math.floor(n / 5),
            l = n % 5;
          for (let n = -1; n <= 1; n++)
            for (let s = -1; s <= 1; s++) {
              let i = t + n,
                o = l + s;
              i >= 0 && i < 5 && o >= 0 && o < 5 && bombs.includes(5 * i + o) && e++;
            }
          this.innerText = e > 0 ? e : "", 21 === document.querySelectorAll(".mine-cell.open").length && (gameOver = !0, document.getElementById("statusMine").innerText = "PATH CLEAR: EXCELLENT!");
        }
    }, e.appendChild(t);
  }
}

// Burst Game
let startTime, timerInterval, currentTarget = 1;
function openBurst() {
  document.querySelectorAll(".modal").forEach((e => e.style.display = "none")), document.getElementById("burstModal").style.display = "block", startBurst();
}
function startBurst() {
  currentTarget = 1, clearInterval(timerInterval), document.getElementById("burstTimer").innerText = "0.00s";
  const e = document.getElementById("burstGrid");
  e.innerHTML = "", [1, 2, 3, 4, 5, 6, 7, 8, 9].sort((() => Math.random() - .5)).forEach((t => {
    const n = document.createElement("div");
    n.className = "burst-cell", n.innerText = t, n.onclick = function() {
      t === currentTarget && (1 === currentTarget && startTimer(), this.classList.add("correct"), this.onclick = null, currentTarget++, currentTarget > 9 && winBurst());
    }, e.appendChild(n);
  }));
}
function startTimer() {
  startTime = Date.now(), timerInterval = setInterval((() => {
    let e = (Date.now() - startTime) / 1e3;
    document.getElementById("burstTimer").innerText = e.toFixed(2) + "s";
  }), 10);
}
function winBurst() {
  clearInterval(timerInterval), alert("FINISH! Time: " + document.getElementById("burstTimer").innerText);
}

// Dam Game
let board = [],
  selectedPiece = null,
  turn = 1;
function openDam() {
  document.querySelectorAll(".modal").forEach((e => e.style.display = "none")), document.getElementById("damModal").style.display = "block", initDam();
}
function initDam() {
  turn = 1, selectedPiece = null, document.getElementById("statusDam").innerText = "PLAYER 1 TURN (WHITE)";
  document.getElementById("damGrid").innerHTML = "", board = Array(25).fill(0), board[0] = 1, board[2] = 1, board[4] = 1, board[20] = 2, board[22] = 2, board[24] = 2, renderBoard();
}
function renderBoard() {
  const e = document.getElementById("damGrid");
  e.innerHTML = "", board.forEach(((t, n) => {
    const a = document.createElement("div");
    if (a.className = "dam-cell " + ((Math.floor(n / 5) + n) % 2 == 0 ? "light" : "dark"), 0 !== t) {
      const e = document.createElement("div");
      e.className = `piece player${t} ${selectedPiece === n ? "selected" : ""}`, a.appendChild(e);
    }
    a.onclick = () => handleCellClick(n), e.appendChild(a);
  }));
}
function handleCellClick(e) {
  null === selectedPiece ? board[e] === turn && (selectedPiece = e) : 0 === board[e] ? movePiece(selectedPiece, e) : board[e] === turn && (selectedPiece = e), renderBoard();
}
function movePiece(e, t) {
  board[t] = board[e], board[e] = 0, turn = 1 === turn ? 2 : 1, document.getElementById("statusDam").innerText = 1 === turn ? "PLAYER 1 TURN (WHITE)" : "PLAYER 2 TURN (BLACK)", selectedPiece = null;
}

// Stack Game
let s_canvas, s_ctx, s_score = 0,
  s_speed = 2,
  s_currentBlock = {},
  s_placedBlocks = [],
  s_isGameActive = !1;
const S_BOX_HEIGHT = 30;
function initStack() {
  s_canvas = document.getElementById("stackCanvas"), s_ctx = s_canvas.getContext("2d"), s_score = 0, s_speed = 2, s_isGameActive = !0, document.getElementById("stackScore").innerText = s_score, document.getElementById("stackBtn").style.display = "none", s_placedBlocks = [{
    x: 50,
    y: s_canvas.height - 30,
    w: 200
  }], s_newBlock(), s_animate();
}
function s_newBlock() {
  let e = s_placedBlocks[s_placedBlocks.length - 1];
  s_currentBlock = {
    x: 0,
    y: e.y - 30,
    w: e.w,
    dir: 1
  };
}
function s_animate() {
  s_isGameActive && (s_ctx.clearRect(0, 0, s_canvas.width, s_canvas.height), s_ctx.fillStyle = "#ffffff", s_placedBlocks.forEach((e => {
    s_ctx.fillRect(e.x, e.y, e.w, 28);
  })), s_currentBlock.x += s_speed * s_currentBlock.dir, (s_currentBlock.x + s_currentBlock.w > s_canvas.width || s_currentBlock.x < 0) && (s_currentBlock.dir *= -1), s_ctx.fillStyle = "#888888", s_ctx.fillRect(s_currentBlock.x, s_currentBlock.y, s_currentBlock.w, 28), requestAnimationFrame(s_animate));
}
function handleStackClick() {
  if (!s_isGameActive) return;
  let e = s_placedBlocks[s_placedBlocks.length - 1],
    t = Math.max(s_currentBlock.x, e.x),
    n = Math.min(s_currentBlock.x + s_currentBlock.w, e.x + e.w) - t;
  if (n <= 0) {
    s_isGameActive = !1;
    const e = document.getElementById("stackBtn");
    return e.style.display = "block", void(e.innerText = "GAME OVER! RESTART");
  }
  s_placedBlocks.push({
    x: t,
    y: s_currentBlock.y,
    w: n
  }), s_score++, document.getElementById("stackScore").innerText = s_score, s_speed += .2, s_placedBlocks.length > 7 && s_placedBlocks.forEach((e => e.y += 30)), s_newBlock();
}
function openStackGame() {
  document.querySelectorAll(".modal").forEach((e => e.style.display = "none")), document.getElementById("stackModal").style.display = "block";
}

// Keyboard events
window.addEventListener("keydown", (function(e) {
  const t = document.getElementById("pacmanModal");
  t && "block" === t.style.display && ("ArrowLeft" === e.key && (nextDir = {
    x: -1,
    y: 0
  }, e.preventDefault()), "ArrowRight" === e.key && (nextDir = {
    x: 1,
    y: 0
  }, e.preventDefault()), "ArrowUp" === e.key && (nextDir = {
    x: 0,
    y: -1
  }, e.preventDefault()), "ArrowDown" === e.key && (nextDir = {
    x: 0,
    y: 1
  }, e.preventDefault()));
}), !1);

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", (() => {
  if ("dark" === localStorage.getItem("theme")) {
    document.body.setAttribute("data-theme", "dark");
    const e = document.getElementById("themeIcon");
    e && (e.className = "fas fa-sun");
  }
}));

document.addEventListener("click", (function(e) {
  e.target.innerText && (e.target.innerText.includes("PAC-MAN") && (stopAllGames(), toggleModal("menuModal"), toggleModal("pacmanModal"), setTimeout(initPacman, 200)), e.target.innerText.includes("SUDOKU") && (stopAllGames(), toggleModal("menuModal"), toggleModal("sudokuModal"), setTimeout(initSudoku, 200)));
}));
