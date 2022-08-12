 const carCanvas = document.getElementById("carCanvas");
 carCanvas.width = (window.innerWidth > 500)?200:window.innerWidth*0.3;
 const networkCanvas = document.getElementById("networkCanvas");
 networkCanvas.width = carCanvas.width*1.5;

const carCtx = carCanvas.getContext("2d");
const networkCtx = carCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9,3);

const carWidth = road.laneWidth/2;
const carHeigth = carWidth/3*5;




let numberOfCars = 200;
let SensorAngle = 90;
let totalSensorRay = 7;
let cars=[];
let traffic=[];
let startPos = 100;
let longestDistance=-200;
this.reboot = false;
let mutation = 0.4;
let finishLine = 0;
createElements();

adjustSliders();




animate();

function setClones(val){
  numberOfCars = val;
  reboot = true;
}
function setSensorAngle(angle){  
  SensorAngle = angle;
  reboot = true;
}
function setSensorRayCount(rayCount){
  totalSensorRay = rayCount;
  reboot = true;
}
function setMutationLevel(mut){
  let mutationLevel = [0.4, 0.3, 0.2, 0.1, 0.07,
    0.05, 0.03, 0.02, 0.01, 0.005];
  mutation = mutationLevel[mut-1];
  reboot = true;
}

function adjustSliders(){
  let slClones = document.getElementById('slClones');
  document.getElementById('spClones').innerHTML = slClones.value*10;
  slClones.addEventListener("input", (e)=>{
    setClones(e.target.value*10);
    document.getElementById('spClones').innerHTML = slClones.value*10;
  });
  let slSensores = document.getElementById('slSensores');
  document.getElementById('spSensores').innerHTML = slSensores.value;
  slSensores.addEventListener("input", (e)=>{
    setSensorRayCount(e.target.value);
    document.getElementById('spSensores').innerHTML = slSensores.value;
  });
  let slAngle = document.getElementById('slAngle');
  document.getElementById('spAngle').innerHTML = slAngle.value + "°";
  slAngle.addEventListener("input", (e)=>{
    setSensorAngle(e.target.value);
    document.getElementById('spAngle').innerHTML = slAngle.value + "°";
  });
  let slMutation = document.getElementById('slMutation');
  document.getElementById('spMutation').innerHTML = mutation;
  slMutation.addEventListener("input", (e)=>{
    setMutationLevel(e.target.value);
    document.getElementById('spMutation').innerHTML = mutation;
  });

}


function createElements(){
  cars=null;
  traffic=null;
  cars = generateCars(numberOfCars);
  loadBrain();
  traffic = createRandomTrafic();
/*
t = (piB - piA) / (viA - viB)
IntPt = t * viA
*/
  let piT = traffic[traffic.length-1].y;
  let piC = cars[cars.length-1].y;
  vT = traffic[traffic.length-1].maxSpeed;
  vC = cars[cars.length-1].maxSpeed;
  finishLine = ((piT - piC)/(vC - vT)) * vC - 400;
 
}

function restart(){
  this.reboot = true;
}

function save(){
  localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}

function discard(){
  localStorage.removeItem("bestBrain");
}

function loadBrain(){
  if (localStorage.getItem("bestBrain")){
    for (let i = 0; i < cars.length; i++){
      cars[i].brain = JSON.parse(
        localStorage.getItem("bestBrain"));
      if (i!=0){
        NeuralNetwork.Mutate(cars[i].brain, mutation);
      }
    }
  }
}

function generateCars(numberOfCars) {
  const cars=[];
  for (let i = 0; i < numberOfCars; i++){
    cars.push(new Car(road.getLaneCenter(1), 100, carWidth, carHeigth, "AI", 3,totalSensorRay));
    cars[i].sensor.setSensorAngle(SensorAngle);
  }
  bestCar = cars[0];
  return cars;
}

function createRandomTrafic(){
  let traffic=[];

  traffic.push(new Car(road.getLaneCenter(1), -100, carWidth, carHeigth, "DUMMY", 2));
  traffic.push(new Car(road.getLaneCenter(0), -280, carWidth, carHeigth, "DUMMY", 2));
  traffic.push(new Car(road.getLaneCenter(2), -280, carWidth, carHeigth, "DUMMY", 2));
  traffic.push(new Car(road.getLaneCenter(1), -460, carWidth, carHeigth, "DUMMY", 2));

  traffic.push(new Car(road.getLaneCenter(0), -640, carWidth, carHeigth, "DUMMY", 2));
  traffic.push(new Car(road.getLaneCenter(1), -640, carWidth, carHeigth, "DUMMY", 2));
  traffic.push(new Car(road.getLaneCenter(1), -820, carWidth, carHeigth, "DUMMY", 2));
  traffic.push(new Car(road.getLaneCenter(2), -820, carWidth, carHeigth, "DUMMY", 2));
        

  for (let i = 5; i < 20; i++){
    let lane = Math.floor(Math.random()*3);
    let pos = -100 - i*180;
    switch (lane){
      case 0:
        traffic.push(new Car(road.getLaneCenter(1), pos, carWidth, carHeigth, "DUMMY", 2));
        traffic.push(new Car(road.getLaneCenter(2), pos, carWidth, carHeigth, "DUMMY", 2));
        break;
      case 1:
        traffic.push(new Car(road.getLaneCenter(0), pos, carWidth, carHeigth, "DUMMY", 2));
        traffic.push(new Car(road.getLaneCenter(2), pos, carWidth, carHeigth, "DUMMY", 2));
        break;
      case 2:
        traffic.push(new Car(road.getLaneCenter(0), pos, carWidth, carHeigth, "DUMMY", 2));
        traffic.push(new Car(road.getLaneCenter(1), pos, carWidth, carHeigth, "DUMMY", 2));
        break;    
    }
  }
  return traffic;
}


function animate(){
  for (let i = 0; i < traffic.length;i++){
    traffic[i].update(road.borders,[]);
  }
let demagedCars = 0;
  for (let i = 0; i < cars.length; i++){
    cars[i].update(road.borders, traffic);
    if (cars[i].y > bestCar.y+carHeigth*4){
      cars[i].demaged = true;
    }
    demagedCars = (cars[i].demaged)?demagedCars+1:demagedCars;
  }
  
  bestCar = cars.find(
    c=>c.y==Math.min(
      ...cars.map(c=>c.y)
    )
  );

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height*0.75);
 
  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++){
    traffic[i].draw(carCtx, "red");
  }

  carCtx.globalAlpha = 0.3;
    for (let i = 1; i < cars.length; i++){
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  
  cars[0].draw(carCtx, "green");
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  if (demagedCars > cars.length-2 || finishLine>bestCar.y || reboot){
    if (bestCar.y < longestDistance){      
      longestDistance = bestCar.y;
    }
    if (!reboot){
      save();
    }
    createElements();
    this.reboot = false;
  }
  document.getElementById("travel").textContent = Math.abs(bestCar.y-startPos).toFixed(0);
  //Visualizer.drawNetwork(networkCtx, cars[0].brain);
  requestAnimationFrame(animate);
}