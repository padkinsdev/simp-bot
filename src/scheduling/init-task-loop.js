const task = require('../util/task');
const taskloop = require('../util/taskloop');

function initTaskLoop() {
    let testTask = new task.Task("test task", 10000, () => {
        console.log("Hello!");
    });
    let taskRunner = new taskloop.TaskLoop([testTask]);
    taskRunner.runLoop();
    return taskRunner;
}

exports.initTaskLoop = initTaskLoop;