import { Metadata } from 'next';

interface Props {
  children: React.ReactNode;
  params: { shopCode: string };
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { shopCode } = params;
  
  return {
    metadataBase: new URL('https://www.grigobio.co.kr'),
    title: 'Youniqle - 번아웃 극복을 위한 유니클 맞춤 회복 솔루션',
    description: '60초 진단으로 데이터 기반 맞춤 회복 솔루션을 경험하세요',
    openGraph: {
      title: 'Youniqle - 유니클 맞춤 회복 솔루션',
      description: '60초 진단으로 나만의 회복 점수를 확인하세요',
      url: `https://grigobio.co.kr/survey/${shopCode}`,
      siteName: 'Youniqle',
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Youniqle - 유니클 맞춤 회복 솔루션',
      description: '60초 진단으로 데이터 기반 맞춤 회복 솔루션을 경험하세요',
    },
  };
}

export default function SurveyLayout({ children }: Props) {
  return <>{children}</>;
}
