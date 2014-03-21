var World = new function() 
{
	var RENDER_MODE = 0;
	var RENDER_SIZE = 500;
	var GRID_SIZE = 100;
	var CELL_SIZE = RENDER_SIZE/GRID_SIZE;
	
	var intervalID;
	var FRAMERATE = 25;
	var TRAILS = 0.1;
	
	//Reaction Diffusion coefficients
	var Da = 1.0;
	var Db = 0.2;
	var feed = 0.037;
	var kill = 0.06;
	var dT =  1.0;
	
	var mouseDown = 0;
	
	var w = GRID_SIZE;
	var h = GRID_SIZE;
	
	// The canvas and its 2D context
	var canvas;
	var context;
	var cells;

	var current_preset = 0;
	var presets = [
    {
		feed: 0.037,
        kill: 0.06
    },
    { // Maze
        feed: 0.08,
        kill: 0.06
    },
    { // Growing Dots
        feed: 0.072,
        kill: 0.072
    },
    { // Maze
        feed: 0.07,
        kill: 0.06
    },
    { // XXX
        feed: 0.06,
        kill: 0.065
    },
    { // XXX
        feed: 0.045,
        kill: 0.065
    }
	];
	
	function Cell()
	{
	  this.chemA = 1.0;//Math.random();//1.0;
	  this.chemB = 0.0;//1.0-this.chemA;//0.0;
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
		button1: null,
		button2: null,
		button3: null,
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
			// Init Cells
			initCells();

			// Create our 2D context
			context = canvas.getContext('2d');		
			
			// Setup our canvas
			canvas.width = w;
			canvas.height = h;
			canvas.style.left = (window.innerWidth - w)/2+'px';
			if(window.innerHeight>h)
			canvas.style.top = (window.innerHeight - h)/2+'px';

			//Add an mouse listener
			canvas.addEventListener('mousedown', function(event) {
				event.preventDefault();
				mouseDown = 1;
				mousePos = mouseCoord(canvas, event);
				//console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
				
				cells[Math.floor(mousePos.x/CELL_SIZE)][Math.floor(mousePos.y/CELL_SIZE)].chemA = 0.0;
				cells[Math.floor(mousePos.x/CELL_SIZE)][Math.floor(mousePos.y/CELL_SIZE)].chemB = 1.0;
				
				}, false);
			canvas.addEventListener('mousemove', function(event) {
				if(mouseDown == 1)
				{
					event.preventDefault();
					mousePos = mouseCoord(canvas, event);
					//console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
					
					cells[Math.floor(mousePos.x/CELL_SIZE)][Math.floor(mousePos.y/CELL_SIZE)].chemA = 0.0;
					cells[Math.floor(mousePos.x/CELL_SIZE)][Math.floor(mousePos.y/CELL_SIZE)].chemB = 1.0;
				}
				}, false);
			canvas.addEventListener('mouseup', function(event) {
					mouseDown = 0;
				}, false);
				
			// Init UI
			initUI();

			// Start Rendering
			loop();
		}
	}
	function initUI()
	{
		// Setup our UI
		ui.slider0 = document.getElementById('slider0');
		ui.slider0Value = document.getElementById('slider0Value');
		ui.slider0.addEventListener('change', slider0Event, false);
		
		ui.slider1 = document.getElementById('slider1');
		ui.slider1Value = document.getElementById('slider1Value');
		ui.slider1.addEventListener('change', slider1Event, false);
		
		ui.slider2 = document.getElementById('slider2');
		ui.slider2Value = document.getElementById('slider2Value');
		ui.slider2.addEventListener('change', slider2Event, false);
		
		ui.slider3 = document.getElementById('slider3');
		ui.slider3Value = document.getElementById('slider3Value');
		ui.slider3.addEventListener('change', slider3Event, false);

		ui.button1 = document.getElementById('button1');
		ui.button1.addEventListener('click', button1Event, false);		

		ui.button2 = document.getElementById('button2');
		ui.button2.addEventListener('click', button2Event, false);		
		
		ui.button3 = document.getElementById('button3');
		ui.button3.addEventListener('click', button3Event, false);		

		// Setup values
		ui.slider0.value = Da*100;
		ui.slider0Value.innerHTML = Da;
	
		ui.slider1.value = Db*100;
		ui.slider1Value.innerHTML = Db;

		ui.slider2.value = feed*1000;
		ui.slider2Value.innerHTML = feed;

		ui.slider3.value = kill*1000;
		ui.slider3Value.innerHTML = kill;
	}
	function clearCells()
	{
		for (x=0; x <GRID_SIZE; x++)
		{
			for (y=0; y <GRID_SIZE; y++)
			{
				cells[x][y].chemA = 1.0;
				cells[x][y].chemB = 0.0;
			}
		}
	}
	function randomizeCells()
	{
		for (x=0; x <GRID_SIZE; x++)
		{
			for (y=0; y <GRID_SIZE; y++)
			{
				cells[x][y].chemA = Math.random();
				cells[x][y].chemB = 1.0-cells[x][y].chemA;
			}
		}
	}
	function initCells()
	{
		cells = new Array(GRID_SIZE);
		for (i=0; i <GRID_SIZE; i++)
		{
			cells[i] = new Array(GRID_SIZE);
		}
		
		for (x=0; x <GRID_SIZE; x++)
		{
			for (y=0; y <GRID_SIZE; y++)
			{
				cells[x][y] = new Cell;
			}
		}		
		
		randomizeCells();
	}
	laplacianCell = function(x, y)
	{
		//work out our neighbourhood indices
		//and deal with boundaries as a continium
		x_minus = x - 1;
		if( x_minus < 0 ) x_minus = GRID_SIZE-1;
		x_plus = x + 1;
		if( x_plus > GRID_SIZE-1 ) x_plus = 0;
		y_minus = y - 1;
		if( y_minus < 0 ) y_minus = GRID_SIZE-1;
		y_plus = y + 1;
		if( y_plus > GRID_SIZE-1 ) y_plus = 0;
		
		w1 = -1.0;
		w2 = 0.25;
		//w3 = 0.0;
		
		//evaluate the laplacian
		c = new Cell;
		c.chemA = /*w3*(cells[x_minus][y_minus].chemA + cells[x_plus][y_plus].chemA + cells[x_plus][y_minus].chemA + cells[x_minus][y_plus].chemA) 
				+*/ w2*(cells[x_minus][y].chemA + cells[x_plus][y].chemA + cells[x][y_minus].chemA + cells[x][y_plus].chemA) 
				+ w1*cells[x][y].chemA;

		c.chemB = /*w3*(cells[x_minus][y_minus].chemB + cells[x_plus][y_plus].chemB + cells[x_plus][y_minus].chemB + cells[x_minus][y_plus].chemB) 
				+*/ w2*(cells[x_minus][y].chemB + cells[x_plus][y].chemB + cells[x][y_minus].chemB + cells[x][y_plus].chemB) 
				+ w1*cells[x][y].chemB;

		return c;
	}
	
	function updateCells()
	{
		imageData = context.createImageData(GRID_SIZE, GRID_SIZE);
		for (x=0; x <GRID_SIZE; x++)
		{
			for (y=0; y <GRID_SIZE; y++)
			{
				lap = laplacianCell(x, y);
			
				oldA = cells[x][y].chemA;
				oldB = cells[x][y].chemB;
				oldABB = (oldA*oldB*oldB);
				
				dU = Da * lap.chemA - oldABB + feed*(1.0-oldA);
				cells[x][y].chemA = oldA + dU * dT;

				dV = Db * lap.chemB + oldABB - (feed + kill)*oldB;
				cells[x][y].chemB = oldB + dV * dT;
				
				rgb = rainbow(cells[x][y].chemA, 1.0);
				//console.log("rgb " + rgb);
				col = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/),
				components = {};
	
	
				//if( RENDER_MODE  == 0 )
				{
					index = (x + y * imageData.width) * 4;
					imageData.data[index+0] = col[0];
					imageData.data[index+1] = col[1];
					imageData.data[index+2] = col[2];
					imageData.data[index+3] = 255;
				}
				/*else
				{				
					context.beginPath();							
					//context.fillStyle = pack(rgbcol[0], rgbcol[1], rgbcol[2]);
					context.fillStyle = rainbow(cells[x][y].chemA, 1.0);
					context.rect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
					context.fill();
					context.closePath();
				}*/
			}
		}
		
		//if( RENDER_MODE  == 0 )
			context.putImageData(imageData, 0, 0); 	
	}
	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	  window.webkitRequestAnimationFrame ||
	  window.mozRequestAnimationFrame    ||
	  function( callback ){
		window.setTimeout(callback, 1000 / 60);
	  };
	})();

	/**
	* The main event loop
	*/
	function loop()
	{			
		//context.clearRect(0, 0, w, h);
		//context.globalCompositeOperation = 'destination-over';
		//context.fillStyle = "rgba(0,0,0,"+TRAILS+")";
		//context.fillRect( 0, 0, w, h );
		requestAnimationFrame(loop);
		updateCells();
	}
	/* Various color utility functions */
	function dec2hex(x) 
	{
		return (x < 16 ? '0' : '') + x.toString(16);
	}
	function hexToRgb(hex) 
	{
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	// Color helpers
	function pack(r, g, b) 
	{
		var r1 = Math.round(r * 255);
		var g1 = Math.round(g * 255);
		var b1 = Math.round(b * 255);
		return 'rgb(' + r1 + ',' + g1 + ',' + b1 + ')';
	}
	function rainbow(length, maxLength)
	{
		var i = (length * 255 / maxLength);
		var r = Math.round(Math.sin(0.024 * i + 0) * 127 + 128);
		var g = Math.round(Math.sin(0.024 * i + 2) * 127 + 128);
		var b = Math.round(Math.sin(0.024 * i + 4) * 127 + 128);
		//console.log("rgb " + r + ", " + g + ", " + b);
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	} 
   //UI events   
   	function mouseCoord(canvas, event) 
	{
		var rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}	
	function slider0Event()
	{
		Da =  ui.slider0.value/ 100.0;
		ui.slider0Value.innerHTML = Da;
		console.log("Da " + Da);
	} 
	function slider1Event()
	{
		Db =  ui.slider1.value/ 100.0;
		ui.slider1Value.innerHTML = Db;
		console.log("Db " + Db);
	} 
	function slider2Event()
	{
		feed =  ui.slider2.value/ 1000.0;
		ui.slider2Value.innerHTML = feed;
		console.log("feed " + feed);
	} 
	function slider3Event()
	{
		kill =  ui.slider3.value/ 1000.0;
		ui.slider3Value.innerHTML = kill;
		console.log("kill " + kill);
	} 
	function button1Event()
	{
		clearCells();
	}
	function button2Event()
	{
		randomizeCells();
	}
	function button3Event()
	{
		current_preset = current_preset + 1;
		if(current_preset > 5) current_preset = 0;
		
		console.log("preset " + current_preset);
		
		feed = presets[current_preset].feed;
		kill = presets[current_preset].kill;
		randomizeCells();
	}
   
};

//init our object
World.initialize();




  

