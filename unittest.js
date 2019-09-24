// Small testing suite for scheduling.js.


// Define 5 jobs.

var Job0 = new Job(false, 0, 0.0, 1.0, 1.0);
var Job1 = new Job(false, 1, 0.0, 2.0, 1.0);
var Job2 = new Job(false, 2, 0.0, 0.4, 0.8);
var Job3 = new Job(false, 3, 0.4, 2.4, 1.0);
var Job4 = new Job(false, 4, 3.0, 4.0, 1.0);


// Now, add sample execution times. Designed to be feasible.

Job0.AddExecution(new ExecutionUnit(0, 1.0, 0, 0.0, 1.0));
Job1.AddExecution(new ExecutionUnit(1, 0.5, 1, 0.0, 2.0));
Job2.AddExecution(new ExecutionUnit(2, 0.5, 1, 0.0, 0.4));
Job3.AddExecution(new ExecutionUnit(3, 0.5, 1, 0.4, 2.4));
Job4.AddExecution(new ExecutionUnit(4, 1, 1, 3.0, 4.0));


var firstInstance = [Job0, Job1, Job2, Job3, Job4];

var sched = new Schedule(2, 1.0, false, firstInstance);
var msched = new MachineSchedule(sched);

msched.decompose();
console.log(msched);
