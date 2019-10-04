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
    if (a == undefined && b != undefined)
    {
	return b;
    } else if (b == undefined && a != undefined)
    {
	return a;
    } else
    {
	return a.time - b.time;
    }
}

function releaseComparator(a, b)
{
    if (a == undefined && b != undefined)
    {
	return b;
    } else if (b == undefined && a != undefined)
    {
	return a;
    } else {
	return a.release - b.release; 
    }
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
function CloseExecutionUnit(sched, m, endTime, machMap, machMapStarts)
{
    var jobID = machMap[m];
    if (jobID == null)
    {
	console.log("Trying to close an execution unit of an empty machine.");
    } else {
	var startTime = machMapStarts[m];
	var unit = new ExecutionUnit(jobID, 1.0, m, startTime, endTime);
	sched.jobs[jobID].executionList.push(unit);
	sched.jobs[jobID].amountDone += unit.volume(); 
	// set machine as free
	machMap[m] = null;
	machMapStarts[m] = null;
    }
}

function CloseUnderworked(sched, j, endTime, machMap, machMapStarts)
{
    for (let i = 0; i < machMap.length; i++)
    {
	if (machMap[i] != null && machMap[i] == j)
	{
	    CloseExecutionUnit(sched, i, endTime, machMap, machMapStarts);
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

// Find x such that ax + b = cx + d.

function SolveLinearEq(a,b,c,d)
{
    return ((d - b) / (a - c));
}

// Compute the next time when the job leaves the underworked state
// based on how much the job is processed, how much speed it will have from now on,
// and when it was released.

function ComputePacingChange(job, time, allocatedMachines)
{
    // The equation we are solving is (x - r_j) = s*(x - time) + A
    // A is the amount already processed on the job by time A
    
    pacingLin = Number(1); // Linear multiplier of the left side
    pacingConst = Number(-1) * job.release; // Constant factor of the left side
    underMult = allocatedMachines;
    underConst = Number(-1) * allocatedMachines * time + job.amountDone;
    
    var result = SolveLinearEq(pacingLin, pacingConst, underMult, underConst);
}

function Yardstick(insta)
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
    
    // Heap of all "job finished" event for one phase.
    const jobFinishHeap = new Heap(eventComparator);

    var time = Number(0); // current time

    var jobUpcoming = false;
    var upcomingRelease = Number(0);

    var jobUnderworked = false;
    var underID = 0;
    var leavesUnderworked = Number(0);

    var retsched = new Schedule(insta.machines, 1.0, true, insta.jobs);

    // Populate the release queue from the instance.
    for (let job of insta.jobs)
    {
	releaseHeap.push(job);
    }

    // Main phase loop, triggered whenever there is a new release.
    while (!releaseHeap.isEmpty())
    {
	// Add all jobs released in the current time to the pending map.
	var top = releaseHeap.peek();
	while (!releaseHeap.isEmpty() && nearlyEqual(top.release, time))
	{
	    console.log("Heap before pop:");
	    console.log(releaseHeap);
	    var job = releaseHeap.pop();
	    pending[job.order] = job;

	    if (!releaseHeap.isEmpty())
	    {
		top = releaseHeap.peek();
	    }
	}

	if (!releaseHeap.isEmpty())
	{
	    jobUpcoming = true;
	    upcomingRelease = releaseHeap.peek().release;
	} else
	{
	    jobUpcoming = false;
	}

	// Reset variables that are used inside the time processing loop.
	jobFinishHeap.clear();
	jobUnderworked = false;
	underID = -1;
	leavesUnderworked = Number(0);

	for (var m = 0; m < insta.machines; m++)
	{
	    machineMap[m] = null;
	    startTimes[m] = null;
	}

	while(true)
	{
	    // 1) Process the current event.

	    // a) If it is time for a new job to arrive, close all jobs at this point in time
	    // and break out of the loop;
	    if (jobUpcoming && nearlyEqual(time, upcomingRelease))
	    {
		CloseAll(retsched, time, machineMap, startTimes);
		PrunePending(pending);
		break;
	    }

	    // b) If a job switches from the underworked state to the pacing state,
	    // close this job on all machines which it has.
	    if (jobUnderworked && nearlyEqual(time, leavesUnderworked))
	    {
		CloseUnderworked(retsched, underID, time, machineMap, startTimes);
		jobUnderworked = false;
		underID = -1;
		leavesUnderworked = Number(0);
	    }

	    // c) If any job is finished, close its execution unit.
	    while (!jobFinishHeap.isEmpty() && nearlyEqual(time, jobFinishHeap.peek().time))
	    {
		let jobEvent = jobFinishHeap.pop();
		let mach = jobEvent.onMachine;
		CloseExecutionUnit(retsched, mach, time, machineMap, startTimes);
	    }

	    // d) Finally, go through all (available) machines and through all pending (not running) jobs
	    // and assign them, possibly with one in the underworked state.
	    PrunePending(pending);
	    let curmach = 0;
	    for (let pendingJob of pending)
	    {
		if (pendingJob == null)
		{
		    continue;
		}
	
		while (curmach < insta.machines && machineMap[curmach] != null) // skip busy machines
		{
		    curmach++;
		}

		if (curmach >= insta.machines)
		{
		    break;
		}
		
		// now we have a first available machine.

		if (pendingJob.underworked(time))
		{
		    let availableMachines = insta.machines - curmach;
		    console.log("Scheduling job " + pendingJob.id + "on the " + availableMachines + "available machines.");
		    jobUnderworked = true;
		    underID = pendingJob.id;
		    
		    // Schedule on all remaining available machines.
		    while (curmach < insta.machines)
		    {
			machineMap[curmach] = pendingJob.id;
			startTimes[curmach] = time;
			curmach++;
		    }
		    // Set the time when it stops being pending.
		    leavesUnderworked = ComputePacingChange(pendingJob, time, availableMachines);

		    // No more machines available, break out of the for loop.
		    break;
		} else
		{
		    // Insert a new element into the jobFinishHeap.
		    console.log("Scheduling job " + pendingJob.id + "in pacing mode on machine " + curmach);

		    let finishTime = time + (pendingJob.ptime - pendingJob.amountDone);
		    var je = new Event(finishTime, pendingJob.id, curmach);
		    jobFinishHeap.push(je);

	            // Schedule the job (as pacing) on the current machine.
		    machineMap[curmach] = pendingJob.id;
		    startTimes[curmach] = time;
		    curmach++;

		}
	    }
		
	    // 2) Update time to the next event.
	    if (jobFinishHeap.isEmpty() && !jobUpcoming && !jobUnderworked)
	    {
		// all jobs done, leave the loop
		break;
	    } else {

		let updated = false;
		let newtime = Number(0);
		
		if (!jobFinishHeap.isEmpty())
		{
		    if (!updated)
		    {
			newtime = jobFinishHeap.peek().time;
			updated = true;
		    } else
		    {
			newtime = Math.min(newtime, jobFinishHeap.peek().time);
		    }
		}

		if (jobUpcoming)
		{
		    if (!updated)
		    {
			newtime = upcomingRelease
			updated = true;
		    } else
		    {
			newtime = Math.min(newtime, upcomingRelease);
		    }
		}

		if (jobUnderworked)
		{
		    if (!updated)
		    {
			newtime = leavesUnderworked;
			updated = true;
		    } else
		    {
			newtime = Math.min(newtime, leavesUnderworked);
		    }
		}
		    
		if (nearlyEqual(newtime, time))
		{
		    console.log("Time did not move; this can happen, but we warn the user anyway.");
		} else
		{
		    console.log("Updating time step from " + time + " to " + newtime);
		    debugger;
		}

		if (newtime === undefined || newtime === null || newtime == NaN)
		{
		    throw new Error();
		}
		time = newtime;
		if (time === undefined || time === null || time == NaN)
		{
		    throw new Error();
		}

	    }
	}
    }
    return retsched;
}


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
