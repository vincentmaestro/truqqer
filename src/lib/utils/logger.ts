import winston from "winston";

const { format } = winston;
const { colorize, combine, json, timestamp, printf, errors } = format;
const isProduction = process.env.NODE_ENV === 'production';

export default function logger(service: string) {
    return winston.createLogger({
        exitOnError: false,
        defaultMeta: { service },
        format: combine(
            timestamp({ format: "hh:mm" }),
            errors({ stack: true }),

            isProduction ?
            json() :
            combine(
                colorize(),
                printf(({ level, service, stack, timestamp, message }) => `${timestamp} [${service}] [${level}]: ${message}\n${stack ? stack : ''}`)
            )
        ),
        transports: [
            new winston.transports.Console()
        ],
        exceptionHandlers: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'logs/exception.log' })
        ],
        rejectionHandlers: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'logs/rejection.log' })
        ]
    });
}

