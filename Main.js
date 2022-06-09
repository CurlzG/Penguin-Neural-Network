Main();

async function getData(path){
const response = await fetch(path);
const data = await response.text();
//Removes Header
const rows = data.split('\n');
let finalrows = [];
for(let i = 0; i < rows.length;i  ++){
    const row = rows[i].split(',');
    finalrows[i] = row;
}
return finalrows;
}
function getLabels(File){
    let Label = [];
    for(let i = 0; i < File.length; i++ ){
        Label[i] = File[i][4];
    }
    return Label;
}
function getInstances(File){
for(let i = 0; i < File.length; i++){
    File[i].splice(-1);
}
return File
}
function getNLabels(File){
    let NLabels =[];
    //encode "Adelie" as 1, "Chinstrap" as 2, "Gentoo" as 3
    for(let i = 0; i < File.length;i++){
        if(File[i] == "Adelie"){
            NLabels[i] = 0;
        }
        if(File[i] == "Gentoo"){
            NLabels[i] = 1;
        }
        if(File[i] == "Chinstrap"){
            NLabels[i] = 2;
        }
        //console.log(File[i]);
    }
    return NLabels;
}
function getNumLabels(File){
    let NLabels =[];
    //encode "Adelie" as 1, "Chinstrap" as 2, "Gentoo" as 3
    for(let i = 0; i < File.length;i++){
        if(File[i] == "Adelie"){
            NLabels[i] = [1,0,0];
        }
        if(File[i] == "Gentoo"){
            NLabels[i] = [0,0,1];
        }
        if(File[i] == "Chinstrap"){
            NLabels[i] = [0,1,0];
        }
        //console.log(File[i]);
    }
    return NLabels;
}

