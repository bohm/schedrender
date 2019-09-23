// Scheduling logic -- definition of an instance, definition of a schedule, validating feasibility, algorithms.

// Basic functions.

const EPS = Number(0.00001); // our local precision.

// TODO: make this work better. 1000 is an essentially random constant.
function nearlyEqual(a, b) {
    absA = Math.abs(a);
    absB = Math.abs(b);
    diff = Math.abs(a - b);

    if (a == b) {
        return true;
    } else if (a == 0 || b == 0 || diff < 1000 * Number.EPSILON ) {
        // a or b is zero or both are extremely close to it
        // relative error is less meaningful here
        return diff < (1+EPS) * Number.EPSILON;
    } else { // use relative error
        return (diff / (absA + absB)) < EPS;
    }
}

// Sort numbers and throw out duplicates. Derived from https://stackoverflow.com/a/4833835 .
// Possible TODO: check that the array is contiguous.
function sort_unique(arr) {
    if (arr.length == 0) {
	return arr;
    }
    arr.sort((a,b) => (a - b));
    var ret = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
	if (!nearlyEqual(arr[i-1], arr[i])) {
	    ret.push(arr[i]);
	}
    }
    return ret;
}

// Data types.

class Job {
    id;
    deadlineOrder;
    order;
    release;
    deadline;
    ptime;
    executionList = [];
	
    constructor(dlorder, id, release, deadline, ptime)
    {
	this.release = release;
	this.id = id;
	this.ptime = ptime;

	if(dlorder == false)
	{
	    this.deadlineOrder = false;
	    this.deadline = deadline;
	} else
	{
	    this.deadlineOrder = true;
	    this.order = deadline;
	}
    }

    covered()
    {
	var x = Number(0);
	for (const ex of executionList)
	{
	    x += ex.volume();
	}

	if (nearlyEqual(x, this.ptime))
	{
	    return true;
	} else {
	    return false;
	}
    }
}

class ExecutionUnit {
    jobID;
    speed;
    machine;
    start;
    end;
    constructor(j, s, m, s, e) {
		this.jobID = j;
		this.speed = s;
		this.machine = m;
		this.start = s;
		this.end = e;
    }
	
    volume() {
	return (this.end - this.start) * this.speed;
    }

    // Given a sorted timelist (list of times), decomposes this single execution unit into a list (array) of execution units
    // such that no time point in the timelist lies strictly inside any execution unit.
    // Returns the list as the decomposition.
    decompose(sortedTimelist) {
	var openSegmentStart = 0;
	var decomposition = [];
	var openSegment = false;
	for (let t of sortedTimeList)
	{
	    if (t < this.start) {
		continue;
	    }

	    if (NearlyEqual(t,this.start)) {
		// do nothing, wait for the first time strictly greater than start.
		openSegmentStart = this.start;
		openSegment = true;
		continue;
	    }

	    if ((NearlyEqual(t,end) || t > end) && openSegment)
	    {
		decomposition.push(new ExecutionUnit(this.j, this.speed, this.machine, openSegmentStart, t));
		openSegment = false;
	    } else if ( (start > t) && (t < end) )
	    {
		if(!openSegment)
		{
		    curtime = this.start;
		    openSegment = true;
		}

		decomposition.push(new ExecutionUnit(this.j, this.speed, this.machine, openSegmentStart, t));
		openSegmentStart = t;
	    }
	}

	// Close the last segment if any segment is open.
	if (openSegment)
	{
	    decomposition.push(new ExecutionUnit(this.j, this.speed, this.machine, openSegmentStart, this.end));
	}

	// If the time slots just do not overlap at all, return the execution unit as a singleton in the array.

	if (decomposition.length() == 0)
	{
	    decomposition.push(this);
	}

	return decomposition;
    }
}

// Instance: a list of jobs in deadline order, with their release times, processing times and possibly deadlines.


// Schedule: number of machines,
// speed of individual machine, whether jobs can run in parallel on several machines, and then a list of jobs, each with
// its own list of execution time.

class Schedule {
    m = 0;
    s = 1.0;
    parallelization = false;
    jobs = [];

    constructor(machines, speed, parallelization, joblist) {
	this.m = machines;
	this.s = speed;
	this.paralellization = parallelization;
	this.jobs = joblist;
    }


    // For all jobs, check that they are covered by execution intervals.
    // Then, build a machine map and check:
    // * that no machine runs higher than s at all times
    // * and if jobs are not parallelizable, that they run only on one machine at all times.
    validate() {
	return false; // TODO: implementation.
    }
    
}

// A secondary class, which stores the schedule as a list of execution units which are assigned to a specific machine.
class MachineSchedule {
    m = 0;
    s = 1.0;
    parallelization = false;
    loads = [];

    constructor(sched) {
	this.m = sched.m;
	this.s = sched.s;
	this.parallelization = sched.parallelization;

	// Initialize the load array of all m machines.
	for (var i = 0; i < m; i++) {
	    loads[i] = [];
	}

	// Assign jobs to machines.
	for (const job of sched.jobs) {
	    for (const ex of job.executionList) {
		loads[ex.machine].push(ex);
	    }
	}
    }

    // Get all relevant times (when an execution unit starts or stops) and return their sorted array.
    relevantTimes(machine) {
	times = [];
	for (const ex of loads[machine]) {
	    times.push(ex.start);
	    times.push(ex.end);
	}

	return sort_unique(times);
    }

    // Decompose into elementary execution times -- execution times with no relevant times (for this machine)
    // strictly inside them.

    decompose() {

	for (var machine = 0; machine < m; machine++) {
	    newLoads = [];
	    times = relevantTimes(machine);

	    for (let ex of this.loads[machine])
	    {
		var decomposition = ex.decompose(times);
		for (let subex of decomposition)
		{
		    newLoads.push(subex);
		}
	    }
	    // Now that we have elementary loads, sorting by starting time makes things easier
	    newLoads.sort((a,b) => a.start <= b.start);

	    // Replace your previous loads by newLoads
	    this.loads[machine] = newLoads;
	}
    }
}
