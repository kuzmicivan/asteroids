// Čeka učitavanje cijelog dokumenta prije pokretanja skripte
document.addEventListener("DOMContentLoaded", (event) => {

  // Postavljanje platna i konteksta za crtanje
  const canvas = document.getElementById("asteroidsCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Definiranje varijabli igre
  let gameActive = false;
  let animationFrameId;
  let startTime = Date.now();
  let elapsedTime = 0;
  const asteroidConsistencyTime = 200;
  const numberOfAsteroids = 15;
  const asteroids = [];
  const playerSpeed = 10;

  // Igrač
  const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
  };

  // Konstruktor za asteroide
  function Asteroid(x, y, width, height, xSpeed, ySpeed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
  }

  // Crtanje igrača
  function drawPlayer() {
    ctx.fillStyle = "red";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "gray";
    ctx.fillRect(
      player.x - player.width / 2,
      player.y - player.height / 2,
      player.width,
      player.height
    );
  }

  // Crtanje asteroida
  function drawAsteroids() { 
    for (let i = 0; i < asteroids.length; i++) {
      const asteroid = asteroids[i];
      ctx.fillStyle = "#aaa";
      ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "gray";
    }
  }

  // Inicijalizacija asteroida
  function initAsteroids() {
    for (let i = 0; i < numberOfAsteroids; i++) {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      const width = 20 + Math.random() * 30;
      const height = 20 + Math.random() * 30;
      const xSpeed = (Math.random() - 0.5) * 4;
      const ySpeed = (Math.random() - 0.5) * 4;
      // Odrediti poziciju na temelju odabrane strane
      if (side === 0) {
        // Gore
        x = Math.random() * canvas.width;
        y = -height;
      } else if (side === 1) {
        // Desno
        x = canvas.width + width;
        y = Math.random() * canvas.height;
      } else if (side === 2) {
        // Dolje
        x = Math.random() * canvas.width;
        y = canvas.height + height;
      } else {
        // Lijevo
        x = -width;
        y = Math.random() * canvas.height;
      }
      asteroids.push(new Asteroid(x, y, width, height, xSpeed, ySpeed));
    }
  }

  // Stvaranje novih asteroida
  function addNewAsteroids() {
    if (!gameActive) return;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const width = 20 + Math.random() * 30;
    const height = 20 + Math.random() * 30;
    const xSpeed = (Math.random() - 0.5) * 4;
    const ySpeed = (Math.random() - 0.5) * 4;

    if (side === 0) {
      x = Math.random() * canvas.width;
      y = -height;
    } else if (side === 1) {
      x = canvas.width + width;
      y = Math.random() * canvas.height;
    } else if (side === 2) {
      x = Math.random() * canvas.width;
      y = canvas.height + height;
    } else {
      x = -width;
      y = Math.random() * canvas.height;
    }

    asteroids.push(new Asteroid(x, y, width, height, xSpeed, ySpeed));
  }

  // Osvježavanje pozicija asteroida
  function updateAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.x += asteroid.xSpeed;
      asteroid.y += asteroid.ySpeed;

      // Uklanjanje asteroida koji izlaze izvan granica ekrana
      if (
        asteroid.x + asteroid.width < 0 ||
        asteroid.x > canvas.width ||
        asteroid.y + asteroid.height < 0 ||
        asteroid.y > canvas.height
      ) {
        asteroids.splice(i, 1);
      }
    }
  }

  // Provjera sudara igrača i asteroida
  function checkCollisions() {
    for (let asteroid of asteroids) {
      if (
        player.x < asteroid.x + asteroid.width &&
        player.x + player.width > asteroid.x &&
        player.y < asteroid.y + asteroid.height &&
        player.y + player.height > asteroid.y
      ) {
        const currentBestTime = getBestTime();
        if (elapsedTime > currentBestTime) {
          setBestTime(elapsedTime);
        }
        pauseGame();
        break;
      }
    }
  }

  // Dohvat najboljeg vremena
  function getBestTime() {
    const bestTime = localStorage.getItem("bestTime");
    return bestTime ? parseFloat(bestTime) : 0;
  }

  // Pohranjivanje najboljeg vremena
  function setBestTime(time) {
    localStorage.setItem("bestTime", time.toString());
  }

  // Crtanje timera
  function drawTimer() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    const timeText = "Trenutno vrijeme: " + elapsedTime.toFixed(3) + "s";
    const bestTimeText = "Najbolje vrijeme: " + getBestTime().toFixed(3) + "s";
    const timeTextWidth = ctx.measureText(timeText).width;
    const bestTimeTextWidth = ctx.measureText(bestTimeText).width;
    ctx.fillText(timeText, canvas.width - timeTextWidth - 10, 30);
    ctx.fillText(bestTimeText, canvas.width - bestTimeTextWidth - 10, 60);
  }

  // Pokretanje nove igre
  function startGame() {
    if (!gameActive) {
      gameActive = true;
      startTime = Date.now() - elapsedTime * 1000;
      clearInterval(addAsteroidsIntervalId);
      addAsteroidsIntervalId = setInterval(addNewAsteroids, asteroidConsistencyTime);
      animationFrameId = requestAnimationFrame(update);
    }
  }

  // Pauziranje igre (nakon sudara)
  function pauseGame() {
    gameActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    clearInterval(addAsteroidsIntervalId);
    resetGame();
  }

  // Resetiranje igre
  function resetGame() {
    asteroids.length = 0;
    initAsteroids();
    elapsedTime = 0;
    drawTimer();
    drawPlayer();
    drawAsteroids();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    if (addAsteroidsIntervalId) {
      clearInterval(addAsteroidsIntervalId);
    }
    addAsteroidsIntervalId = setInterval(addNewAsteroids, asteroidConsistencyTime);
  }

  // Kontrole igrača
  document.addEventListener("keydown", (e) => {
    if (e.key === " " && !gameActive) {
      startGame();
    } else if (gameActive) {
      switch (e.key) {
        case "ArrowUp":
          player.y -= playerSpeed;
          if (player.y < player.height / 2) player.y = player.height / 2;
          break;
        case "ArrowDown":
          player.y += playerSpeed;
          if (player.y > canvas.height - player.height / 2)
            player.y = canvas.height - player.height / 2;
          break;
        case "ArrowLeft":
          player.x -= playerSpeed;
          if (player.x < player.width / 2) player.x = player.width / 2;
          break;
        case "ArrowRight":
          player.x += playerSpeed;
          if (player.x > canvas.width - player.width / 2)
            player.x = canvas.width - player.width / 2;
          break;
      }
    }
  });

  let addAsteroidsIntervalId = setInterval(addNewAsteroids, asteroidConsistencyTime);

   // Glavna funkcija za ažuriranje igre
  function update() {
    if (!gameActive) return;
    elapsedTime = (Date.now() - startTime) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateAsteroids();
    drawAsteroids();
    drawTimer();
    checkCollisions();
    animationFrameId = requestAnimationFrame(update);
  }

  // Na početku prikaz igre kao pauzirane/resetirane
  resetGame();
});
