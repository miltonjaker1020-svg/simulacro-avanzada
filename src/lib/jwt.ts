import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '../types/payloads';
import { env } from 'process';

const JWT_ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_bidhub_2026_dev' );

const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'super_secret_access_key_bidhub_2026_dev');

async function signAccessToken(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRES_IN || "15m")
    .sign(JWT_ACCESS_SECRET);
  return jwt;
}


async function signRefreshToken(payload: JWTPayload): Promise<string> {
const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN || "7d")
    .sign(JWT_REFRESH_SECRET);
    return jwt;
    }



async function verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET);
    return payload as unknown as JWTPayload;
}
 catch  {
    throw new Error('Invalid access token');
}
}

async function verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
        const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
        return payload as unknown as JWTPayload;
    } catch  {
        throw new Error('Invalid refresh token');
    }
}


export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };