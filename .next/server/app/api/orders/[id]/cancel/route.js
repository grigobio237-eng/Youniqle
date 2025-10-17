"use strict";(()=>{var a={};a.id=3878,a.ids=[3878],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11723:a=>{a.exports=require("querystring")},12412:a=>{a.exports=require("assert")},14150:(a,b,c)=>{c.d(b,{E:()=>f,g:()=>g});let d=c(52731).createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"465"),secure:!0,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}),e={confirmed:{subject:"주문이 확인되었습니다",template:(a,b)=>`
안녕하세요 ${b}님,

주문번호 ${a}의 주문이 확인되었습니다.
곧 상품 준비를 시작하겠습니다.

감사합니다.
Youniqle 팀
    `.trim()},preparing:{subject:"상품 준비를 시작했습니다",template:(a,b)=>`
안녕하세요 ${b}님,

주문번호 ${a}의 상품 준비를 시작했습니다.
곧 배송 준비가 완료되면 배송을 시작하겠습니다.

감사합니다.
Youniqle 팀
    `.trim()},shipped:{subject:"배송이 시작되었습니다",template:(a,b)=>`
안녕하세요 ${b}님,

주문번호 ${a}의 배송이 시작되었습니다.
배송 추적을 통해 상품 위치를 확인하실 수 있습니다.

감사합니다.
Youniqle 팀
    `.trim()},delivered:{subject:"배송이 완료되었습니다",template:(a,b)=>`
안녕하세요 ${b}님,

주문번호 ${a}의 배송이 완료되었습니다.
상품을 받아보시고 만족스러우시다면 리뷰를 남겨주세요.

감사합니다.
Youniqle 팀
    `.trim()},cancelled:{subject:"주문이 취소되었습니다",template:(a,b)=>`
안녕하세요 ${b}님,

주문번호 ${a}의 주문이 취소되었습니다.
환불 처리는 영업일 기준 3-5일 소요됩니다.

감사합니다.
Youniqle 팀
    `.trim()}};async function f(a,b,c,f){try{let g=e[f];if(!g)return console.error(`알림 메시지가 정의되지 않은 상태: ${f}`),!1;let h={from:process.env.EMAIL_FROM,to:c,subject:`[Youniqle] ${g.subject}`,text:g.template(a,b),html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${g.subject}</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; line-height: 1.6;">${g.template(a,b).replace(/\n/g,"<br>")}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/orders" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              주문 내역 확인하기
            </a>
          </div>
        </div>
      `};return await d.sendMail(h),console.log(`주문 상태 알림 발송 완료: ${a} - ${f}`),!0}catch(a){return console.error("주문 상태 알림 발송 실패:",a),!1}}async function g(a,b,c,e){try{let f={from:process.env.EMAIL_FROM,to:c,subject:"[Youniqle] 환불 처리 안내",text:`
안녕하세요 ${b}님,

주문번호 ${a}의 환불이 처리되었습니다.
환불 금액: ₩${e.toLocaleString()}

환불은 영업일 기준 3-5일 내에 원래 결제 수단으로 입금됩니다.

감사합니다.
Youniqle 팀
      `.trim(),html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">환불 처리 안내</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>안녕하세요 ${b}님,</p>
            <p>주문번호 <strong>${a}</strong>의 환불이 처리되었습니다.</p>
            <p><strong>환불 금액: ₩${e.toLocaleString()}</strong></p>
            <p>환불은 영업일 기준 3-5일 내에 원래 결제 수단으로 입금됩니다.</p>
            <p>감사합니다.<br>Youniqle 팀</p>
          </div>
        </div>
      `};return await d.sendMail(f),console.log(`환불 알림 발송 완료: ${a}`),!0}catch(a){return console.error("환불 알림 발송 실패:",a),!1}}},14985:a=>{a.exports=require("dns")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{a.exports=require("os")},27910:a=>{a.exports=require("stream")},28354:a=>{a.exports=require("util")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},32047:(a,b,c)=>{c.d(b,{A:()=>g});var d=c(56037),e=c.n(d);let f=new d.Schema({userId:{type:d.Schema.Types.ObjectId,ref:"User",required:!0},items:[{productId:{type:d.Schema.Types.ObjectId,ref:"Product",required:!0},name:{type:String,required:!0},price:{type:Number,required:!0},quantity:{type:Number,required:!0,min:1},imageUrl:{type:String},partnerId:{type:d.Schema.Types.ObjectId,ref:"User"}}],totalAmount:{type:Number,required:!0,min:0},status:{type:String,enum:["pending","confirmed","shipped","delivered","cancelled"],default:"pending"},shippingAddress:{label:{type:String,required:!0},recipient:{type:String,required:!0},phone:{type:String,required:!0},zip:{type:String,required:!0},addr1:{type:String,required:!0},addr2:{type:String}},paymentMethod:{type:String,required:!0},paymentStatus:{type:String,enum:["pending","completed","failed"],default:"pending"},partnerOrders:[{partnerId:{type:d.Schema.Types.ObjectId,ref:"User",required:!0},partnerName:{type:String,required:!0},items:[{productId:{type:d.Schema.Types.ObjectId,ref:"Product",required:!0},name:{type:String,required:!0},price:{type:Number,required:!0},quantity:{type:Number,required:!0}}],subtotal:{type:Number,required:!0},commission:{type:Number,required:!0},status:{type:String,enum:["pending","confirmed","shipped","delivered","cancelled"],default:"pending"},trackingNumber:{type:String},shippedAt:{type:Date},deliveredAt:{type:Date}}]},{timestamps:!0});f.index({userId:1,createdAt:-1}),f.index({status:1}),f.index({partnerId:1});let g=e().models.Order||e().model("Order",f)},33873:a=>{a.exports=require("path")},34631:a=>{a.exports=require("tls")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},55591:a=>{a.exports=require("https")},56037:a=>{a.exports=require("mongoose")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:a=>{a.exports=require("zlib")},79428:a=>{a.exports=require("buffer")},79551:a=>{a.exports=require("url")},79646:a=>{a.exports=require("child_process")},81630:a=>{a.exports=require("http")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},87215:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>H,patchFetch:()=>G,routeModule:()=>C,serverHooks:()=>F,workAsyncStorage:()=>D,workUnitAsyncStorage:()=>E});var d={};c.r(d),c.d(d,{PUT:()=>B});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(52963),w=c(67360),x=c(35552),y=c(32047),z=c(14150),A=c(95112);async function B(a,{params:b}){try{let a=await (0,v.getServerSession)(w.Nh);if(!a?.user?.email)return u.NextResponse.json({error:"로그인이 필요합니다."},{status:401});let{id:d}=await b;await (0,x.connectDB)();let e=await y.A.findOne({_id:d,userId:a.user.email});if(!e)return u.NextResponse.json({error:"주문을 찾을 수 없습니다."},{status:404});if(!["pending","confirmed"].includes(e.status))return u.NextResponse.json({error:"취소할 수 없는 주문입니다."},{status:400});if("paid"===e.paymentStatus)for(let a of e.items)await A.y.returnStock(a.productId,a.quantity);else for(let a of e.items)await A.y.cancelReservation(a.productId,a.quantity);e.status="cancelled",e.updatedAt=new Date,await e.save();try{let b=(await Promise.resolve().then(c.bind(c,77812))).default,d=await b.findOne({email:a.user.email});d&&d.email&&(await (0,z.E)(e.orderNumber,d.name||"고객",d.email,"cancelled"),"paid"===e.paymentStatus&&await (0,z.g)(e.orderNumber,d.name||"고객",d.email,e.totalAmount))}catch(a){console.error("알림 발송 실패:",a)}return u.NextResponse.json({message:"주문이 취소되었습니다.",order:e})}catch(a){return console.error("주문 취소 오류:",a),u.NextResponse.json({error:"주문 취소 중 오류가 발생했습니다."},{status:500})}}let C=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/orders/[id]/cancel/route",pathname:"/api/orders/[id]/cancel",filename:"route",bundlePath:"app/api/orders/[id]/cancel/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"F:\\youniqle\\src\\app\\api\\orders\\[id]\\cancel\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:D,workUnitAsyncStorage:E,serverHooks:F}=C;function G(){return(0,g.patchFetch)({workAsyncStorage:D,workUnitAsyncStorage:E})}async function H(a,b,c){var d;let e="/api/orders/[id]/cancel/route";"/index"===e&&(e="/");let g=await C.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||C.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===C.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>C.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>C.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await C.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await C.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await C.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},91645:a=>{a.exports=require("net")},94735:a=>{a.exports=require("events")}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4996,641,7371,5112,7082,7703,2684,350],()=>b(b.s=87215));module.exports=c})();