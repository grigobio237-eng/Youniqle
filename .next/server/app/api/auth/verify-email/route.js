(()=>{var a={};a.id=268,a.ids=[268],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{A:()=>i,X:()=>h});var d=c(56037),e=c.n(d);let f=process.env.MONGODB_URI;if(!f)throw Error("Please define the MONGODB_URI environment variable inside .env.local");let g=global.mongoose;async function h(){if(g.conn)return g.conn;g.promise||(g.promise=e().connect(f,{bufferCommands:!1}).then(a=>a));try{g.conn=await g.promise}catch(a){throw g.promise=null,a}return g.conn}g||(g=global.mongoose={conn:null,promise:null});let i=h},41649:(a,b,c)=>{"use strict";c.d(b,{H:()=>h,generateVerificationExpiry:()=>g,generateVerificationToken:()=>f});var d=c(55511),e=c.n(d);function f(){return e().randomBytes(32).toString("hex")}function g(){let a=new Date;return a.setHours(a.getHours()+24),a}function h(a){return new Date>a}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},56037:a=>{"use strict";a.exports=require("mongoose")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64510:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>G,patchFetch:()=>F,routeModule:()=>B,serverHooks:()=>E,workAsyncStorage:()=>C,workUnitAsyncStorage:()=>D});var d={};c.r(d),c.d(d,{GET:()=>z,POST:()=>A});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(35552),w=c(77812),x=c(41649),y=c(82716);async function z(a){try{let{searchParams:b}=new URL(a.url),c=b.get("token");if(!c)return u.NextResponse.json({error:"인증 토큰이 필요합니다."},{status:400});await (0,v.A)();let d=await w.A.findOne({emailVerificationToken:c,emailVerified:!1});if(!d)return u.NextResponse.json({error:"유효하지 않은 인증 토큰입니다."},{status:400});if(d.emailVerificationExpires&&(0,x.H)(d.emailVerificationExpires))return u.NextResponse.json({error:"인증 토큰이 만료되었습니다. 다시 인증해주세요."},{status:400});return d.emailVerified=!0,d.emailVerificationToken=void 0,d.emailVerificationExpires=void 0,await d.save(),await (0,y.v)(d.email,d.name),u.NextResponse.json({message:"이메일 인증이 완료되었습니다!",user:{id:d._id,name:d.name,email:d.email}},{status:200})}catch(a){return console.error("Email verification error:",a),u.NextResponse.json({error:"서버 오류가 발생했습니다."},{status:500})}}async function A(a){try{let{email:b}=await a.json();if(!b)return u.NextResponse.json({error:"이메일이 필요합니다."},{status:400});await (0,v.A)();let d=await w.A.findOne({email:b,emailVerified:!1});if(!d)return u.NextResponse.json({error:"인증이 필요한 계정을 찾을 수 없습니다."},{status:404});let{generateVerificationToken:e,generateVerificationExpiry:f}=await Promise.resolve().then(c.bind(c,41649)),{sendVerificationEmail:g}=await Promise.resolve().then(c.bind(c,82716));d.emailVerificationToken=e(),d.emailVerificationExpires=f(),await d.save();let h=await g(d.email,d.emailVerificationToken,d.name);if(!h.success)return u.NextResponse.json({error:h.error},{status:500});return u.NextResponse.json({message:"인증 이메일이 재발송되었습니다."},{status:200})}catch(a){return console.error("Resend verification error:",a),u.NextResponse.json({error:"서버 오류가 발생했습니다."},{status:500})}}let B=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/auth/verify-email/route",pathname:"/api/auth/verify-email",filename:"route",bundlePath:"app/api/auth/verify-email/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"F:\\youniqle\\src\\app\\api\\auth\\verify-email\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:C,workUnitAsyncStorage:D,serverHooks:E}=B;function F(){return(0,g.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:D})}async function G(a,b,c){var d;let e="/api/auth/verify-email/route";"/index"===e&&(e="/");let g=await B.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||B.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===B.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>B.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>B.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await B.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await B.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await B.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},74075:a=>{"use strict";a.exports=require("zlib")},77812:(a,b,c)=>{"use strict";c.d(b,{A:()=>g});var d=c(56037),e=c.n(d);let f=new d.Schema({email:{type:String,required:!0,unique:!0,lowercase:!0,trim:!0},passwordHash:{type:String,required:function(){return"local"===this.provider}},name:{type:String,required:!0,trim:!0},phone:{type:String,trim:!0},avatar:{type:String},role:{type:String,enum:["member","partner","admin"],default:"member"},grade:{type:String,enum:["cedar","rooter","bloomer","glower","ecosoul"],default:"cedar"},points:{type:Number,default:0},referralCode:{type:String,unique:!0,sparse:!0},referredBy:{type:String},provider:{type:String,enum:["local","google","kakao","naver"],default:"local"},providerId:{type:String},marketingConsent:{type:Boolean,default:!1},emailVerified:{type:Boolean,default:!1},emailVerificationToken:{type:String},emailVerificationExpires:{type:Date},addresses:[{label:{type:String,required:!0},recipient:{type:String,required:!0},phone:{type:String,required:!1},zip:{type:String,required:!0},addr1:{type:String,required:!0},addr2:{type:String}}],wishlist:[{productId:{type:d.Schema.Types.ObjectId,ref:"Product",required:!0},addedAt:{type:Date,default:Date.now}}]},{timestamps:!0}),g=e().models.User||e().model("User",f)},78335:()=>{},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81630:a=>{"use strict";a.exports=require("http")},82716:(a,b,c)=>{"use strict";c.d(b,{sendVerificationEmail:()=>e,v:()=>f});let d=c(52731).createTransport({host:process.env.SMTP_HOST||"smtps.hiworks.com",port:parseInt(process.env.SMTP_PORT||"465"),secure:!0,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},tls:{rejectUnauthorized:!1}});async function e(a,b,c){let e=`http://localhost:3000/auth/verify-email?token=${b}`,f={from:process.env.EMAIL_FROM,to:a,subject:"Youniqle 이메일 인증",html:`
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #3B82F6, #10B981); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Youniqle</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">프리미엄을 더 공정하게</p>
        </div>
        
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">이메일 인증이 필요합니다</h2>
          
          <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            안녕하세요, ${c}님!<br>
            Youniqle 회원가입을 완료하려면 이메일 인증이 필요합니다.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${e}" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              이메일 인증하기
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
            위 버튼이 작동하지 않는다면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
            <a href="${e}" style="color: #3B82F6; word-break: break-all;">${e}</a>
          </p>
          
          <div style="margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              ⚠️ 이 링크는 24시간 후에 만료됩니다.<br>
              만약 회원가입을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
            </p>
          </div>
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            \xa9 2024 Youniqle. All rights reserved.<br>
            서울특별시 강동구 고덕비즈밸리로 26 | 1577-0729
          </p>
        </div>
      </div>
    `};try{return await d.sendMail(f),{success:!0}}catch(a){return console.error("Email sending error:",a),{success:!1,error:"이메일 발송에 실패했습니다."}}}async function f(a,b){let c={from:process.env.EMAIL_FROM,to:a,subject:"Youniqle에 오신 것을 환영합니다!",html:`
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #3B82F6, #10B981); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Youniqle</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">프리미엄을 더 공정하게</p>
        </div>
        
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">환영합니다! 🎉</h2>
          
          <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            안녕하세요, ${b}님!<br>
            Youniqle 회원가입이 완료되었습니다.
          </p>
          
          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E40AF; margin: 0 0 10px 0; font-size: 18px;">🎁 신규 회원 혜택</h3>
            <ul style="color: #1E40AF; margin: 0; padding-left: 20px;">
              <li>10% 할인 쿠폰 (첫 구매 시 사용 가능)</li>
              <li>무료 배송 (3만원 이상 구매 시)</li>
              <li>멤버십 포인트 적립</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/products" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              쇼핑 시작하기
            </a>
          </div>
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            \xa9 2024 Youniqle. All rights reserved.<br>
            서울특별시 강동구 고덕비즈밸리로 26 | 1577-0729
          </p>
        </div>
      </div>
    `};try{return await d.sendMail(c),{success:!0}}catch(a){return console.error("Welcome email sending error:",a),{success:!1,error:"환영 이메일 발송에 실패했습니다."}}}},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[996,692,112],()=>b(b.s=64510));module.exports=c})();