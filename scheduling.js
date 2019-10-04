// Scheduling logic -- definition of an instance, definition of a schedule, validating feasibility, algorithms.

// Basic functions.

const EPS = Number(0.00001); // our local precision.

// TODO: make this work better. 1000 is an essentially random constant.
function nearlyEqual(a, b) {
    var absA = Math.abs(a);
    var absB = Math.abs(b);
    var diff = Math.abs(a - b);

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

// These information matter for the instance and the scheduling.
class Job {
    id;
    deadlineOrder;
    order;
    release;
    deadline;
    ptime;

    // These only matter for the scheduling.
    amountDone = Number(0);
    
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

    // Functions used while jobs are being scheduled.
    
    allDone()
    {
	if (nearlyEqual(this.amountDone, this.ptime))
	{
	    return true;
	} else {
	    return false;
	}
    }

    underworked(time)
    {
	if (this.allDone()) // If a job is done, we do not consider it underworked.
	{
	    return false;
	}
	
	if ((time - this.release) > this.amountDone)
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
    constructor(j, speed, m, s, e) {
		this.jobID = j;
		this.speed = speed;
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
    decompose(sortedTimeList) {

	// console.log("Decomposing execution unit");
	// console.log(this);
	// console.log("by the sorted timelist");
	// console.log(sortedTimeList);
	
	var openSegmentStart = 0;
	var decomposition = [];
	var openSegment = false;
	for (let t of sortedTimeList)
	{
	    if (t < this.start) {
		continue;
	    }

	    if (nearlyEqual(t,this.start)) {
		// do nothing, wait for the first time strictly greater than start.
		openSegmentStart = this.start;
		openSegment = true;
		continue;
	    }

	    if ((nearlyEqual(t,this.end) || t > this.end) && openSegment)
	    {
		decomposition.push(new ExecutionUnit(this.jobID, this.speed, this.machine, openSegmentStart, t));
		openSegment = false;
		break;
	    }

	    if ( (this.start < t) && (t < this.end) )
	    {
		if(!openSegment)
		{
		    curtime = this.start;
		    openSegment = true;
		}

		decomposition.push(new ExecutionUnit(this.jobID, this.speed, this.machine, openSegmentStart, t));
		openSegmentStart = t;
	    }
	}

	// Close the last segment if any segment is open.
	if (openSegment)
	{
	    decomposition.push(new ExecutionUnit(this.jobID, this.speed, this.machine, openSegmentStart, this.end));
	}

	// If the time slots just do not overlap at all, return the execution unit as a singleton in the array.

	if (decomposition.length == 0)
	{
	    decomposition.push(this);
	}

	// console.log("Final decomposition:");
	// console.log(decomposition);

	return decomposition;
    }
}

Job.prototype.AddExecution = function(execunit)
{
    this.executionList.push(execunit);
}

// Instance: a list of jobs in deadline order, with their release times, processing times and possibly deadlines.

class Instance {
    machines;
    maxspeed;
    parallelization;
    deadlineorder;
    jobs = [];

    constructor(machines, maxspeed, parallelization, deadlineorder, joblist)
    {
	this.machines = machines;
	this.maxspeed = maxspeed;
	this.paralellization = parallelization;
	this.jobs = joblist;
	this.deadlineorder = deadlineorder;

    }
}

// Schedule: number of machines,
// speed of individual machine, whether jobs can run in parallel on several machines, and then a list of jobs, each with
// its own list of execution time.

class Schedule {
    m = 0;
    s = 1.0;
    parallelization = false;
    jobs = [];

    // There are two views of a schedule -- the "job view", which lists all the times a job is executed,
    // and a "machine view", which lists for each machine the execution units that run on said machine.
    // The constructor of Schedule does only copy the jobs along with execution units (there might not be any,
    // if we are starting to solve the instance). The array loads is empty until machineView() is called.
    loads = [];

    constructor(machines, speed, parallelization, joblist) {
	this.m = machines;
	this.s = speed;
	this.parallelization = parallelization;
	this.jobs = joblist;
    }

    // Call machineView() to get the loads of all machines -- once everything is scheduled.
    machineView() {

	// Initialize the load array of all m machines.
	for (var i = 0; i < this.m; i++) {
	    this.loads[i] = [];
	}

	// Assign jobs to machines.
	for (const job of this.jobs) {
	    for (const ex of job.executionList) {
		this.loads[ex.machine].push(ex);
	    }
	}
    }

    // Get all relevant times (when an execution unit starts or stops) and return their sorted array.
    relevantTimes(machine) {
	var times = [];
	for (const ex of this.loads[machine]) {
	    times.push(ex.start);
	    times.push(ex.end);
	}

	return sort_unique(times);
    }

    // Decompose into elementary execution times -- execution times with no relevant times (for this machine)
    // strictly inside them.

    decompose() {

	for (var machine = 0; machine < this.m; machine++) {
	    var newLoads = [];
	    var times = this.relevantTimes(machine);
	    console.log("Relevant times of machine" + machine.toString());
	    console.log(times);

	    for (let ex of this.loads[machine])
	    {
		var decomposition = ex.decompose(times);
		for (let subex of decomposition)
		{
		    newLoads.push(subex);
		}
	    }
	    // Replace your previous loads by newLoads
	    this.loads[machine] = newLoads;
	}
    }

    sortStartTimes() {
	for (var machine = 0; machine < this.m; machine++)
	{
	    this.loads[machine].sort((a,b) => a.start - b.start);
	}
    }


    // For all jobs, check that they are covered by execution intervals.
    // Then, build a machine map and check:
    // * that no machine runs higher than s at all times
    // * and if jobs are not parallelizable, that they run only on one machine at all times.
    validate() {
	return false; // TODO: implementation.
    }

}
