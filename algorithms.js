// Algorithms that use scheduling definitions.
// import Heap from "https://unpkg.com/heap-js@1.4.1/dist/heap-js.es5.js";

// A simple time event with an explanation
class Event
{
    time;
    jobID;
    onMachine;
    constructor(time, jobID, mach)
    {
	this.time = time;
	this.onMachine = mach;
    }
};


function eventComparator(a, b)
{
    return a.time - b.time;
}

function releaseComparator(a, b)
{
    return a.release - b.release; 
}

// Prune the hashmap of pending jobs and remove all which are finished.
function PrunePending(pending)
{
    // We have to do the old school for loop to enable deletion.
    for (let i = 0; i < pending.length; i++)
    {
	if (pending[i] == undefined)
	{
	    continue;
	}
	
	if (pending[i].allDone())
	{
	    delete pending[i];
	}
    }
}

// Simple functions for closing an execution unit.
// In the functions below we make use of the fact that JS is a pass-by-sharing language;
// this means that if we edit the inside of machineMap, this change will propagate.
function CloseExecutionUnit(sched, m, endTime, machineMap, machMapStarts)
{
    var jobID = machineMap[m];
    if (jobID == null)
    {
	console.log("Trying to close an execution unit of an empty machine.");
    } else {
	var startTime = machMapStarts[m];
	var unit = new ExecutionUnit(jobID, 1.0, startTime, endTime);
	sched.jobs[jobID].push(unit);
	// set machine as free
	machMap[m] = null;
	machMapStarts[m] = null;
    }
}

function CloseUnderworked(sched, j, endTime, machineMap, machMapStarts)
{
    for (let i = 0; i < machineMap.length; i++)
    {
	if (machineMap[i] != null && machineMap[i] == j)
	{
	    CloseExecutionUnit(loads, i, runningJobs, machineMap);
	}
    }
}

// Currently just an alias for CloseExecutionUnit().
function ClosePacing(sched, m, endTime, machineMap, machMapStarts)
{
    CloseExecutionUnit(sched, m, endTime, machineMap, machMapStarts);
}

function CloseAll(sched, endTime, machineMap, machMapStarts)
{
    for (let i = 0; i < machineMap.length; i++)
    {
	if(machineMap[i] != null)
	{
	    CloseExecutionUnit(loads, i, runningJobs, machineMap);
	}
    }
}

function Yardstick(instance)
{
    // Ignore parallelization and speeds, yardstick only works with
    // speed 1.0 and full paralelization.

    // An array (sparse, i.e. hashmap) of currently pending jobs, indexed by their deadline order.
    var pending = [];

    // An hashmap of currently running jobs.
    // var runningJobs = [];

    // An inverse hashmap to runningJobs -- which job runs on a specific machine.
    var machineMap = [];
    // For every machine we have a time at which the currently running job starts.
    var startTimes = [];
    
    const releaseHeap = new Heap(releaseComparator);
    
    // Heap of all time events relevant for this phase.
    const eventHeap = new Heap(eventComparator);

    var time = Number(0); // current time

    var jobUpcoming = false;
    var upcomingRelease = Number(0);

    var jobUnderworked = false;
    var underID = 0;
    var leavesUnderworked = Number(0);
    
    // Main phase loop, triggered whenever there is a new release.
    while (!releaseHeap.isEmpty())
    {
	var top = releaseHeap.peek();
	if (nearlyEqual(top.release, time))
	{
	    // Add the job to the pending jobs.
	    // var job = 
	}

	if (!releaseHeap.isEmpty())
	{
	    nextRelease = releaseHeap.peek().release;
	    jobUpcoming = true;
	} else
	{
	    jobUpcoming = false;
	}

	jobFinishHeap.clear(); // Clear the event heap for the current phase.

	while(true)
	{
	    // 1) Process the current event.

	    // a) If it is time for a new job to arrive, close all jobs at this point in time
	    // and break out of the loop;
	    if (jobUpcoming && nearlyEqual(time, upcomingRelease))
	    {
		CloseAll(sched, time, machineMap, startTimes);
		PrunePending(pending);
		break;
	    }

	    // b) If a job switches from the underworked state to the pacing state,
	    // close this job on all machines which it has.
	    if (jobUnderworked && nearlyEqual(time, leavesUnderworked))
	    {
		CloseUnderworked(sched, underID, time, machineMap, startTimes);
	    }

	    // c) If any job is finished, close its execution unit.
	    while (!jobFinishHeap.isEmpty() && nearlyEqual(time, jobFinishHeap.peek().time))
	    {
		let jobEvent = jobFinishHeap.pop();
		let mach = jobEvent.onMachine;
		CloseExecutionUnit(sched, mach, time, machineMap, startTimes);
	    }

	    // d) Finally, go through all (available) machines and through all pending (not running) jobs
	    // and assign them, possibly with one in the underworked state.
	    PrunePending();
	    var curmach = 0;
	    for (let pendingJob of pending)
	    {
	
		while (curmach < machineMap.length && machineMap[curmach] != null) // skip busy machines
		{
		    curmach++;
		}

		if (curmach >= machineMap.length)
		{
		    break;
		}
		
		// now we have a first available machine.

		if (pendingJob.underworked(time))
		{
		    // Schedule on all remaining available machines.
		    // Set the time when it stops being pending.
		} else
		{
		    // Job is pacing, schedule it on the current machine.
		    // Insert a new element into the jobFinishHeap.
		    
		}
	    }
		
	    // 2) Update time to the next event.
	    if (jobFinishHeap.isEmpty() && !jobUpcoming && !jobUnderworked)
	    {
		// all jobs done, leave the loop
		break;
	    } else {

		if (!jobFinishHeap.isEmpty())
		{
		    time = jobFinishHeap.peek().release;
		}

		if (jobUpcoming)
		{
		    time = Math.min(time, upcomingRelease);
		}

		if (jobUnderworked)
		{
		    time = Math.min(time, leavesUnderworked);
		}
	    }
	}
    }
}

Yardstick();



// Currently unused and needs finishing: a multiarray class that
// essentially hosts an array of sets and allows for iteration.

/*
class Multiarray
{
    cap;
    ar = [];

    constructor(cap)
    {
	this.cap = cap;
	for (let i = 0; i < cap; i++)
	{
	    this.ar.push(new Set());
	}
    }

    add(intKey, value)
    {
	this.ar[intKey].add(value);
    }

    delete(intKey, value)
    {
	this.ar[intKey].delete(value);
    }

    contains(intKey, value)
    {
	if (intKey < 0 || intKey >= this.cap)
	{
	    return false;
	}
	
	return ar[intKey].has(value);
    }
    
};
*/
