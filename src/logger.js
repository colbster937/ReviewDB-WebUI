function formatMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${message}`;
}

class Logger {
    log(message) {
        console.log(formatMessage(message));
    }
    error(message) {
        console.error(formatMessage(message));
    }
    warn(message) {
        console.warn(formatMessage(message));
    }
}

export default Logger = new Logger();