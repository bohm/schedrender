// Scheduling logic -- definition of an instance, definition of a schedule, validating feasibility, algorithms.

// Current data types:

// Instance: a list of jobs in deadline order, with their release times, processing times and possibly deadlines.

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
}
// Schedule: number of machines, speed of individual machine, whether jobs can run in parallel on several machines, and then a list of jobs, each with
// its own list of execution time.

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
	
	volume()
	{
		return (this.end - this.start) * this.speed;
	}
}

class Schedule {
}

function ValidateSchedule(sched)
{
}