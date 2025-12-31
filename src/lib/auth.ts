import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'select_account',
          access_type: 'online',
          response_type: 'code',
        },
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      checks: ['none'], // State cookie mismatch 해결을 위해 checks 비활성화
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // 이메일 인증 확인 (소셜 로그인이 아닌 경우)
          if (user.provider === 'local' && !user.emailVerified) {
            throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
          }

          // 소셜 로그인 계정으로 비밀번호 로그인 시도 시 에러 처리
          if (user.provider !== 'local') {
            throw new Error(`${user.provider} 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.`);
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar,
            provider: user.provider,
            role: user.role, // role 추가
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // 소셜 로그인 시 자동으로 회원가입 처리
      if (account?.provider === 'google' || account?.provider === 'kakao') {
        try {
          console.log(`[SignIn] Starting sign in for provider: ${account.provider}`);
          await connectDB();

          // 기본 사용자 정보 (NextAuth가 매핑한 user 객체 우선 사용)
          // Kakao의 경우 profile 구조가 다를 수 있으므로 안전하게 접근
          const email = user.email || (profile as any)?.kakao_account?.email || `${account.providerAccountId}@${account.provider}.placeholder.com`;

          let name = user.name;
          if (!name) {
            name = (profile as any)?.properties?.nickname || (profile as any)?.kakao_account?.profile?.nickname || 'New User';
          }

          let avatar = user.image;
          if (!avatar) {
            avatar = (profile as any)?.properties?.profile_image || (profile as any)?.kakao_account?.profile?.profile_image_url || '';
          }

          console.log(`[SignIn] User Data: email=${email}, name=${name}`);

          // upsert 옵션을 사용하여 사용자 생성 또는 업데이트 (Atomic Operation)
          const result = await User.findOneAndUpdate(
            { email: email },
            {
              $set: {
                name: name,
                avatar: avatar,
                provider: account.provider,
                providerId: account.providerAccountId,
                emailVerified: true,
                updatedAt: new Date()
              },
              $setOnInsert: {
                role: 'member',
                grade: 'cedar',
                points: 0,
                marketingConsent: false,
                addresses: [],
                createdAt: new Date()
              }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          console.log('[SignIn] DB Operation Result:', result ? 'Success' : 'Failed');

          // 추천인 연결 (신규 가입자에게만 적용)
          try {
            // createdAt과 updatedAt이 같으면 방금 생성된 신규 사용자
            const isNewUser = result.createdAt.getTime() === result.updatedAt.getTime();

            if (isNewUser) {
              console.log('[SignIn] New user detected, checking referral cookie...');
              const cookieStore = await cookies();
              const referralCode = cookieStore.get('referral_code')?.value;

              if (referralCode) {
                console.log(`[SignIn] Referral code found: ${referralCode}`);

                // 추천인 존재 확인
                const referrer = await User.findOne({ referralCode: referralCode });
                if (referrer) {
                  console.log(`[SignIn] Referrer found: ${referrer.email}`);
                  result.referredBy = referralCode;
                  await result.save();
                  console.log('[SignIn] Referral connection saved successfully');
                } else {
                  console.log('[SignIn] Referral code invalid - referrer not found');
                }
              } else {
                console.log('[SignIn] No referral code in cookies');
              }
            } else {
              console.log('[SignIn] Existing user, skipping referral connection');
            }
          } catch (referralError) {
            console.error('[SignIn] Referral Error:', referralError);
            // 추천인 연결 실패해도 로그인은 성공
          }

          return true;
        } catch (error) {
          console.error('[SignIn] Critical Error:', error);
          // 디버깅을 위해 에러 발생 시에도 true 반환하여 로그인이 진행되게 함
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // JWT 토큰에 소셜 정보 포함
      if (account) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;
      }

      // 구글 로그인 시 사용자 정보 매핑
      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as any;
        token.name = googleProfile.name || user.name;
        token.email = googleProfile.email || user.email;
        token.image = googleProfile.picture || user.image;
      }

      if (user) {
        token.id = user.id;
        token.name = token.name || user.name;
        token.email = token.email || user.email;
        token.image = token.image || user.image;
        token.role = (user as any).role; // role 추가
      }

      // 소셜 로그인의 경우 role이 없을 수 있으므로 DB에서 한 번 더 확인 (성능을 위해 필요할 때만)
      if (token.email && !token.role) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role;
            if (!token.id) token.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error('[Auth JWT Callback] DB lookup error:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // 세션에 사용자 정보 포함
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).name = token.name as string;
        (session.user as any).email = token.email as string;
        (session.user as any).image = token.image as string;
        (session.user as any).provider = token.provider as string;
        (session.user as any).providerId = token.providerId as string;
        (session.user as any).role = token.role as string; // role 추가
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 비밀번호 검증 함수
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT 토큰 생성 함수
export function generateToken(payload: any): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
    issuer: 'youniqle',
    audience: 'youniqle-users'
  });
}

// 인증 쿠키 생성 함수
export function createAuthCookie(token: string): string {
  return `auth-token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

// 로그아웃 쿠키 생성 함수
export function createLogoutCookie(): string {
  return `auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// 통합 인증 검증 함수 (사용자, 파트너, 관리자 모두 지원)
export async function verifyAuth(request: NextRequest) {
  try {
    // 1. 관리자 토큰 확인
    const adminToken = request.cookies.get('admin-token')?.value;
    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET!) as any;
        if (decoded && decoded.type === 'admin') {
          await connectDB();
          const user = await User.findById(decoded.id);
          if (user && user.role === 'admin') {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }
      } catch (error) {
        // 관리자 토큰이 유효하지 않으면 다음으로
      }
    }

    // 2. 파트너 토큰 확인
    const partnerToken = request.cookies.get('partner-token')?.value;
    if (partnerToken) {
      try {
        const decoded = jwt.verify(partnerToken, process.env.JWT_SECRET!) as any;
        if (decoded && decoded.type === 'partner') {
          await connectDB();
          const user = await User.findById(decoded.id);
          if (user && user.role === 'partner') {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }
      } catch (error) {
        // 파트너 토큰이 유효하지 않으면 다음으로
      }
    }

    // 3. 일반 사용자 토큰 확인
    const authToken = request.cookies.get('auth-token')?.value;
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any;
        if (decoded) {
          await connectDB();
          const user = await User.findById(decoded.id);
          if (user) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }
      } catch (error) {
        // 토큰이 유효하지 않으면 null 반환
      }
    }

    return null;
  } catch (error) {
    console.error('인증 검증 오류:', error);
    return null;
  }
}

// 관리자 토큰 검증 함수
export async function verifyAdminToken(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return { success: false, error: '관리자 토큰이 없습니다.' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (!decoded || decoded.type !== 'admin') {
      return { success: false, error: '유효하지 않은 관리자 토큰입니다.' };
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return { success: false, error: '관리자 권한이 없습니다.' };
    }

    return {
      success: true,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('관리자 토큰 검증 오류:', error);
    return { success: false, error: '토큰 검증에 실패했습니다.' };
  }
}

export default NextAuth(authOptions);