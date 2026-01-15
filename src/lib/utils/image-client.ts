/**
 * Base64 이미지를 지정된 해상도와 품질로 압축합니다.
 * @param base64 - 원본 Base64 문자열
 * @param maxWidth - 최대 너비 (기본 1024)
 * @param quality - JPEG 압축 품질 (0~1, 기본 0.8)
 */
export async function compressImage(
    base64: string,
    maxWidth: number = 1024,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!base64 || !base64.startsWith('data:image/')) {
            return resolve(base64);
        }

        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // 해상도 조절
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not found'));

            ctx.drawImage(img, 0, 0, width, height);

            // JPEG로 압축하여 용량 축소
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
    });
}
