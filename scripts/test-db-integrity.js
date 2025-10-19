// 데이터베이스 무결성 테스트 스크립트
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseIntegrity() {
  try {
    console.log('🔍 데이터베이스 무결성 테스트 시작...');
    
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: true,
    });
    
    console.log('✅ MongoDB 연결 성공');
    
    const db = mongoose.connection.db;
    let integrityIssues = [];
    
    // 1. 사용자 데이터 무결성 검사
    console.log('\n👥 1. 사용자 데이터 무결성 검사');
    const users = await db.collection('users').find({}).toArray();
    
    for (const user of users) {
      // 필수 필드 검사
      if (!user.email) {
        integrityIssues.push(`사용자 ${user._id}: 이메일 누락`);
      }
      if (!user.name) {
        integrityIssues.push(`사용자 ${user._id}: 이름 누락`);
      }
      if (!user.password) {
        integrityIssues.push(`사용자 ${user._id}: 비밀번호 누락`);
      }
      
      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (user.email && !emailRegex.test(user.email)) {
        integrityIssues.push(`사용자 ${user._id}: 잘못된 이메일 형식 (${user.email})`);
      }
      
      // 역할 검사
      const validRoles = ['admin', 'partner', 'user'];
      if (user.role && !validRoles.includes(user.role)) {
        integrityIssues.push(`사용자 ${user._id}: 잘못된 역할 (${user.role})`);
      }
    }
    
    console.log(`  - 검사된 사용자 수: ${users.length}명`);
    console.log(`  - 무결성 문제: ${integrityIssues.filter(issue => issue.includes('사용자')).length}개`);
    
    // 2. 상품 데이터 무결성 검사
    console.log('\n🛍️ 2. 상품 데이터 무결성 검사');
    const products = await db.collection('products').find({}).toArray();
    
    for (const product of products) {
      // 필수 필드 검사
      if (!product.name) {
        integrityIssues.push(`상품 ${product._id}: 이름 누락`);
      }
      if (!product.price) {
        integrityIssues.push(`상품 ${product._id}: 가격 누락`);
      }
      if (product.price < 0) {
        integrityIssues.push(`상품 ${product._id}: 음수 가격 (${product.price})`);
      }
      if (product.stock < 0) {
        integrityIssues.push(`상품 ${product._id}: 음수 재고 (${product.stock})`);
      }
      
      // 가격 일관성 검사
      if (product.originalPrice && product.originalPrice < product.price) {
        integrityIssues.push(`상품 ${product._id}: 원가가 판매가보다 낮음`);
      }
    }
    
    console.log(`  - 검사된 상품 수: ${products.length}개`);
    console.log(`  - 무결성 문제: ${integrityIssues.filter(issue => issue.includes('상품')).length}개`);
    
    // 3. 주문 데이터 무결성 검사
    console.log('\n📦 3. 주문 데이터 무결성 검사');
    const orders = await db.collection('orders').find({}).toArray();
    
    for (const order of orders) {
      // 필수 필드 검사
      if (!order.userId) {
        integrityIssues.push(`주문 ${order._id}: 사용자 ID 누락`);
      }
      if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        integrityIssues.push(`주문 ${order._id}: 주문 아이템 누락 또는 비어있음`);
      }
      if (!order.totalAmount || order.totalAmount <= 0) {
        integrityIssues.push(`주문 ${order._id}: 잘못된 총 금액 (${order.totalAmount})`);
      }
      
      // 주문 아이템 검사
      if (order.items) {
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i];
          if (!item.productId) {
            integrityIssues.push(`주문 ${order._id}: 아이템 ${i}의 상품 ID 누락`);
          }
          if (!item.quantity || item.quantity <= 0) {
            integrityIssues.push(`주문 ${order._id}: 아이템 ${i}의 수량 누락 또는 잘못됨 (${item.quantity})`);
          }
          if (!item.price || item.price <= 0) {
            integrityIssues.push(`주문 ${order._id}: 아이템 ${i}의 가격 누락 또는 잘못됨 (${item.price})`);
          }
        }
      }
      
      // 상태 검사
      const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
      if (order.status && !validStatuses.includes(order.status)) {
        integrityIssues.push(`주문 ${order._id}: 잘못된 상태 (${order.status})`);
      }
    }
    
    console.log(`  - 검사된 주문 수: ${orders.length}개`);
    console.log(`  - 무결성 문제: ${integrityIssues.filter(issue => issue.includes('주문')).length}개`);
    
    // 4. 외래 키 참조 무결성 검사
    console.log('\n🔗 4. 외래 키 참조 무결성 검사');
    
    // 주문의 사용자 참조 검사
    for (const order of orders) {
      if (order.userId) {
        const userExists = await db.collection('users').findOne({ _id: order.userId });
        if (!userExists) {
          integrityIssues.push(`주문 ${order._id}: 존재하지 않는 사용자 참조 (${order.userId})`);
        }
      }
      
      // 주문 아이템의 상품 참조 검사
      if (order.items) {
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i];
          if (item.productId) {
            const productExists = await db.collection('products').findOne({ _id: item.productId });
            if (!productExists) {
              integrityIssues.push(`주문 ${order._id}: 아이템 ${i}의 존재하지 않는 상품 참조 (${item.productId})`);
            }
          }
        }
      }
    }
    
    // 5. 장바구니 데이터 무결성 검사
    console.log('\n🛒 5. 장바구니 데이터 무결성 검사');
    const carts = await db.collection('carts').find({}).toArray();
    
    for (const cart of carts) {
      if (!cart.userId) {
        integrityIssues.push(`장바구니 ${cart._id}: 사용자 ID 누락`);
      }
      
      if (cart.items && Array.isArray(cart.items)) {
        for (let i = 0; i < cart.items.length; i++) {
          const item = cart.items[i];
          if (!item.productId) {
            integrityIssues.push(`장바구니 ${cart._id}: 아이템 ${i}의 상품 ID 누락`);
          }
          if (!item.quantity || item.quantity <= 0) {
            integrityIssues.push(`장바구니 ${cart._id}: 아이템 ${i}의 수량 누락 또는 잘못됨 (${item.quantity})`);
          }
        }
      }
    }
    
    console.log(`  - 검사된 장바구니 수: ${carts.length}개`);
    console.log(`  - 무결성 문제: ${integrityIssues.filter(issue => issue.includes('장바구니')).length}개`);
    
    // 6. 중복 데이터 검사
    console.log('\n🔄 6. 중복 데이터 검사');
    
    // 중복 이메일 검사
    const emailCounts = {};
    for (const user of users) {
      if (user.email) {
        emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
      }
    }
    
    for (const [email, count] of Object.entries(emailCounts)) {
      if (count > 1) {
        integrityIssues.push(`중복 이메일: ${email} (${count}개)`);
      }
    }
    
    // 중복 상품 slug 검사
    const slugCounts = {};
    for (const product of products) {
      if (product.slug) {
        slugCounts[product.slug] = (slugCounts[product.slug] || 0) + 1;
      }
    }
    
    for (const [slug, count] of Object.entries(slugCounts)) {
      if (count > 1) {
        integrityIssues.push(`중복 상품 slug: ${slug} (${count}개)`);
      }
    }
    
    // 7. 무결성 검사 결과
    console.log('\n📊 7. 무결성 검사 결과');
    console.log(`  - 총 무결성 문제: ${integrityIssues.length}개`);
    
    if (integrityIssues.length === 0) {
      console.log('✅ 모든 데이터가 무결성을 유지하고 있습니다!');
    } else {
      console.log('❌ 다음 무결성 문제가 발견되었습니다:');
      integrityIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    // 8. 데이터베이스 통계
    console.log('\n📈 8. 데이터베이스 통계');
    const collections = await db.listCollections().toArray();
    console.log(`  - 총 컬렉션 수: ${collections.length}개`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count}개 문서`);
    }
    
    console.log('\n✅ 데이터베이스 무결성 테스트 완료');
    
  } catch (error) {
    console.error('❌ 데이터베이스 무결성 테스트 실패:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

testDatabaseIntegrity();













