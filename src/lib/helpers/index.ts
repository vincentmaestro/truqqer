import { JwtPayload, sign, SignOptions, verify } from "jsonwebtoken";
import { genSalt, hash } from 'bcrypt';
import { headers } from "next/headers";

export function signToken(
    payload: object,
    secret: string,
    expiration?: SignOptions["expiresIn"]
  ) {
    return sign(payload, secret, {
      ...(expiration !== undefined && { expiresIn: expiration }),
    });
}

export function verifyToken<T extends JwtPayload>(
  token: string,
  secret: string,
  validator?: (payload: JwtPayload) => payload is T
) {
  try{
    const payload = verify(token, secret);
      
    if(typeof payload === 'string') 
    throw new Error('invalid token payload');

    if(validator && !validator(payload))
      throw new Error('invalid token payload');

    return { success: true as const, data: payload };
  }
  catch(err: any) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function hashPassword(password: string) {
    const hashed = await hash(password, await genSalt());
    return hashed;
}

export function generate6RandomDigits() {
  const numbers = '0123456789';
  let digits = '';

  for(let i = 0; i < 6; i++) {
    digits +=  numbers[Math.floor(Math.random() * 10)];
  }

  return digits;
}

export function capitalizeInitialLetters(input: string) {
  const words = input.split(' ');
  const capitalizedWordsArray = words.map(word => `${word[0].toUpperCase()}${word.slice(1)}`);
  const capitalizedInitials = capitalizedWordsArray.join(' ');

  return capitalizedInitials;
}

export async function getIp() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') as string;

  return ip;
}
