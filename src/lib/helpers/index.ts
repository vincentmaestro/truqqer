import { JwtPayload, sign, SignOptions, verify } from "jsonwebtoken";
import { genSalt, hash } from 'bcrypt';

export function signToken(
    payload: object,
    secret: string,
    expiration: SignOptions["expiresIn"]
  ) {
    return sign(payload, secret, {
      expiresIn: expiration,
    });
}

export function verifyToken<T extends JwtPayload>(
  token: string,
  secret: string,
  validator: (payload: JwtPayload) => payload is T
) {
  try{
      const payload = verify(token, secret);
      
      if(typeof payload === 'string') 
          throw new Error('invalid token payload');

      if(!validator(payload))
          throw new Error('invalid token payload');

      return { success: true, data: payload };
  }
  catch(err: any) {
    return {
        success: false,
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
