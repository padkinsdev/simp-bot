const logging = require('./logging');
const main = require('../../main');

class Task {
    constructor(name, interval, func, ...args) {
        this.name = name;
        this.interval = interval;
        this.elapsedTimeSinceLastRun = 0;
        this.func = func;
        if (args.length != func.length){
           main.logger.warn(`Function ${func.name} takes ${func.length} arguments, but ${args.length} arguments were provided in Task object instantiation`);
        }
        this.funcArgs = args;
    }

    run() {
        try {
            this.func(...this.funcArgs);
        } catch (err) {
            main.logger.error(`Error while running task ${this.func.name}: ${err}`);
        }
    }
}

exports.Task = Task;