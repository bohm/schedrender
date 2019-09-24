
function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours
    // (i.e. no clustering). This is ideal for creating easily
    // distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from:
    // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}


// Draw the grid.
function DrawGrid()
{
	var gridLayer = new Konva.Layer();
	var padding = blockSnapSize;
	console.log(width, padding, width / padding);
	for (var i = 0; i < width / padding; i++) {
		gridLayer.add(new Konva.Line({
			points: [Math.round(i * padding) + 0.5, 0, Math.round(i * padding) + 0.5, height],
			stroke: '#ddd',
			strokeWidth: 1,
		}));
	}

	gridLayer.add(new Konva.Line({points: [0,0,10,10]}));
	for (var j = 0; j < height / padding; j++) {
		gridLayer.add(new Konva.Line({
		points: [0, Math.round(j * padding), width, Math.round(j * padding)],
		stroke: '#ddd',
		strokeWidth: 0.5,
		}));
	}

	return gridLayer;
}


function UpdateJobText(j)
{
	var rect = jobRects[j];
	var label = jobLabels[j];
	var relDate = (rect.x() - jobLeftHorMargin) / parseFloat(blockSnapSize);
	var procTime = rect.width() / parseFloat(blockSnapSize);

	var line = 'J' + j + ' r: ' + relDate.toFixed(2) + ', p: ' + procTime.toFixed(2);
	label.text(line);
	topLayer.batchDraw();
}

// Possible TODO: write a clean function instead of accessing global vars.
function AddJob()
{
    // Add job rectangle.
    var rect = new Konva.Rect({
		x: jobLeftHorMargin,
		y: topMargin + jobs*jobArea,
		width: initialJobWidth,
		height: jobHeight,
		fill: 'red',
		name: 'rect',
		stroke: 'black',
		strokeScaleEnabled: false,
		draggable: true,
		dragBoundFunc: function(pos) {
			return {
				x: pos.x,
				y: this.absolutePosition().y
			};
		}
	});

	rect.jobIndex = jobs;

	jobRects.push(rect);
	topLayer.add(rect);		

	// Add rectangle transformer.
	var tr = new Konva.Transformer({
		rotateEnabled: false,
		enabledAnchors: ['middle-left', 'middle-right'],
    ignoreStroke: true
	});
	topLayer.add(tr);
	tr.attachTo(rect);


	// Add job label.
	var label = new Konva.Text({
		x: 30,
		y: topMargin + jobs*jobArea + 20,
		fontSize: 20,
		text: '',
		draggable: false
	});

	label.jobIndex = jobs;

	rect.on('dragmove', function(evt) {
		UpdateJobText(evt.target.jobIndex);
	});

	rect.on('transform', function() {
		rect.setAttrs({
			width: rect.width() * rect.scaleX(),
			height: rect.height() * rect.scaleY(),
			scaleX: 1,
			scaleY: 1
		});
		UpdateJobText(this.jobIndex);
	});

	jobLabels.push(label);
	topLayer.add(label);

	UpdateJobText(jobs);
	jobs++;		
  }

class Coordinate
{
    x;
    y;
    constructor(x, y)
    {
	this.x = x;
	this.y = y;
    }
}

class VisualSchedule
{
    top;
    machineHeight;
    machineMargin;
    horUnit; // horizontal unit -- how many pixel is one unit of time in the schedule
    palette = null;
    layer;
    
    constructor(topX, topY, machineHeight, machineMargin, horUnit, layer)
    {
	this.top = new Coordinate(topX, topY);
	this.machineHeight = machineHeight;
	this.machineMargin = machineMargin;
	this.horUnit = horUnit;
	this.layer = layer; // Konva layer.
    }

    // Keep in mind that machines are zero-indexed.
    ComputeUnitPosition(machine, startTime, allocatedSpeed)
    {
	var y = this.top.y + machine*this.machineHeight + machine*this.machineMargin;
	// add also the already allocated speed
	y += allocatedSpeed*this.machineHeight;
	var x = this.top.x + startTime * this.horUnit;
	return new Coordinate(x,y);
    }

    RenderExecutionUnit(ex, allocatedSpeed)
    {
	var coords = this.ComputeUnitPosition(ex.machine, ex.start, allocatedSpeed);

	var color = "#ffffff";
	if (this.palette != null)
	{
	    color = this.palette[ex.jobID];
	}

	console.log("Drawing new execution unit at " + coords.x.toString() + ", " + coords.y.toString());
	console.log("Color: " + color + ", machine: " + ex.machine
		    + ", start: " + ex.start + ", all. speed: " + allocatedSpeed);

	var drawnUnit = new Konva.Rect({
	    x: coords.x,
	    y: coords.y,
	    fill: color,
	    height: ex.speed * this.machineHeight,
	    width: (ex.end - ex.start) * this.horUnit,
	    // stroke: "black",
	    // strokeWidth: 2
	});

	this.layer.add(drawnUnit);
    }
    
    RenderSchedule(sched, palette)
    {
	// First, set the palette.
	if(palette !=  null)
	{
	    this.palette = palette;
	}

	// If the palette is still empty, generate one from scratch.
	if (this.palette == null)
	{
	    this.palette = [];
	    for (let j = 0; j < sched.jobs.length; j++)
	    {
		this.palette.push(rainbow(sched.jobs.length, j));
	    }
	}
	
	var msched = new MachineSchedule(sched);
	msched.decompose();
	msched.sortStartTimes();

	for (let machine = 0; machine < msched.m; machine++)
	{
	    let curTime = 0.0;
	    let curAllocSpeed = 0.0;
	    for (let ex of msched.loads[machine])
	    {
		if (ex.start > curTime)
		{
		    curTime = ex.start;
		    curAllocSpeed = 0.0;
		}

		this.RenderExecutionUnit(ex, curAllocSpeed);
		curAllocSpeed += ex.speed;
	    }
	}

	this.layer.draw();
    }
}
