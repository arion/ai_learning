(function () {
  const Bird = class {
    constructor(props) {
      const initProps = {
        x: 80,
        y: 250,
        width: 40,
        height: 30,

        alive: true,
        gravity: 0,
        velocity: 0.3,
        jump: -6,
      }

      Object.assign(this, initProps)
      Object.assign(this, props)
    }

    flap() {
      this.gravity = this.jump
    }

    update() {
      this.gravity += this.velocity
      this.y += this.gravity
    }

    isDead(height, pipes) {
      if(this.y >= height || this.y + this.height <= 0){
        return true
      }
      for(var i in pipes) {
        if (!(
          this.x > pipes[i].x + pipes[i].width ||
          this.x + this.width < pipes[i].x || 
          this.y > pipes[i].y + pipes[i].height ||
          this.y + this.height < pipes[i].y
          ))
        { return true }
      }
    }
  }

  const Pipe = class {
    constructor(props) {
      const initProps = {
        x: 0,
        y: 0,
        width: 50,
        height: 40,
        speed: 3
      }
      Object.assign(this, initProps)
      Object.assign(this, props)
    }

    update() {
      this.x -= this.speed
    }

    isOut() {
      return (this.x + this.width < 0)
    }
  }

  const Game = class {
    constructor() {
      const initProps = {
        pipes: [],
        bird: [],
        score: 0,
        canvas: document.querySelector("#flappy"),
        ctx: this.canvas.getContext("2d"),
        width: this.canvas.width,
        height: this.canvas.height,
        spawnInterval: 90,
        interval: 0,
      }
    }
  }
})()