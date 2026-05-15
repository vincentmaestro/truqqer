import { RedisClientType } from "redis";

declare global {
    var grecaptcha: ReCaptchaV2.ReCaptcha;
    var redis: RedisClientType;

    interface Window {
        grecaptcha: ReCaptchaV2.ReCaptcha;
    }
}

export {};
