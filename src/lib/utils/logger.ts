import winston, { exitOnError } from "winston";
const { format } = winston;
const { colorize, combine, timestamp, json } = format;

// export default function logger() {
//     const defaultLogger = winston.createLogger(
        
//     );

//     if(process.env.NODE_ENV !== 'production') {
//         defaultLogger.add(
//             new winston.transports.Console()
//         )
//     }

//     return defaultLogger;
// }

const isProduction = process.env.NODE_ENV !== 'production';

const loggerOptions = {
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                json(),
                timestamp()
            )
        })
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                json(),
                timestamp()
            )
        }),
        new winston.transports.File({
            filename: '/logs/exceptions.log'
        })
    ],
    rejectionHandlers: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                json(),
                timestamp()
            )
        }),
        new winston.transports.File({
            filename: '/logs/rejections.log'
        })
    ]
}

const logger = winston.createLogger(loggerOptions);

if(isProduction) {
    logger.remove(new winston.transports.Console());
}

export default logger;
