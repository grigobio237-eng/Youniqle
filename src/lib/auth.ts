import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
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
      if (account?.provider === 'google' || account?.provider === 'kakao' || account?.provider === 'naver') {
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

          // 카카오 로그인 시 추가 정보 매핑
          if (account.provider === 'kakao' && profile) {
            const kakaoProfile = profile as any;
            console.log('카카오 프로필 데이터:', JSON.stringify(profile, null, 2));
            console.log('카카오 사용자 데이터:', JSON.stringify(user, null, 2));
            
            userData.name = kakaoProfile.kakao_account?.profile?.nickname || kakaoProfile.properties?.nickname || user.name || '';
            userData.email = kakaoProfile.kakao_account?.email || user.email || '';
            userData.avatar = kakaoProfile.kakao_account?.profile?.profile_image_url || kakaoProfile.properties?.profile_image || user.image || '';
            
            console.log('매핑된 사용자 데이터:', userData);
          }

          // 구글 로그인 시 추가 정보 매핑
          if (account.provider === 'google' && profile) {
            const googleProfile = profile as any;
            userData.name = googleProfile.name || user.name || '';
            userData.email = googleProfile.email || user.email || '';
            userData.avatar = googleProfile.picture || user.image || '';
          }

          // 네이버 로그인 시 추가 정보 매핑
          if (account.provider === 'naver' && profile) {
            const naverProfile = profile as any;
            userData.name = naverProfile.name || user.name || '';
            userData.email = naverProfile.email || user.email || '';
            userData.avatar = naverProfile.profile_image || user.image || '';
          }

          // 사용자 데이터 검증
          if (!userData.name || !userData.email) {
            console.error('사용자 정보가 부족합니다:', userData);
            return false; // 로그인 실패
          }

          // 기존 사용자 확인
          const existingUser = await User.findOne({ 
            $or: [
              { email: userData.email },
              { providerId: userData.providerId }
            ]
          });

          if (!existingUser) {
            // 새 사용자 생성
            const newUser = new User({
              ...userData,
              role: 'member',
              grade: 'cedar',
              points: 0,
              addresses: [],
            });
            await newUser.save();
            console.log('새 사용자 생성:', newUser);
          } else {
            // 기존 사용자 업데이트
            existingUser.name = userData.name;
            existingUser.email = userData.email;
            existingUser.avatar = userData.avatar;
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
      
      // 카카오 로그인 시 사용자 정보 매핑
      if (account?.provider === 'kakao' && profile) {
        const kakaoProfile = profile as any;
        token.name = kakaoProfile.kakao_account?.profile?.nickname || kakaoProfile.properties?.nickname || user.name;
        token.email = kakaoProfile.kakao_account?.email || user.email;
        token.image = kakaoProfile.kakao_account?.profile?.profile_image_url || kakaoProfile.properties?.profile_image || user.image;
      }
      
      // 구글 로그인 시 사용자 정보 매핑
      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as any;
        token.name = googleProfile.name || user.name;
        token.email = googleProfile.email || user.email;
        token.image = googleProfile.picture || user.image;
      }
      
      // 네이버 로그인 시 사용자 정보 매핑
      if (account?.provider === 'naver' && profile) {
        const naverProfile = profile as any;
        token.name = naverProfile.name || user.name;
        token.email = naverProfile.email || user.email;
        token.image = naverProfile.profile_image || user.image;
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 비밀번호 검증 함수
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT 토큰 생성 함수
export function generateToken(payload: any): string {
  // 실제 구현에서는 JWT 라이브러리를 사용해야 합니다
  // 여기서는 간단한 예시입니다
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 인증 쿠키 생성 함수
export function createAuthCookie(token: string): string {
  return `auth-token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

// 로그아웃 쿠키 생성 함수
export function createLogoutCookie(): string {
  return `auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export default NextAuth(authOptions);