import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: '힐링 라운지 포털｜나를 위한 온전한 회복 공간',
  description: '예술을 통한 시각적 회복을 돕는 회복 갤러리부터 프라이빗 케어 라운지, 과학적인 회복 도구 및 SunNudge 썬케어 루틴까지 프리미엄 회복 서비스를 이용해 보세요.',
};

export default function RecoveryPortalPage() {
  return <ProductsClient />;
}
