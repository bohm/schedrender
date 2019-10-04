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

// var sched = new Schedule(2, 1.0, false, firstInstance);
// var msched = new MachineSchedule(sched);

// sched.machineView();
// sched.decompose();
// console.log(sched);

// Lukasz's instance from 03/10/2019
var UnitJob0 = new Job(true, 0, 0.0, 0, 1.0);
var UnitJob1 = new Job(true, 1, 0.0, 1, 1.0);
var UnitJob2 = new Job(true, 2, 0.0, 2, 1.0);

var BigJob3 = new Job(true, 3, 0.0, 3, 3.0);
var BigJob4 = new Job(true, 4, 0.0, 4, 3.0);
var BigJob5 = new Job(true, 5, 0.0, 5, 4.5);

var secondInstance = [UnitJob0, UnitJob1, UnitJob2, BigJob3, BigJob4, BigJob5];
var inst = new Instance(3, 1.0, true, true, secondInstance);
console.log(inst);
var yssched = Yardstick(inst);
yssched.machineView();
yssched.decompose();
console.log(yssched);
