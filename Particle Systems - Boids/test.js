var World = new function() 
{
	var intervalID;
	var FRAMERATE = 60;
	
	var NEIGHBOURHOOD_RADIUS = 80.0;
	var COLLISION_RADIUS = 20.0;
	var STEERING_LOOKAHEAD = 40.0;
	var STEERING_RADIUS = 80.0;
	var	FOV_ANGLE = 180.0;
	var NUMBER_OF_PARTICLES = 100;
	var TRAILS = 0.1;
	
	var toggle1 = 1;
	var toggle2 = 1;
		
	var w = 800;
	var h = 800;
	var mousePos = { x:0, y:0 };

	// The canvas and its 2D context
	var canvas;
	var context;
	
	// Our particles array
	var particles = [];

	// Some useful objects
	function Position()
	{
	  this.x = 0.0;
	  this.y = 0.0;
	}
	
	function ForceWeights()
	{
	  this.coh = 0.2;
	  this.sep = 1.0;
	  this.alg = 0.5;
	  this.ste = 0.0;
	}
	var weights = new ForceWeights;
	
	function Forces()
	{
	  this.cohX = 0.0;
	  this.cohY = 0.0;
	  this.sepX = 0.0;
	  this.sepY = 0.0;
	  this.algX = 0.0;
	  this.algY = 0.0;
	  this.steX = 0.0;
	  this.steY = 0.0;
	}  
	
	function Particle()
	{  
	  this.x =  Math.round( Math.random() * w);
	  this.y =  Math.round( Math.random() * h);
	  this.rad = 1;
	  this.target_rgba = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 };
	  this.rgba = { r: this.target_rgba.r, g: this.target_rgba.g, b: this.target_rgba.b };
	  this.vx = Math.round( Math.random() * 2) - 1;
	  this.vy = Math.round( Math.random() * 2) - 1;
	}
	
	var ui = 
	{
		slider0: null,
		slider0Value: null,
		slider1: null,
		slider1Value: null,
		slider2: null,
		slider2Value: null,
		slider3: null,
		slider3Value: null,
		slider4: null,
		slider4Value: null,
		slider5: null,
		slider5Value: null,	
		slider6: null,
		slider6Value: null,
		button1: null,
		button1State: null,
		button2: null,
		button2State: null	
	};
	
	/**
	 * Initializes the game world and rendering.
	 */
	this.initialize = function()
	{	
		// Create our Canvas object
		var   canvas = document.querySelector('canvas');
		if(canvas && canvas.getContext)
		{
			// Create our 2D context
			context = canvas.getContext('2d');		

			// Setup our UI
			ui.slider0 = document.getElementById('slider0');
			ui.slider0Value = document.getElementById('slider0Value');
			ui.slider0.addEventListener('click', slider0Event, false);
			
			ui.slider1 = document.getElementById('slider1');
			ui.slider1Value = document.getElementById('slider1Value');
			ui.slider1.addEventListener('change', slider1Event, false);
			
			ui.slider2 = document.getElementById('slider2');
			ui.slider2Value = document.getElementById('slider2Value');
			ui.slider2.addEventListener('change', slider2Event, false);
			
			ui.slider3 = document.getElementById('slider3');
			ui.slider3Value = document.getElementById('slider3Value');
			ui.slider3.addEventListener('change', slider3Event, false);
			
			ui.slider4 = document.getElementById('slider4');
			ui.slider4Value = document.getElementById('slider4Value');
			ui.slider4.addEventListener('change', slider4Event, false);
			
			ui.slider5 = document.getElementById('slider5');
			ui.slider5Value = document.getElementById('slider5Value');
			ui.slider5.addEventListener('change', slider5Event, false);
			
			ui.slider6 = document.getElementById('slider6');
			ui.slider6Value = document.getElementById('slider6Value');
			ui.slider6.addEventListener('change', slider6Event, false);

			ui.slider7 = document.getElementById('slider7');
			ui.slider7Value = document.getElementById('slider7Value');
			ui.slider7.addEventListener('change', slider7Event, false);
					
			ui.button1 = document.getElementById('button1');
			ui.button1State = ui.button1.getElementsByTagName( 'span' )[0];
			ui.button1.addEventListener('click', button1Event, false);		
			
			ui.button2 = document.getElementById('button2');
			ui.button2State = ui.button2.getElementsByTagName( 'span' )[0];
			ui.button2.addEventListener('click', button2Event, false);			
						
			// Setup our canvas
			canvas.width = w;
			canvas.height = h;
			canvas.style.left = (window.innerWidth - w)/2+'px';
			if(window.innerHeight>h)
			canvas.style.top = (window.innerHeight - h)/2+'px';

			//Add an mouse listener
			canvas.addEventListener('mousemove', function(event) {
				mousePos = mouseMove(canvas, event);
				//var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
				//console.log(message);
				}, false);
		
			// Initiate the main render loop of the game
			intervalID = setInterval( loop, 1000 / FRAMERATE );

			// Now create some particles
			for(var i = 0; i < NUMBER_OF_PARTICLES; i++)
			{
				particles.push(new Particle);
			}
			
			initUI();
		}
	}
	
	function initUI()
	{
		ui.slider0.value = NUMBER_OF_PARTICLES;
		ui.slider0Value.innerHTML = NUMBER_OF_PARTICLES;

		ui.slider1.value = weights.coh*100.0;
		ui.slider1Value.innerHTML = weights.coh;

		ui.slider2.value = weights.alg*100.0;
		ui.slider2Value.innerHTML = weights.alg;

		ui.slider3.value = weights.sep*100.0;
		ui.slider3Value.innerHTML = weights.sep;
		
		ui.slider4.value = FOV_ANGLE;
		ui.slider4Value.innerHTML = FOV_ANGLE;

		ui.slider5.value = NEIGHBOURHOOD_RADIUS;
		ui.slider5Value.innerHTML = NEIGHBOURHOOD_RADIUS;
		
		ui.slider6.value = COLLISION_RADIUS;
		ui.slider6Value.innerHTML = COLLISION_RADIUS;	
		
		ui.slider7.value = TRAILS * 100.0;
		ui.slider7Value.innerHTML = TRAILS;	
		
		if( toggle1 )
		{
			ui.button1.setAttribute( "class", "button on" );
			ui.button1State.innerHTML = "ON";
		}
		else 
		{
			ui.button1.setAttribute( "class", "button" );
			ui.button1State.innerHTML = "OFF";
		}
		
		if( toggle2 )
		{
			ui.button2.setAttribute( "class", "button on" );
			ui.button2State.innerHTML = "ON";
		}
		else 
		{
			ui.button2.setAttribute( "class", "button" 	);
			ui.button2State.innerHTML = "OFF";
		}
	}
	/**
	 * Mouse move event.
	 */	
	function mouseMove(canvas, event) 
	{
		var rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}	
	
	function slider0Event(event)
	{
		clearInterval(intervalID);
		
		NUMBER_OF_PARTICLES =  ui.slider0.value;
		ui.slider0Value.innerHTML = NUMBER_OF_PARTICLES;
		console.log(NUMBER_OF_PARTICLES);
		particles = [];
		particles = new Array(NUMBER_OF_PARTICLES);
		for(var i = 0; i < NUMBER_OF_PARTICLES; i++)
		{
			particles[i] = new Particle;
		}
		
		// Initiate the main render loop of the game
		intervalID = setInterval( loop, 1000 / FRAMERATE );
	}
	
	function slider1Event()
	{
		weights.coh =  ui.slider1.value/ 100.0;
		ui.slider1Value.innerHTML = weights.coh;
		console.log(weights.coh);
	}
	
	function slider2Event()
	{
		weights.alg =  ui.slider2.value/ 100.0;
		ui.slider2Value.innerHTML = weights.alg;
		console.log(weights.alg);
	}	
	
	function slider3Event()
	{
		weights.sep =  ui.slider3.value/ 100.0;
		ui.slider3Value.innerHTML = weights.sep;
		console.log(weights.sep);
	}	
	
	function slider4Event()
	{
		FOV_ANGLE =  ui.slider4.value;
		ui.slider4Value.innerHTML = FOV_ANGLE;
		console.log(FOV_ANGLE);
	}
	
	function slider5Event()
	{
		NEIGHBOURHOOD_RADIUS =  ui.slider5.value;
		ui.slider5Value.innerHTML = NEIGHBOURHOOD_RADIUS;
		console.log(NEIGHBOURHOOD_RADIUS);
	}
	
	function slider6Event()
	{
		COLLISION_RADIUS =  ui.slider6.value;
		ui.slider6Value.innerHTML = COLLISION_RADIUS;
		console.log(COLLISION_RADIUS);
	}
	
	function slider7Event()
	{
		TRAILS =  ui.slider7.value/100.0;
		ui.slider7Value.innerHTML = TRAILS;
		console.log(TRAILS);
	}
	
	function button1Event()
	{	
		toggle1 = !toggle1;
		if( toggle1 )
		{
			ui.button1.setAttribute( "class", "button on" );
			ui.button1State.innerHTML = "ON";
		}
		else 
		{
			ui.button1.setAttribute( "class", "button" );
			ui.button1State.innerHTML = "OFF";
		}
	}

	function button2Event()
	{	
		toggle2 = !toggle2;
		if( toggle2 )
		{
			ui.button2.setAttribute( "class", "button on" );
			ui.button2State.innerHTML = "ON";
		}
		else 
		{
			ui.button2.setAttribute( "class", "button" );
			ui.button2State.innerHTML = "OFF";
		}
	}
		
	/**
	 * World update function.
	 */
    function update()
	{
	  
	  for(var i = 0; i < NUMBER_OF_PARTICLES; i++)
	  {
	  /*
		if(i==0)
		{
			particle_i.vx = particles.vy = 0.0;
			particle_i.x = mousePos.x;
			particle_i.y = mousePos.y;
		} */
		
		var factor = 1;	
		var collisions = 0;
		var neighbours = 0;
		var forces = new Forces;
		var dist, v1, v2, angle, len1, len2;
		v1 = new Position;
		v2 = new Position;
		var particle_i = particles[i];
		
		for(var j = 0; j<NUMBER_OF_PARTICLES; j++)
		{
			if( j!=i)
			{	
				var particle_j = particles[j];
				
				var collisionj = 0;
				dist = findDistance(particle_i, particle_j);
				if(dist < NEIGHBOURHOOD_RADIUS )
				{
					neighbours = 1;
					v1.x = particle_j.x - particle_i.x;
					v1.y = particle_j.y - particle_i.y;
					if(dist < COLLISION_RADIUS * 2.0 )
					{
						particle_i.target_rgba.r = particle_j.target_rgba.r;
						particle_i.target_rgba.g = particle_j.target_rgba.g;
						particle_i.target_rgba.b = particle_j.target_rgba.b;
					
						forces.sepX -= v1.x/dist;
						forces.sepY -= v1.y/dist;
						collisions = 1;
						collisionj = 1;
					}
					
					v2.x = particle_i.vx; 
					v2.y = particle_i.vy;
					angle = findAngle(v2, v1);
					angle *=  180.0 / Math.PI;
					if(angle > -FOV_ANGLE/2.0 && angle < FOV_ANGLE/2.0)
					{
						forces.algX += particle_j.vx;
						forces.algY += particle_j.vy;

						forces.cohX += v1.x;
						forces.cohY += v1.y;

						factor++;
						/*
						var v3 = new Position;				
						v3.x = particle_i.x + STEERING_LOOKAHEAD * particle_i.vx;
						v3.y = particle_i.y + STEERING_LOOKAHEAD * particle_i.vy;													
						var v4 = new Position;
						v4.x = particle_j.x + STEERING_LOOKAHEAD * particle_j.vx;
						v4.y = particle_j.y + STEERING_LOOKAHEAD* particle_j.vy;
					
						var dist2 = findDistance(v3, v4);
						if(dist2<STEERING_RADIUS)
						{
							forces.steX += 1.0/dist2*(-v1.x);
							forces.steY += 1.0/dist2*(-v1.y);
							collisions = 1;

							/*context.strokeStyle = '#fff';
							context.fillStyle = '#fff';
							context.beginPath();
							context.arc(v3.x, v3.y, (particle_i.rad)*20.0, 0, Math.PI*2, true);
							context.stroke();
							context.closePath();*/
						//}
						/*else
						{
							context.strokeStyle = '#000';
							context.fillStyle = '#000';					
							context.strokeStyle = particle_i.rgba;
							context.fillStyle = particle_i.rgba;
							context.beginPath();
							context.arc(v3.x, v3.y, (particle_i.rad)*20.0, 0, Math.PI*2, true);
							context.stroke();
							context.closePath();
						}		*/		
						
						if( i == 0 )
						{
									
							if(toggle1)
							{	
								//Connect to neighbours
								context.fillStyle = '#cccccc';
								context.strokeStyle = '#cccccc';	
								context.beginPath();
								context.moveTo(particle_i.x, particle_i.y);
								context.lineTo(particle_j.x, particle_j.y);
								context.stroke();
							}
							if(toggle2)
							{
								if(collisionj)
								{
									context.strokeStyle = '#f00';
									context.fillStyle = '#f00';
									context.beginPath();
									context.arc(particle_j.x, particle_j.y, COLLISION_RADIUS, 0, Math.PI*2, true);
									context.stroke();
									context.closePath();
								}									
							}

						}
					}
				}
			}
		}

		if( i == 0 )
		{
			if(toggle1)
			{
				//FOV arc
				var v11 = new Position;
				v11.x = particle_i.vx;
				v11.y = particle_i.vy;
				
				var v00 = new Position;				
				v00.x = 1;
				v00.y = 0;													
				
				angle0 = findAngle(v00, v11);
				if(angle0>2*Math.PI) angle0 -= Math.PI;
				
				context.fillStyle = '#cccccc';
				context.strokeStyle = '#cccccc';	
				context.strokeStyle = particle_i.rgba;
				context.beginPath();
				angle = FOV_ANGLE * (Math.PI/180.0);
				context.arc(particle_i.x, particle_i.y, NEIGHBOURHOOD_RADIUS, angle0-angle/2.0, angle0+angle/2.0, false);
				context.stroke();
			}
			if(toggle2)
			{
				context.strokeStyle = '#f00';
				context.fillStyle = '#f00';
				context.beginPath();
				context.arc(particle_i.x, particle_i.y, COLLISION_RADIUS, 0, Math.PI*2, true);
				context.stroke();
				context.closePath();
			}
		}
		
		forces.algX /= factor;
		forces.algY /= factor;
		forces.cohX /= factor;
		forces.cohY /= factor;
		//forces.steX /= factor;
		//forces.steY /= factor;

		/*var len1 = findLength(forces.steX, forces.steY);
		if(len1>1.0)
		{
			forces.steX /= len1;
			forces.steY /= len1;
		}  
		particle_i.vx += weights.ste*forces.steX;
		particle_i.vy += weights.ste*forces.steY;
		*/
		if( collisions == 0 )
		{
			len1 = findLength(forces.algX, forces.algY);
			if(len1>1.0)
			{
				forces.algX /= len1;
				forces.algY /= len1;
			}    
			particle_i.vx += weights.alg*forces.algX;
			particle_i.vy += weights.alg*forces.algY;

			len1 = findLength(forces.cohX, forces.cohY);
			if(len1>1.0)
			{
				forces.cohX /= len1;
				forces.cohY /= len1;
			}    
			particle_i.vx += weights.coh*forces.cohX;
			particle_i.vy += weights.coh*forces.cohY;
		}
		else
		{

			len1 = findLength(forces.sepX, forces.sepY);
			if(len1>1.0)
			{
				forces.sepX /= len1;
				forces.sepY /= len1;
			}
			particle_i.vx += weights.sep*forces.sepX;
			particle_i.vy += weights.sep*forces.sepY;
		}
		
		//friction, slow down
	   //particle_i.vx *= 0.98;
	   //particle_i.vy *= 0.98;

	    //accelerate if we have no collision
		/*if( collisions == 0 )
		{
			particle_i.vx *= 1.01;
			particle_i.vy *= 1.01;
		}*/
		
		
		len2 = findLength(particle_i.vx, particle_i.vy);
		if(len2>1.0)
		{
			particle_i.vx /= len2;
			particle_i.vy /= len2;
		}

		
		particle_i.x += particle_i.vx;
		particle_i.y += particle_i.vy;

		if(particle_i.x > w) particle_i.x = 0;
		if(particle_i.x < 0) particle_i.x = w;
		if(particle_i.y > h) particle_i.y = 0;
		if(particle_i.y < 0) particle_i.y = h;
	
		particle_i.rgba.r += (particle_i.target_rgba.r - particle_i.rgba.r) * 0.04;
		particle_i.rgba.g += (particle_i.target_rgba.g - particle_i.rgba.g) * 0.04;
		particle_i.rgba.b += (particle_i.target_rgba.b - particle_i.rgba.b) * 0.04;
	
		context.beginPath();
		context.arc(particle_i.x, particle_i.y, particle_i.rad*10.0, 0, Math.PI*2, true);
		context.fillStyle = 'rgba('+Math.round(particle_i.rgba.r)+','+Math.round(particle_i.rgba.g)+','+Math.round(particle_i.rgba.b)+',1.0)';
		context.fill();
		context.closePath();

		if( i == 0 )
		{			
			/*context.fillStyle = '#ff0000';
			context.strokeStyle = '#ff0000';	 
			context.beginPath();
			context.moveTo(particle_i.x, particle_i.y);
			context.lineTo(particle_i.x+40.0*particle_i.vx, particle_i.y+40.0*particle_i.vy);
			context.stroke();
			context.closePath();*/
		/*	
			context.fillStyle = '#00ff00';
			context.strokeStyle = '#00ff00';	 
			context.beginPath();
			context.moveTo(particle_i.x, particle_i.y);
			context.lineTo(particle_i.x+(1.0/weights.alg)*forces.algX, particle_i.y+(1.0/weights.alg)*forces.algY);
			context.stroke();
			context.closePath();

			context.fillStyle = '#0000ff';
			context.strokeStyle = '#0000ff';	 
			context.beginPath();
			context.moveTo(particle_i.x, particle_i.y);
			context.lineTo(particle_i.x+(1.0/weights.coh)*forces.cohX, particle_i.y+(1.0/weights.coh)*forces.cohY);
			context.stroke();
			context.closePath();
		
			context.fillStyle = '#ff00ff';
			context.strokeStyle = '#ff00ff';	 
			context.beginPath();
			context.moveTo(particle_i.x, particle_i.y);
			context.lineTo(particle_i.x-(1.0/weights.sep)*forces.sepX, particle_i.y-(1.0/weights.sep)*forces.sepY);
			context.stroke();
			context.closePath();*/
		}

	  }
	  
	}
	
	/**
	* Length of a 2D vector.
	*/
	function findLength(x, y)
	{
	  return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
	}

	/**
	* Eucledian distance between 2 2D points.
	*/
	function findDistance(p1, p2)
	{  
	  return Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) );
	}
	
	/**
	* Angle in radians between two 2D vectors.
	*/
	function findAngle(v1, v2)
	{

	  var dot = v1.x*v2.x + v1.y*v2.y;
	  var dotPerp = v1.x*v2.y - v1.y*v2.x;

	  return Math.atan2(dotPerp, dot);
	}

	/**
	* The main event loop
	*/
	function loop()
	{			
		//context.clearRect(0, 0, w, h);
		//context.globalCompositeOperation = 'destination-over';
		context.fillStyle = "rgba(0,0,0,"+TRAILS+")";
		context.fillRect( 0, 0, w, h );
			
		update();
	};

};

//init our object
World.initialize();




  

