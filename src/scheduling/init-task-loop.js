const task = require('../util/task');
const taskloop = require('../util/taskloop');

function initTaskLoop() {
    let taskRunner = new taskloop.TaskLoop();
    taskFuncs.forEach((curTaskFunc) => {
        taskRunner.addTask(curTaskFunc);
    });
    taskRunner.runLoop();
    return taskRunner;
}

var taskFuncs = [
    new task.Task("test task", 300000, () => {
        console.log("Hello!");
    }),
    new task.Task("second task", 600000, () => {
        console.log("Second task!");
    })
]

exports.initTaskLoop = initTaskLoop;