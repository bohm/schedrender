// Algorithms that use scheduling definitions.
// import Heap from "https://unpkg.com/heap-js@1.4.1/dist/heap-js.es5.js";

function Yardstick(instance)
{
    // Ignore parallelization and speeds, yardstick only works with
    // speed 1.0 and full paralelization.
    const minHeap = new Heap();
    const maxHeap = new Heap(Heap.maxComparator);
 
    minHeap.init([5, 18, 1]);
    minHeap.push(2);
    console.log(minHeap.peek()); //> 1
    console.log(minHeap.pop()); //> 1
    console.log(minHeap.peek()); //> 2
}

Yardstick();
