const logging = require('./logging');
const config = require('../../config.json');

const logger = new logging.Logger();

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

class Task {
    constructor(func, cronString, ...args) {
        logger.debug(`Creating new Task object for function ${func.name}`);
        if (args.length != func.length){
            logger.warn(`Function ${func.name} takes ${func.length} arguments, but ${args.length} arguments were provided in Task object instantiation`);
        }
        this.cronString = this.checkValidCron(cronString);
        this.func = func;
        this.funcArgs = args;
    }

    checkValidCron(cronString) {
        let cronSplit = cronString.split(" ");
        if (cronSplit.length != 6) {
            logger.warn(`Cron string ${cronString} is of invalid length, and will be adjusted to length 6`);
            if (cronSplit.length > 6) {
                cronSplit = cronSplit.slice(0, 6);
            }
            while (cronSplit.length < 6) {
                cronSplit += "*";
            }
        }

        for (let i=0; i < cronSplit.length; i++) {
            if (cronSplit[i].includes('/')) {
                cronSplit[i] = cronSplit[i].slice(2);
            }
            if (isNaN(cronSplit[i]) && cronSplit[i] != "*") {
                logger.warn(`Value at position ${i} in cron string ${cronString} is not a number or *, and will be replaced with *`);
                cronSplit[i] = "*";
            }
        }

        if (cronSplit[0] != "*") {
            let seconds = parseInt(cronSplit[0]);
            if (seconds > 59) {
                logger.warn(`Seconds value of cron string ${cronString} is greater than 59, and will be set to 59`);
                cronSplit[0] = "59";
            }
            if (seconds < 0) {
                logger.warn(`Seconds value of cron string ${cronString} is less than 0, and will be set to 0`);
                cronSplit[0] = "0";
            }
        }
        if (cronSplit[1] != "*") {
            let minutes = parseInt(cronSplit[1]);
            if (minutes > 59) {
                logger.warn(`Minutes value of cron string ${cronString} is greater than 59, and will be set to 59`);
                cronSplit[1] = "59";
            }
            if (minutes < 0) {
                logger.warn(`Minutes value of cron string ${cronString} is less than 0, and will be set to 0`);
                cronSplit[1] = "0";
            }
        }
        if (cronSplit[2] != "*") {
            let hours = parseInt(cronSplit[2]);
            if (hours > 23) {
                logger.warn(`Hours value of cron string ${cronString} is greater than 23, and will be set to 23`);
                cronSplit[2] = "23";
            }
            if (hours < 0) {
                logger.warn(`Hours value of cron string ${cronString} is less than 0, and will be set to 0`);
                cronSplit[2] = "0";
            }
        }
        if (cronSplit[3] != "*") {
            let days = parseInt(cronSplit[3]);
            let maxDays;
            if (cronSplit[4] == "*") {
                maxDays = 31;
            } else {
                maxDays = daysInMonth[parseInt(cronSplit[4])];
            }
            if (days < 1) {
                logger.warn(`Days value of cron string ${cronString} is less than 1, and will be set to 1`);
                cronSplit[3] = "1";
            }
            if (days > maxDays) {
                logger.warn(`Days value of cron string ${cronString} is greater than ${maxDays}, and will be set to ${maxDays}`);
                cronSplit[3] = maxDays.toString();
            }
        }
        if (cronSplit[4] != "*") {
            let months = parseInt(cronSplit[4]);
            if (months < 1) {
                logger.warn(`Months value of cron string ${cronString} is less than 1, and will be set to 1`);
                cronSplit[4] = "1";
            }
            if (months > 12) {
                logger.warn(`Months value of cron string ${cronString} is greater than 12, and will be set to 12`);
                cronSplit[4] = "12";
            }
        }
        if (cronSplit[5] != "*") {
            let weekdays = parseInt(cronSplit[5]);
            if (weekdays < 1) {
                logger.warn(`Weekdays value of cron string ${cronString} is less than 1, and will be set to 1`);
                cronSplit[5] = "1";
            }
            if (weekdays > 7) {
                logger.warn(`Weekdays value of cron string ${cronString} is greater than 7, and will be set to 7`);
                cronSplit[5] = "7";
            }
        }

        return cronSplit.join(" ");
    }

    run() {
        try {
            this.func(...this.funcArgs);
        } catch (err) {
            logger.error(`Error while running task ${this.func.name}: ${err}`);
        }
    }
}

class TaskList {
    constructor(...args) {
        logger.debug("Creating new TaskList object");
        this.tasks = [];
        args.forEach((value) => {
            if (!(typeof value === "object")){
                logger.warn(`Task of type ${typeof value} passed to TaskList object constructor`);
            }
            if (!(value instanceof Task)){
                logger.warn(`Task passed to TaskList object constructor is not a Task object`);
            }
            this.tasks.push(value);
        });
        this.elapsedTime = 0; // the elapsed time since the task loop started running
    }

    runLoop() {
        logger.info("Initiating task list loop");
        console.log(`Elapsed time: ${this.elapsedTime}`);
        setInterval(this.loopActivity(this), config['task-loop-interval']);
    }

    loopActivity(taskList) { // a single iteration of the schedule loop
        console.log(`Elapsed time: ${taskList.elapsedTime}`);
        taskList.tasks.forEach((value, index) => {
            if (taskList.validTimeToRun(value.cronString)) {
                value.run();
            }
        });
        taskList.elapsedTime += parseInt(config['task-loop-interval']);
    }

    validTimeToRun(cronString) {
        // checks if a single task should be run
        let chunks = cronString.split(' ');
        let now = new Date();
        let nowVals = [now.getSeconds(), now.getMinutes(), now.getHours(), now.getDate(), now.getMonth(), now.getDay()];

        if (chunks.length != 6) {
            logger.error(`Invalid cron string. Expected 6, got: ${chunks.length}`);
            return false;
        }

        let checksPassed = 0;

        for (let i=0; i < 6; i++){
            if (chunks[i] == "*") {
                checksPassed++;
            } else if (chunks[i].includes('/')) {
                chunks[i] = chunks[i].slice(2);
                if (nowVals[i] % parseInt(chunks[i]) == 0) {
                    checksPassed++;
                }
            } else if (parseInt(chunks[i]) == nowVals[i]) {
                checksPassed++;
            }
        }
        return checksPassed == 6;
    }
}

exports.Task = Task;
exports.TaskList = TaskList;