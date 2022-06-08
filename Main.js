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
        Label = File[i][4];
    }
    return Label;
}
function getInstances(File){
for(let i = 0; i < File.length; i++){
    File[i].splice(-1);
}
return File
}
function rescale(){
    let min = [];
    let max = [];
    let rescaleData = function(File){
        this.min = min[File[0].length];
        this.max = max[File[0].length];

    }
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
    
    //console.log(Test);
}

class Rescaler{
    min = [];
    max = [];
    constructor(File){
        this.min = [File[0].length];
        this.max = [File[0].length];
        for(let i = 0; i < File.length;i++){
            console.log(File[i]);
        }
        console.log(Math.min(...File));
    }
}