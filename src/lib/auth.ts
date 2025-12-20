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
          await connectDB();

          // 사용자 정보 추출
          let userData = {
            name: user.name || '',
            email: user.email || '',
            avatar: user.image || '',
            provider: account.provider,
            providerId: account.providerAccountId,
            emailVerified: true,
            marketingConsent: false,
          };

          // 구글 로그인 시 추가 정보 매핑
          if (account.provider === 'google' && profile) {
            const googleProfile = profile as any;
            userData.name = googleProfile.name || user.name || '';
            userData.email = googleProfile.email || user.email || '';
            userData.avatar = googleProfile.picture || user.image || '';
          }

          // 카카오 로그인 시 추가 정보 매핑
          if (account.provider === 'kakao' && profile) {
            console.log('Kakao Profile:', profile); // 디버깅용 로그
            // 카카오 프로필 구조에 따라 필요한 경우 추가 매핑
            // NextAuth의 기본 매핑이 user 객체에 잘 들어오는지 확인 필요
            const kakaoProfile = profile as any;
            if (kakaoProfile?.properties?.nickname) {
              userData.name = kakaoProfile.properties.nickname;
            }
            if (kakaoProfile?.kakao_account?.email) {
              userData.email = kakaoProfile.kakao_account.email;
            }
            if (kakaoProfile?.properties?.profile_image) {
              userData.avatar = kakaoProfile.properties.profile_image;
            }
          }

          // 사용자 데이터 검증
          if (!userData.name || !userData.email) {
            console.error('사용자 정보가 부족합니다:', userData);
            // 카카오의 경우 이메일 동의가 필수인지 확인 필요
            // 이메일이 없는 경우 가짜 이메일 생성 등으로 처리하거나 에러 리턴
            if (account.provider === 'kakao' && !userData.email) {
              userData.email = `${userData.providerId}@kakao.placeholder.com`; // 이메일 없을 경우 임시 처리
            } else if (!userData.email) {
              return false; // 다른 제공자는 이메일 필수
            }
          }

          // 기존 사용자 확인
          const existingUser = await User.findOne({
            $or: [
              { email: userData.email },
              { providerId: userData.providerId }
            ]
          });

          if (!existingUser) {
            // 추천인 쿠키 확인
            const cookieStore = await cookies();
            const referralCode = cookieStore.get('referral_code')?.value;
            let validReferredBy = null;

            if (referralCode) {
              const referrer = await User.findOne({ referralCode });
              if (referrer) {
                validReferredBy = referrer.referralCode;
              }
            }

            // 새 사용자 생성
            const newUser = new User({
              ...userData,
              role: 'member',
              grade: 'cedar', // 신규 회원은 Cedar 등급
              points: 0,
              addresses: [],
              referredBy: validReferredBy, // 추천인 연결
            });

            // 추천 코드 자동 생성
            if (!newUser.referralCode) {
              const base = newUser._id.toString().slice(-6).toUpperCase();
              newUser.referralCode = `RF${base}`;
            }

            await newUser.save();
            console.log('새 사용자 생성:', newUser);
            return '/?welcome=true'; // 신규 가입 시 환영 메시지 표시를 위해 리다이렉트
          } else {
            // 기존 사용자 업데이트
            // 기존 데이터가 있으면 유지하고, 없으면 업데이트 (선택 사항)
            // 여기서는 최신 프로필로 업데이트
            existingUser.name = userData.name;
            existingUser.avatar = userData.avatar;
            // providerId가 없던 기존 이메일 가입자와 연동
            if (!existingUser.providerId) {
              existingUser.provider = userData.provider;
              existingUser.providerId = userData.providerId;
            }
            existingUser.emailVerified = true;
            await existingUser.save();
            console.log('기존 사용자 업데이트:', existingUser);
          }
        } catch (error) {
          console.error('사용자 저장 오류:', error);
        }
        return true;
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