async function Main(){
    console.log("----Starting----");
    //Test and Train 
    let Test = await getData("penguins-test.csv");
    let Train = await getData("penguins-train.csv");
    
    //Headers 
    let Headers = Test[0];

    //Removing Headers 
    Test = Test.splice(1); 
    Train = Train.splice(1);

    //Labels for Test
    let TrainLabels = getLabels(Train);
    let TrainInstances = getInstances(Train);
    let scale = new Rescaler(Train);

    //To Print out Max and Min of Rescaler
    //scale.print();

    //Scaling Train Data
    Train = scale.rescale(Train);

    //Converting the Penguins Types 
    TrainLabels = getNLabels(TrainLabels);
    let TrainLabelsCode = getNumLabels(TrainLabels);

    //Constructing Neural Network
    let first = 4; // First Layer 
    let hidden = 2;  // Hidden Layer
    let out = 3; // Output 
    let hidden_weights = [[-0.28,-0.22],[0.08,0.20],[-0.30,0.32],[0.1,0.01]]; //Hidden layer Weights Hidden -> Output
    let out_weights = [[-0.29,0.03,0.21],[0.08,0.13,-0.36]]; // Output Layer Weight Output -> Hidden
    let rate = 0.2; // Learning Rate 
    let nn = new NeuralNetwork(first, hidden, out, hidden_weights, out_weights, rate);
    //console.log(TrainLabels);
    nn.train(Train,TrainLabels,100);
}
class NeuralNetwork {
    constructor(first, hidden,out,hidden_weights,out_weights,rate){
        this.first = first; 
        this.hidden = hidden;
        this.out = out;
        this.hidden_weights = hidden_weights;
        this.out_weights = out_weights;
        this.rate = rate;
        this.accur = 0;
    }
    sigmoid(input){
        let output = 1/(1+(Math.exp(-input)));
        return output;
    }
    forwardPass(inputs){
        let hiddenoutputs = [this.hidden];
        for(let i = 0; i < this.hidden; i++){
            let sum_weighted = 0;
            for(let j = 0; j < inputs.length;j++){
                sum_weighted += (inputs[j] * this.hidden_weights[j][i]);
            }
            let out = sum_weighted;
            hiddenoutputs[i] = this.sigmoid(out);
        }

        let outlayeroutputs = [this.out];
        for(let i = 0; i < this.out; i++){
            let sum_weighted = 0;
            for(let j = 0; j < this.hidden;j++){
                sum_weighted += (hiddenoutputs[j] * this.out_weights[j][i]);
            }
            let out = sum_weighted;
            outlayeroutputs[i] = this.sigmoid(out);
        }
        return [hiddenoutputs,outlayeroutputs];
    } 
    backError(input, hiddenlayput,outlayput,desiredOutput){
        let outputLayerBetas = [this.out];
        for(let i = 0; i < 3; i++){
            if(desiredOutput == i){
                outputLayerBetas[i] = (1-outlayput[i]);
            } else {
                outputLayerBetas[i] = (0-outlayput[i]);
            }
        }
        let hidLayerBetas = [this.hidden];
        let value = 0;
        for(let i = 0 ; i < 2;i++){
            value = 0;
            for(let w = 0; w < 3; w++){
                value += this.out_weights[i][w] * outlayput[w] * (1-outlayput[w]) * outputLayerBetas[w];
            }
            hidLayerBetas[i] = value;
        }
        console.log("Okay -->");
       // let DeOutputLayerWeights = [this.hidden][this.out];
       let DeOutputLayerWeights = [[],[]];
        console.log(DeOutputLayerWeights);
        let weight = 0;
        //for(let i = 0; i < DeOutputLayerWeights.length;i++){
            for(let i = 0; i < this.hidden;i++){
            weight = 0;
           // for(let w = 0; w < DeOutputLayerWeights[0].length;w++){
            for(let w = 0; w < this.out;w++){
                weight = this.rate * hiddenlayput[i] * outlayput[w] * (1-outlayput[w]) * outputLayerBetas[w];
                DeOutputLayerWeights[i][w] = weight;
            }
        }
        let DeHiddenLayerWeights = [[this.first],[this.hidden]];
        let weightV = 0;
        for(let i = 0; i < DeHiddenLayerWeights.length;i++){
            weightV = 0;
            for(let w = 0; w < DeHiddenLayerWeights[0].length;w++){
                weightV = this.rate * input[i] * hiddenlayput[w] * (1-hiddenlayput[w]) * hidLayerBetas
                DeHiddenLayerWeights[i][w] = weight;
            }
        }
        this.updateWeights(DeOutputLayerWeights,DeHiddenLayerWeights);
        return [DeOutputLayerWeights,DeHiddenLayerWeights];
    }
    updateWeights(OutputLayerWeight, HiddenLayerWeight)
    {
        for(let i = 0; i < this.hidden_weights.length;i++){
            for(let j = 0; j < this.hidden_weights[0].length;j++){
                this.hidden_weights[i][j] += HiddenLayerWeight[i][j]
            }
        }
        for(let i = 0; i < this.out_weights.length;i++){
            for(let j = 0; j < this.out_weights[0].length;j++){
                this.out_weights[i][j] += OutputLayerWeight[i][j]
            }
        }
    }
    train(data, desiredOutput,epochs){
        for(let i = 0; i < epochs;i++){
            console.log("Epoch --> " + i);
            let predicts = [data.length];
            for(let j = 0; j < data.length; j++){
                let value = data[i];
                let output = this.forwardPass(value);
                console.log(output[0]);
                let weights = this.backError(value,output[0],output[1],desiredOutput[i]);
                let predictedClass = this.classify(output[1]);
                predicts[j] = predictedClass;
                this.updateWeights(weights[0],weights[1]);
            }
        console.log("Hidden layer Weight -->" + this.hidden_weights);
        console.log("Output layer Weight -->" + this.out_weights);
        let acc = this.Accur(desiredOutput[i],predicts[i]);
        console.log("acc= " + (this.accur*100)/epochs);
        }
        
    }
    predict(instances){
        let predictions = [instances.length];
        for(let i = 0; i < instances.length;i++){
            let instance = instances[i];
            let outputs = this.forwardPass(instance);
            let predClass = this.classify(outputs[1]);
            predictions[i] = predClass;
        }
        return predictions;
    }
    classify(output){
        let max = 0; 
        let ot = 10;
        for(let i = 0; i < output.length;i++ ){
            if(output[i] > max){
                max = output[i];
                out = i;
            }
        }
        return ot;
    }
    Accur(i,j){
        if(i == j){
            return accur
        } else {
            accur--;
            return accur;
        }
    }
}
class Rescaler{
    constructor(File){
        this.min = [File[0].length];
        this.max = [File[0].length];
        for(let j = 0; j < File[0].length;j++){
            let temp = [];
        for(let i = 0; i < File.length;i++){
                temp[i] = File[i][j];
               // console.log(File[i][j]);
            }
           // console.log(temp);
            this.min[j] = Math.min(...temp);
            this.max[j] = Math.max(...temp);
           
        }
       
    }
    rescale(File){
        //let instances;
        for(let i = 0; i< File.length; i++){
           for(let j = 0; j < File[0].length;j++){
               File[i][j] = (File[i][j] - this.min[j]) / (this.max[j] - this.min[j]);
           }
        }
        return File;
    }
    print(){
        console.log(this.min);
        console.log(this.max);
    }
}