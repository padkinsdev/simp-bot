const fs = require('fs');

class Logger {
    constructor(path=`./logs/serverlog_${new Date().toDateString()}.txt`) { // preferably don't change the default value
        this.readyToWriteToFile = false;
        this.messageBacklog = [];
        fs.readFile(path, (err, data) => {
            if (err) {
                fs.mkdir(path.split("/")[1], (err) => {
                    if (err){
                        if (err.code == "EEXIST"){
                            fs.appendFile(path, "", (err) => {
                                if (err) {
                                    console.error(`Could not create file ${path}: ${err}`);
                                } else {
                                    this.path = path;
                                    this.readyToWriteToFile = true;
                                    this.debug(`Successfully created new Logger object pointing to ${path}`);
                                }
                            });
                        } else {
                            console.error(`Couldn't instantiate Logger object: ${err}`);
                        }
                    } else {
                        fs.appendFile(path, "", (err) => {
                            if (err) {
                                console.error(`Could not create file ${path}: ${err}`);
                            } else {
                                this.path = path;
                                this.readyToWriteToFile = true;
                                this.debug(`Successfully created new Logger object pointing to ${path}`);
                            }
                        });
                    }
                });
            } else {
                this.path = path;
                this.readyToWriteToFile = true;
                this.debug(`Successfully created new Logger object pointing to ${path}`);
            }
        });
    }

    static write_once_to_log(level, content, path=`./logs/serverlog_${new Date().toDateString()}.txt`) {
        let logger = new Logger(path);
        switch (level) {
            case "debug":
                logger.debug(content);
                break;
            case "info":
                logger.info(content);
                break;
            case "warn":
                logger.warn(content);
                break;
            case "error":
                logger.error(content);
                break;
            case "fatal":
                logger.fatal(content);
                break;
        }
    }

    write_to_log(data) {
        data = `${new Date().toUTCString()} || ${data}`;
        if (this.readyToWriteToFile){
            if (this.messageBacklog != []){
                let tempBacklog = this.messageBacklog;
                tempBacklog.push(data);
                fs.appendFile(this.path, tempBacklog.join(""), (err) => {
                    if (err) {
                        console.error(`Could not write to log file: ${err}`);
                    }
                });
                this.messageBacklog = []; // I don't want this block to be executed more than once accidentally
            } else {
                fs.appendFile(this.path, data, (err) => {
                    if (err) {
                        console.error(`Could not write to log file: ${err}`);
                    }
                });
            }
        } else {
            this.messageBacklog.push(data);
        }
    }

    /*
    DEBUG	Designates fine-grained informational events that are most useful to debug an application.
    INFO	Designates informational messages that highlight the progress of the application at coarse-grained level.
    WARN	Designates potentially harmful situations.
    ERROR	Designates error events that might still allow the application to continue running.
    FATAL	Designates very severe error events that will presumably lead the application to abort.
    */


    // the following are basically wrapper functions
    debug(message) {
        this.write_to_log(`DEBUG: ${message}\n`);
    }

    info(message) {
        this.write_to_log(`INFO: ${message}\n`);
    }

    warn(message) {
        this.write_to_log(`WARN: ${message}\n`);
    }

    error(message) {
        this.write_to_log(`ERROR: ${message}\n`);
    }

    fatal(message) {
        this.write_to_log(`FATAL: ${message}\n`);
    }
}

exports.Logger = Logger;