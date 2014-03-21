var World = new function() 
{
	var w = 800;
	var h = 800;

	var intervalID;
	var FRAMERATE = 60;
			
	var CURRENT_CELLS = 0;
	var NUMBER_OF_CELLS =  512;
	var TRAILS = 0.1;
	var DEVIATION = 0.9;
	var SIZE = 1.0;
	var COMPACTNESS = 1.0;	//0.2 to 2.0
	var BIRTH_RATE = 1.0; //1 to 10
	var GROWTH_RATE = 1.0;	//0.1 to 1.0
	
	var WAIT_FOR_GROWTH = 0;

	var center = new Position();
	center.x = w/2;
	center.y = h/2;

	var phi = (1+Math.sqrt(5))/2;            // golden ratio
	var golden_angle = phi*2*Math.PI;        // golden angle
	var final_radius = w * SIZE;
	var final_area = Math.pow(final_radius,2)*Math.PI;
	var mean_area = final_area / NUMBER_OF_CELLS;
	var min_area = mean_area * (1-DEVIATION);
	var max_area = mean_area * (1+DEVIATION);
	
	var mousePos = { x:0, y:0 };

	// The canvas and its 2D context
	var canvas;
	var context;
	
	// Some useful objects
	function Position()
	{
	  this.x = 0.0;
	  this.y = 0.0;
	}
	
	function Cell()
	{  
		this.position = new Position;
		this.alive = 0;
	  this.current_age =  0;
	  this.max_age = 0;
		this.area = 0;
		this.radiue = 0;
	}
	
	// Our Cells array
	var cells = [];
	
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
		button1: null,
		button1State: null,
		button2: null,
		button2State: null		
	};
	
	/**
	 * Initializes the world and rendering.
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
			ui.slider1.addEventListener('click', slider1Event, false);
			ui.slider2 = document.getElementById('slider2');
			ui.slider2Value = document.getElementById('slider2Value');
			ui.slider2.addEventListener('click', slider2Event, false);
			ui.slider3 = document.getElementById('slider3');
			ui.slider3Value = document.getElementById('slider3Value');
			ui.slider3.addEventListener('click', slider3Event, false);
			ui.slider4 = document.getElementById('slider4');
			ui.slider4Value = document.getElementById('slider4Value');
			ui.slider4.addEventListener('click', slider4Event, false);
			ui.slider5 = document.getElementById('slider5');
			ui.slider5Value = document.getElementById('slider5Value');
			ui.slider5.addEventListener('click', slider5Event, false);
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

			// Now create some cells
			for(var i = 0; i < NUMBER_OF_CELLS; i++)
			{
				cells.push(new Cell);
			}
						
			initUI();
		}
	}
	
	function resetCells()
	{
		clearInterval(intervalID);

		CURRENT_CELLS = 0;			
		cells = [];
		cells = new Array(NUMBER_OF_CELLS);
		for(var i = 0; i < NUMBER_OF_CELLS; i++)
		{
			cells[i] = new Cell;
		}
			
		// Initiate the main render loop of the game
		intervalID = setInterval( loop, 1000 / FRAMERATE );	
	}
	
	function initUI()
	{
		ui.slider0.value = NUMBER_OF_CELLS;
		ui.slider0Value.innerHTML = NUMBER_OF_CELLS;
		ui.slider1.value = DEVIATION * 100.0;
		ui.slider1Value.innerHTML = (DEVIATION).toFixed(3);
		ui.slider2.value = SIZE * 100.0;
		ui.slider2Value.innerHTML = (SIZE).toFixed(3);
		ui.slider3.value = COMPACTNESS * 100.0;
		ui.slider3Value.innerHTML = (COMPACTNESS).toFixed(3);
		ui.slider4.value = BIRTH_RATE * 10.0;
		ui.slider4Value.innerHTML = (BIRTH_RATE).toFixed(3);
		ui.slider5.value = GROWTH_RATE * 100.0;
		ui.slider5Value.innerHTML = (GROWTH_RATE).toFixed(3);
		
		if( WAIT_FOR_GROWTH )
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
		NUMBER_OF_CELLS =  ui.slider0.value;
		ui.slider0Value.innerHTML = NUMBER_OF_CELLS;
		console.log(NUMBER_OF_CELLS);		
		
		resetCells();
	}
	
	function slider1Event(event)
	{
		DEVIATION =  ui.slider1.value / 100.0;
		ui.slider1Value.innerHTML = DEVIATION;
		console.log(DEVIATION);			
		
		min_area = mean_area * (1-DEVIATION);
		max_area = mean_area * (1+DEVIATION);	

		resetCells();
	}	
	
	function slider2Event(event)
	{
		SIZE =  ui.slider2.value / 100.0;
		ui.slider2Value.innerHTML = SIZE;
		console.log(SIZE);			
	
		final_radius = w * SIZE;
		final_area = Math.pow(final_radius,2)*Math.PI;
		mean_area = final_area / NUMBER_OF_CELLS;
		min_area = mean_area * (1-DEVIATION);
		max_area = mean_area * (1+DEVIATION);
	
		resetCells();	
	}	
	
	function slider3Event(event)
	{
		COMPACTNESS = ui.slider3.value / 100.0;
		ui.slider3Value.innerHTML = COMPACTNESS;
		console.log(COMPACTNESS);			
	
			resetCells();	
	}	

	function slider4Event(event)
	{
		BIRTH_RATE = ui.slider4.value / 10.0;
		ui.slider4Value.innerHTML = BIRTH_RATE;
		console.log(BIRTH_RATE);			
	
		resetCells();	
	}	

	function slider5Event(event)
	{
		GROWTH_RATE = ui.slider5.value / 100.0;
		ui.slider5Value.innerHTML = GROWTH_RATE;
		console.log(GROWTH_RATE);			
	
		resetCells();	
	}	
	
	function button1Event()
	{	
		WAIT_FOR_GROWTH = !WAIT_FOR_GROWTH;
		if( WAIT_FOR_GROWTH )
		{
			ui.button1.setAttribute( "class", "button on" );
			ui.button1State.innerHTML = "ON";
		}
		else 
		{
			ui.button1.setAttribute( "class", "button" );
			ui.button1State.innerHTML = "OFF";
		}
		
		resetCells();			
	}

	function button2Event()
	{	
		CURRENT_CELLS = 0;
		//NUMBER_OF_CELLS =  512;
		DEVIATION = Math.random();
		SIZE = Math.random();
		COMPACTNESS = (Math.random() * 5.0);	//0.2 to 2.0
		BIRTH_RATE = (Math.random() * 10.0); //1 to 10
		GROWTH_RATE = Math.random();	//0.1 to 1.0		
		WAIT_FOR_GROWTH = Math.round( Math.random() );
	
		initUI();
		resetCells();
	}	
		/**
	 * update function.
	 */
    function update()
	{		
		var dead_cells = 0;
		var cumulatative_area = 0;
		for (var i = 0; i < CURRENT_CELLS; i++) 
		{

			var ratio = i / NUMBER_OF_CELLS;
			var angle = i*golden_angle;

			cells[i].area = min_area + ratio * (max_area - min_area);
			cells[i].radius = Math.sqrt( cells[i].area / Math.PI );
			cumulatative_area += cells[i].area;

			//dormant
			if( cells[i].alive == 0 )
			{
				//born
				cells[i].alive = 1;
				cells[i].max_age = cells[i].radius;
			}
			else
			{
				//growing
				if( cells[i].current_age < cells[i].max_age )
				{
					cells[i].alive = 2;
					cells[i].current_age += GROWTH_RATE;
				}
				else
				{
					//dead
					cells[i].alive == -1;
					dead_cells += 1;
				}
			}

			var spiral_radius = Math.sqrt( cumulatative_area / Math.PI );
			cells[i].position.x = center.x + Math.cos(angle) * spiral_radius;
			cells[i].position.y = center.y + Math.sin(angle) * spiral_radius;

			//Fake shadow
			context.beginPath();
			context.fillStyle="rgba(30, 30, 30, 0.5)";
			context.arc(cells[i].position.x+2.0, cells[i].position.y+2.0, cells[i].current_age * COMPACTNESS * 1.1, 0, 2*Math.PI, false);
			context.fill();
			context.closePath();		

			//Cell
			context.beginPath();
			context.strokeStyle="rgba(0, 0, 0)";
			context.fillStyle="rgba(255, 255, 255, 1.0)";

			context.arc(cells[i].position.x, cells[i].position.y, cells[i].current_age * COMPACTNESS, 0, 2*Math.PI, false);
			context.stroke();
			context.fill();
			context.closePath();		
		}	 
		
		if( WAIT_FOR_GROWTH == 0 )
		{
			if(CURRENT_CELLS < NUMBER_OF_CELLS)
				CURRENT_CELLS += BIRTH_RATE;
		}
		else
		{
			if( dead_cells == CURRENT_CELLS )
			{
				if(CURRENT_CELLS < NUMBER_OF_CELLS)
				{
					CURRENT_CELLS += BIRTH_RATE;
					CURRENT_CELLS = Math.round( CURRENT_CELLS );
				}
			}		
		}
		
		if( CURRENT_CELLS > NUMBER_OF_CELLS)
			CURRENT_CELLS = NUMBER_OF_CELLS;
	  
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
		context.fillStyle = "rgba(0,0,0,"+TRAILS+")";
		context.fillRect( 0, 0, w, h );
			
		update();
	};

};

//init our object
World.initialize();




  

