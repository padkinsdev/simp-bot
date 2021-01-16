const tasks = require('../util/tasks');

function sayHello(say, hello, exclamation){
    for (let i=0; i < 5; i++){
        console.log(`${say} ${hello} ${exclamation}`);
        //process.exit();
    }
}

const helloTask = new tasks.Task(sayHello, "*/10 * * * * *", "Say", "Hello", "!");
const loop = new tasks.TaskList(helloTask);
loop.runLoop();