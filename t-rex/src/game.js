const tf = require('@tensorflow/tfjs')

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
      height: 40,
      width: 20,
      gravity: 5,
      jumpHeight: 100,
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
    let width = 10
    let height = 28
    if (props.size == 'small') {
      width = 10
      height = 18
    }
    const right = 0 - ((props.position + 1) * (width + 1))

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

    document.addEventListener("keydown", (key) => {
      if (key.code !== 'Space') { return }
      this.jump()
    })
  }

  jump() {
    if (!this.started) { 
      this.reset()
    }
    this.runner.jump()
  }

  drawScore(score) {
    this.maxScore = (this.maxScore > score) && this.maxScore || score
    this.canvas.text((score + '').padStart(5, '0'), { right: 20, top: 20 })
  }

  drawMaxScore () {
    this.canvas.text(`IT ${(this.brain.iteration + '').padStart(3, '0')} HI ${(this.maxScore + '').padStart(5, '0')}`, { right: 70, top: 20, color: 'Gray' })
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
    const distanceEnought = this.trees.slice(-1)[0].right > randomBetween(200, 1000)
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
        this.trees.push(new Tree({...baseAttrs, size: 'small', position: 0, count: 1}))
        break
      case 2:
        this.trees.push(new Tree({...baseAttrs, size: 'small', position: 0, count: 2}))
        this.trees.push(new Tree({...baseAttrs, size: 'small', position: 1, count: 2}))
        break
      case 3:
        this.trees.push(new Tree({...baseAttrs, size: 'big', position: 0, count: 3}))
        this.trees.push(new Tree({...baseAttrs, size: 'big', position: 1, count: 3}))
        break
      case 4:
        this.trees.push(new Tree({...baseAttrs, size: 'small', position: 0, count: 3}))
        this.trees.push(new Tree({...baseAttrs, size: 'small', position: 1, count: 3}))
        this.trees.push(new Tree({...baseAttrs, size: 'small', position: 2, count: 3}))
        break
      default:
        this.trees.push(new Tree({...baseAttrs, size: 'big', position: 0, count: 1}))
    }
  }

  drawTrees() {
    this.trees = this.trees.filter((t) => t.right < 1000)
    this.trees.map((tree) => {
      if (this.runner.collision(tree) && !this.god) { this.crash() }
      if (this.started) { tree.update() }
      tree.draw()
    })
  }

  crash() {
    if (this.started) {
      this.started = false

      this.brain.onCrash(this.runner, this)
    }
  }

  reset() {
    this.started = true
    this.msec = 0
    this.trees = []
    this.speed = 5
  }

  getState() {
    let state = null
    this.trees.map((tree) => {
      const treeLeft = this.canvas.width - tree.right - tree.width
      const distance = treeLeft - (this.runner.left + this.runner.width)
      
      if ((distance + tree.width) > 0 && !state) {
        state = {
          distance: distance,
          height: tree.height,
          width: tree.count * (tree.width + 1),
          speed: this.speed
        }
      }
    })
    return state
  }

  running() {
    const state = this.getState()
    if (state && this.started) {
      this.brain.onRunning(this.runner, state).then((shouldJump) => {
        if (shouldJump) { this.jump() }
      })
    }
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

      this.running()
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

class Brain {
  constructor(props) {
    this.model = tf.sequential()

    this.iteration = 0

    this.lastState = {}

    this.model.add(tf.layers.dense({
      inputShape: [4], // speed of the game, the width of the oncoming obstacle and it’s distance from our dino
      activation: 'sigmoid',
      units: 6
    }))

    this.model.add(tf.layers.dense({
      inputShape: [8],
      activation: 'sigmoid',
      units: 2 // jump [0,1] and not jump [1,0]
    }))

    this.model.compile({
      loss:'meanSquaredError',
      optimizer : tf.train.adam(0.1)
    })

    this.training = {
      inputs: [],
      labels: []
    }
  }

  onCrash(runner, game) {
    let input = Object.values(this.lastState)
    let label = null
    if (runner.inAir()) {
      label = [1, 0] // should not jump
    } else {
      label = [0, 1] // should jump
    }
    this.training.inputs.push(input)
    this.training.labels.push(label)

    this._trainModel()
    setTimeout(() => this.runGame(game), 1000)
  }

  runGame(game) {
    game.jump()
    this.iteration += 1
  }

  onRunning(runner, state) {
    return new Promise((resolve) => {
      let shouldJump = false
      if (!runner.inAir()) {
        const prediction = this.model.predict(tf.tensor2d([Object.values(state)]))
        const predictionPromise = prediction.data()
        predictionPromise.then((result) => {
          if (result[1] > result[0]) {
            shouldJump = true
          }
          this.lastState = state
          resolve(shouldJump)
        })
      }
    })
  }

  _trainModel() {
    this.model.fit(tf.tensor2d(this.training.inputs),tf.tensor2d(this.training.labels))
  }
}

const canvas = new drawFabric('game')
const brain = new Brain()

const game = new Game({canvas, brain})
game.run()
brain.runGame(game)