(function(window, document) {
  const { Neuron, Layer, Network, Trainer, Architect } = window.synaptic

  class Perceptron extends Network {
    constructor(input, hidden, output) {
      // create the layers
      const inputLayer = new Layer(input)
      const hiddenLayer = new Layer(hidden)
      const outputLayer = new Layer(output)

      // connect the layers
      inputLayer.project(hiddenLayer)
      hiddenLayer.project(outputLayer)

      // set the layers
      super()
      this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
      })
    }
  }

  const myPerceptron = new Perceptron(2,3,1)
  const myTrainer = new Trainer(myPerceptron)

  myTrainer.XOR()

  console.log(myPerceptron.activate([0,0]))
  console.log(myPerceptron.activate([1,0]))
  console.log(myPerceptron.activate([0,1]))
  console.log(myPerceptron.activate([1,1]))

})(this, this.document)