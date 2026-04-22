import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ code: string }> 
}): Promise<Metadata> {
  const { code } = await params;
  
  try {
    await dbConnect();
    // 대소문자 구분 없이 검색
    const user = await User.findOne({ 
      referralCode: { $regex: new RegExp(`^${code}$`, 'i') },
      isDeleted: { $ne: true }
    }).select('name').lean();
    
    const userName = user?.name || 'Youniqle';
    const title = `${userName}님의 초대장 - Youniqle`;
    const description = `${userName}님이 당신을 Youniqle에 초대했습니다. 60초 진단으로 데이터 기반 맞춤 회복 솔루션을 경험하세요.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: '/images/og-referral.png',
            width: 1200,
            height: 630,
            alt: 'Youniqle 초대장',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/images/og-referral.png'],
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Youniqle 초대장',
      images: ['/images/og-referral.png'],
    };
  }
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
