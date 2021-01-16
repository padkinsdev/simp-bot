const config = require('../../config.json');
const logging = require('./logging');

class TaskLoop {
    constructor(tasks=[]) {
        this.tasks = tasks;
        this.loopInterval = config["task-loop-interval"];
        this.loop = null;
        this.logger = new logging.Logger();
        this.logger.info("Initializing new task loop object...");
    }

    runLoop() {
        this.loop = setInterval(() => {
            this.tasks.forEach((task) => {
                if (task.elapsedTimeSinceLastRun + this.loopInterval >= task.interval) {
                    this.logger.debug(`Running task ${task.name}`);
                    task.run();
                    task.elapsedTimeSinceLastRun = 0;
                } else {
                    task.elapsedTimeSinceLastRun += this.loopInterval;
                }
            })
        }, this.loopInterval);
    }

    addTask(task) {
        this.tasks.push(task);
    }
}

exports.TaskLoop = TaskLoop;