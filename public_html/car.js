class Car{
  constructor(x, y, width, height, controlType, maxSpeed=3, sensorRays = 9){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.demaged = false;
    this.asdss = sensorRays;

    this.useBrain = controlType=="AI";

    if(controlType!="DUMMY"){
      this.sensor = new Sensor(this,this.asdss,5);
      this.brain = new NeuralNetwork(
        [this.sensor.rayCount, 6, 4]);
    }

    this.controls = new Controls(controlType );
  }

  update(roadBorders, traffic){
    if (!this.demaged){
      this.#move();
      this.polygon = this.#createPolygon();
      this.demaged = this.#assesDemage(roadBorders, traffic);
    
    if (this.sensor){
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map(
        s=> s==null?0:1-s.offset);
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      
      if (this.useBrain){
        this.controls.forward=outputs[0];
        this.controls.left=outputs[1];
        this.controls.right=outputs[2];
        this.controls.reverse=outputs[3];
      }
    }
    }
  }

  #assesDemage(roadBorders, traffic){
    for (let i = 0; i < traffic.length; i++){
      if (polysIntersect(this.polygon, traffic[i].polygon)){
        return true;
      };
    }    for (let i = 0; i < roadBorders.length; i++){
      if (polysIntersect(this.polygon, roadBorders[i])){
        return true;
      };
    }
    return false;
  }

  #createPolygon(){
    const points = [];
    const rad = Math.hypot(this.width, this.height)/2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x:this.x-Math.sin(this.angle-alpha)*rad,
      y:this.y-Math.cos(this.angle-alpha)*rad
    });
    points.push({
      x:this.x-Math.sin(this.angle+alpha)*rad,
      y:this.y-Math.cos(this.angle+alpha)*rad
    });
    points.push({
      x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
      y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
    });
    points.push({
      x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
      y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
    });
    return points;
  }

  #move(){
    
    //Adjusting acceleration and movement
    //forward and reverse.    
    if (this.controls.forward){
      this.speed += this.acceleration;      
    }
    if (this.controls.reverse){
      this.speed -= this.acceleration;
    }
    if (this.speed > this.maxSpeed){
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed/2){
      this.speed = -this.maxSpeed/2;
    }

    //adjusting turning left and right
    if (this.speed != 0) {
      const flip = this.speed>0?1:-1;
      if (this.controls.left){
        this.angle += 0.03*flip;
      }
      if (this.controls.right){
        this.angle -= 0.03*flip;
      }
    }
    
    //setting the new position of the car
    this.x -= Math.sin(this.angle)*this.speed;
    this.y -= Math.cos(this.angle)*this.speed;

    //aplying the friction to slowdown the car
    //until it stops
    if (this.speed > 0){
      this.speed -= this.friction;
    }
    if (this.speed < 0){
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction){
      this.speed = 0;
    }
  }

  draw(ctx, color, drawSensor=false){
    if (this.demaged){
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++){
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
    if (this.sensor && drawSensor){
      this.sensor.draw(ctx);
    }
    
  }
}


