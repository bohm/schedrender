// Algorithms that use scheduling definitions.
// import Heap from "https://unpkg.com/heap-js@1.4.1/dist/heap-js.es5.js";

// A simple time event with an explanation
class Event
{
    time;
    jobID;
    type;
    constructor(time, jobID, type)
    {
	this.time = time;
	this.type = type;
    }
};

Event.Released = 0;
Event.Pacing = 1;
Event.Finished = 2;

function eventComparator(a, b)
{
    return a.time - b.time;
}

// TODO: a multiarray class that essentially hosts an array of sets
// and allows for iteration.

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

function Yardstick(instance)
{
    // Ignore parallelization and speeds, yardstick only works with
    // speed 1.0 and full paralelization.

    // Array of currently running jobs.
    var runningJobs = [];

    // Multiset of currently pending jobs.

    // Heap of all time events
    const eventHeap = new Heap(eventComparator);
    
}

Yardstick();
