(function () {
  const cvs = document.getElementById("flappyBird") // get canvas link
  const ctx = cvs.getContext("2d") // object allow us to draw

  const bird = new Image()
  const bg = new Image()
  const fg = new Image()
  const pipeNorth = new Image()
  const pipeSouth = new Image()

  bird.src = "images/bird.png"
  bg.src = "images/bg.png"
  fg.src = "images/fg.png"
  pipeNorth.src = "images/pipeNorth.png"
  pipeSouth.src = "images/pipeSouth.png"

  // gap; is the gap in pixels between the south Pipe and North Pipe.
  const gap = 85

  const pipes = []
  pipes[0] = {
    x : cvs.width,
    y : 0
  }

  let score = 0;
  // bird position
  let xPos = 10;
  let yPos = 150;
  const grav = 1.5;
  const jump = 25

  document.addEventListener("keydown", moveUp)

  function moveUp() {
    yPos -= jump
  }

  function draw() {
    ctx.drawImage(bg, 0, 0)
   
    for(var i = 0; i < pipes.length; i++) {
      ctx.drawImage(pipeNorth, pipes[i].x, pipes[i].y)
      ctx.drawImage(pipeSouth, pipes[i].x, pipes[i].y + pipeNorth.height + gap)
   
      pipes[i].x--
   
      if(pipes[i].x == 125) {
        pipes.push({
          x : cvs.width,
          y : Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height
        })
      }
    
      // collissions
      if(xPos + bird.width >= pipes[i].x
        && xPos <= pipes[i].x + pipeNorth.width
        && (yPos <= pipes[i].y + pipeNorth.height
        || yPos + bird.height >= pipes[i].y + pipeNorth.height + gap) 
        || yPos + bird.height >= cvs.height - fg.height) {
        location.reload()
      }
    
      if(pipes[i].x == 5) {
        score++
      }
    }
   
    ctx.drawImage(fg, 0, cvs.height - fg.height)
    ctx.drawImage(bird, xPos, yPos)
   
    yPos += grav
   
    ctx.fillStyle = "#000"
    ctx.font = "24px Verdana"
    ctx.fillText("Score: " + score, 10, cvs.height - 20)
   
    requestAnimationFrame(draw)
  }

  pipeSouth.onload = draw
  
})()