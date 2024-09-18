function P(m){return m&&m.__esModule&&Object.prototype.hasOwnProperty.call(m,"default")?m.default:m}var M={exports:{}};/*! streamsaver. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */(function(m){((s,o)=>{m.exports=o()})("streamSaver",()=>{const s=typeof window=="object"?window:this;s.HTMLElement||console.warn("streamsaver is meant to run on browsers main thread");let o=null,b=!1;const T=a=>{try{a()}catch{}},L=s.WebStreamsPolyfill||{},h=s.isSecureContext;let p=/constructor/i.test(s.HTMLElement)||!!s.safari||!!s.WebKitPoint;const S=h||"MozAppearance"in document.documentElement.style?"iframe":"navigate",c={createWriteStream:W,WritableStream:s.WritableStream||L.WritableStream,supported:!0,version:{full:"2.0.5",major:2,minor:0,dot:5},mitm:"https://jimmywarting.github.io/StreamSaver.js/mitm.html?version=2.0.0"};function v(a){if(!a)throw new Error("meh");const e=document.createElement("iframe");return e.hidden=!0,e.src=a,e.loaded=!1,e.name="iframe",e.isIframe=!0,e.postMessage=(...l)=>e.contentWindow.postMessage(...l),e.addEventListener("load",()=>{e.loaded=!0},{once:!0}),document.body.appendChild(e),e}function j(a){const e="width=200,height=100",l=document.createDocumentFragment(),r={frame:s.open(a,"popup",e),loaded:!1,isIframe:!1,isPopup:!0,remove(){r.frame.close()},addEventListener(...t){l.addEventListener(...t)},dispatchEvent(...t){l.dispatchEvent(...t)},removeEventListener(...t){l.removeEventListener(...t)},postMessage(...t){r.frame.postMessage(...t)}},f=t=>{t.source===r.frame&&(r.loaded=!0,s.removeEventListener("message",f),r.dispatchEvent(new Event("load")))};return s.addEventListener("message",f),r}try{new Response(new ReadableStream),h&&!("serviceWorker"in navigator)&&(p=!0)}catch{p=!0}T(()=>{const{readable:a}=new TransformStream,e=new MessageChannel;e.port1.postMessage(a,[a]),e.port1.close(),e.port2.close(),b=!0,Object.defineProperty(c,"TransformStream",{configurable:!1,writable:!1,value:TransformStream})});function C(){o||(o=h?v(c.mitm):j(c.mitm))}function W(a,e,l){let r={size:null,pathname:null,writableStrategy:void 0,readableStrategy:void 0},f=0,t=null,n=null,g=null;if(Number.isFinite(e)?([l,e]=[e,l],console.warn("[StreamSaver] Deprecated pass an object as 2nd argument when creating a write stream"),r.size=l,r.writableStrategy=e):e&&e.highWaterMark?(console.warn("[StreamSaver] Deprecated pass an object as 2nd argument when creating a write stream"),r.size=l,r.writableStrategy=e):r=e||{},!p){C(),n=new MessageChannel,a=encodeURIComponent(a.replace(/\//g,":")).replace(/['()]/g,escape).replace(/\*/g,"%2A");const i={transferringReadable:b,pathname:r.pathname||Math.random().toString().slice(-6)+"/"+a,headers:{"Content-Type":"application/octet-stream; charset=utf-8","Content-Disposition":"attachment; filename*=UTF-8''"+a}};r.size&&(i.headers["Content-Length"]=r.size);const u=[i,"*",[n.port2]];if(b){const d=S==="iframe"?void 0:{transform(y,U){if(!(y instanceof Uint8Array))throw new TypeError("Can only write Uint8Arrays");f+=y.length,U.enqueue(y),t&&(location.href=t,t=null)},flush(){t&&(location.href=t)}};g=new c.TransformStream(d,r.writableStrategy,r.readableStrategy);const E=g.readable;n.port1.postMessage({readableStream:E},[E])}n.port1.onmessage=d=>{d.data.download?S==="navigate"?(o.remove(),o=null,f?location.href=d.data.download:t=d.data.download):(o.isPopup&&(o.remove(),o=null,S==="iframe"&&v(c.mitm)),v(d.data.download)):d.data.abort&&(w=[],n.port1.postMessage("abort"),n.port1.onmessage=null,n.port1.close(),n.port2.close(),n=null)},o.loaded?o.postMessage(...u):o.addEventListener("load",()=>{o.postMessage(...u)},{once:!0})}let w=[];return!p&&g&&g.writable||new c.WritableStream({write(i){if(!(i instanceof Uint8Array))throw new TypeError("Can only write Uint8Arrays");if(p){w.push(i);return}n.port1.postMessage(i),f+=i.length,t&&(location.href=t,t=null)},close(){if(p){const i=new Blob(w,{type:"application/octet-stream; charset=utf-8"}),u=document.createElement("a");u.href=URL.createObjectURL(i),u.download=a,u.click()}else n.port1.postMessage("end")},abort(){w=[],n.port1.postMessage("abort"),n.port1.onmessage=null,n.port1.close(),n.port2.close(),n=null}},r.writableStrategy)}return c})})(M);var R=M.exports;const A=P(R),O=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"}));export{O as S};
