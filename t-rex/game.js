(function(window, document) {
  const randomBetween = (min, max) => Math.floor(Math.random()*(max-min+1)+min)

  class drawFabric {
    constructor(canvasId) {
      const canvas = document.getElementById(canvasId)
      const props = {
        canvas,
        ctx: canvas.getContext("2d"),
        width: canvas.width,
        height: canvas.height,
      }
      Object.assign(this, props)
    }

    text(text, {top, right, bottom, left, color}) {
      this.ctx.fillStyle = color || "Black"
      this.ctx.font      = "normal 12pt Arial"
      if (!left && right) {
        left = this.width - this.ctx.measureText(text).width - right
      }
      if (!top && bottom) {
        top = this.height - this.ctx.measureText(text).height - bottom
      }
      this.ctx.fillText(text, left, top)
    }

    rect({ color, top, right, bottom, left, width, height }) {
      this.ctx.save()
      this.ctx.fillStyle = color
      if (!left && right) {
        left = this.width - width - right
      }
      if (!top && bottom) {
        top = this.height - height - bottom
      }
      this.ctx.fillRect(left, top, width, height)
      this.ctx.restore()
    }

    runner({ left, bottom, height, width }) {
      this.rect({ color: "#FF0000", left, bottom, width, height })
    }

    tree({ right, bottom, height, width }) {
      this.rect({ color: "#00FF00", right, bottom, width, height })
    }

    clear() {
      this.ctx.clearRect(0, 0, this.width, this.height)
    }
  }

  class Runner {
    constructor(props) {
      const defaultProps = {
        left: 30,
        bottom: 20, 
        height: 50,
        width: 30,
        gravity: 3.5,
        jumpHeight: 80,
        florLevel: 20,
        goesUp: false,
      }

      Object.assign(this, defaultProps)
      Object.assign(this, props)
    }

    inAir() {
      return this.bottom > this.florLevel
    }

    jump() {
      if (!this.inAir()) { this.goesUp = true }
    }

    draw() {
      this.canvas.runner(this)
    }

    collision(tree) {
      if (this.bottom > tree.bottom + tree.height) { return false } // runner highest then tree
      const treeRight = this.canvas.width - tree.right
      const treeLeft = this.canvas.width - tree.right - tree.width
      if (this.left < treeRight && this.left + this.width > treeLeft) { return true }
      return false
    }

    update() {
      if (!this.goesUp && this.inAir()) { this.bottom -= this.gravity }
      if (this.goesUp && (this.bottom < this.florLevel + this.jumpHeight)) { 
        this.bottom += this.gravity * 2
      } else {
        this.goesUp = false
      }
    }
  }

  class Tree {
    constructor(props) {
      let width = 20
      let height = 40
      if (props.size == 'small') {
        width = 15
        height = 30
      }
      const right = 0 - ((props.position + 1) * (width + 3))

      const defaultProps = {
        right,
        bottom: 20, 
        height,
        width,
      }

      Object.assign(this, defaultProps)
      Object.assign(this, props)
    }

    draw() {
      this.canvas.tree(this)
    }

    update() {
      this.right += this.speed
    }
  }

  class Game {
    constructor(props) {
      const defaultProps = {
        speed: 5,
        fps: 60,
        maxScore: 0,
        score: 0,
        msec: 0,
        trees: [],
        god: false,

        started: false,

        runner: new Runner(props)
      }

      Object.assign(this, defaultProps)
      Object.assign(this, props)

      document.addEventListener("keydown", (key) => this.jump(key))
    }

    jump(key) {
      if (key.code !== 'Space') { return }
      if (!this.started) { 
        this.started = true
        this.msec = 0
        this.trees = []
        this.speed = 5
      }
      this.runner.jump()
    }

    drawScore(score) {
      this.maxScore = (this.maxScore > score) && this.maxScore || score
      this.canvas.text((score + '').padStart(5, '0'), { right: 20, top: 20 })
    }

    drawMaxScore () {
      this.canvas.text(`HI ${(this.maxScore + '').padStart(5, '0')}`, { right: 70, top: 20, color: 'Gray' })
    }

    drawRunner() {
      if (this.started) { this.runner.update() }
      this.runner.draw()
    }

    drawBg() {
      // TODO
    }

    canAddTree(score) {
      // if (score < 5) { return false }
      if (!this.trees.length) { return true }
      const distanceEnought = this.trees.slice(-1)[0].right > randomBetween(300, 1000)
      return (distanceEnought)
    }

    // 0 - one big tree
    // 1 - one small tree
    // 2 - two small tree
    // 3 - two big tree
    // 4 - three small tree
    addTree() {
      const treeType = randomBetween(0, 5)

      const baseAttrs = {canvas: this.canvas, size: 'small', speed: this.speed}

      switch (treeType) {
        case 1:
          this.trees.push(new Tree({...baseAttrs, size: 'small', position: 0}))
          break;
        case 2:
          this.trees.push(new Tree({...baseAttrs, size: 'small', position: 0}))
          this.trees.push(new Tree({...baseAttrs, size: 'small', position: 1}))
          break;
        case 3:
          this.trees.push(new Tree({...baseAttrs, size: 'big', position: 0}))
          this.trees.push(new Tree({...baseAttrs, size: 'big', position: 1}))
          break;
        case 4:
          this.trees.push(new Tree({...baseAttrs, size: 'small', position: 0}))
          this.trees.push(new Tree({...baseAttrs, size: 'small', position: 1}))
          this.trees.push(new Tree({...baseAttrs, size: 'small', position: 2}))
          break;
        default:
          this.trees.push(new Tree({...baseAttrs, size: 'big', position: 0}))
      }
    }

    drawTrees() {
      this.trees = this.trees.filter((t) => t.right < 1000)
      this.trees.map((tree) => {
        if (this.runner.collision(tree) && !this.god) { this.started = false }
        if (this.started) { tree.update() }
        tree.draw()
      })
    }

    update() {
      this.canvas.clear()
      const score = parseInt(this.msec / this.speed)
      this.speed = 5 + (parseInt(score / 100) / 10)

      if (this.started) {
        this.msec++

        if (this.canAddTree(score)) {
          this.addTree()
        }
      }
      
      this.drawScore(score)
      this.drawMaxScore()
      this.drawRunner()
      this.drawBg()
      this.drawTrees()

      requestAnimationFrame(() => this.update())
    }
    
    run() {
      this.update()
    }
  }

  const canvas = new drawFabric('game')

  const game = new Game({canvas})
  game.run()
})(this, this.document)