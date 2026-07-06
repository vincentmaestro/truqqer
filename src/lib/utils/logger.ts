import winston from "winston";

const { format } = winston;
const { colorize, combine, timestamp, printf, errors } = format;

export default function logger(service: string) {
    return winston.createLogger({
        exitOnError: false,
        defaultMeta: { service },
        format: combine(
            timestamp({ format: "hh:mm" }),
            errors({ stack: true }),
            combine(
                colorize(),
                printf(info => {
                    const { level, service, stack, timestamp, message } = info;
                    return [`${timestamp} ${service} ${level}: ${message} ${stack ?? ''}`]
                    .filter(Boolean)
                    .join('\n');
                })
            )
        ),
        transports: [
            new winston.transports.Console()
        ]
    });
}

