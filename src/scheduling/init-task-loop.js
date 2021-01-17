const task = require('../util/task');
const taskloop = require('../util/taskloop');
const main = require('../../main');

function initTaskLoop() {
    let taskRunner = new taskloop.TaskLoop();
    main.tasks.forEach((curTaskFunc) => {
        taskRunner.addTask(curTaskFunc);
    });
    taskRunner.runLoop();
    return taskRunner;
}

exports.initTaskLoop = initTaskLoop;