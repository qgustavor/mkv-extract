var b=Object.defineProperty;var P=(e,t,n)=>t in e?b(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var y=(e,t,n)=>(P(e,typeof t!="symbol"?t+"":t,n),n);import{r as g,n as w,S as p,b as R,f as C,T as L,o as S,U as B,V as v,W as U,X as O,Y as x,Z as k,_ as A,$ as I,a0 as T,a1 as V}from"./scheduler.sUBCHTxs.js";const m=new Set;let $;function G(){$={r:0,c:[],p:$}}function H(){$.r||g($.c),$=$.p}function W(e,t){e&&e.i&&(m.delete(e),e.i(t))}function J(e,t,n,r){if(e&&e.o){if(m.has(e))return;m.add(e),$.c.push(()=>{m.delete(e),r&&(n&&e.d(1),r())}),e.o(t)}else r&&r()}function K(e,t,n){const r=e.$$.props[t];r!==void 0&&(e.$$.bound[r]=n,n(e.$$.ctx[r]))}function N(e){e&&e.c()}function Q(e,t){e&&e.l(t)}function j(e,t,n){const{fragment:r,after_update:f}=e.$$;r&&r.m(t,n),v(()=>{const u=e.$$.on_mount.map(k).filter(S);e.$$.on_destroy?e.$$.on_destroy.push(...u):g(u),e.$$.on_mount=[]}),f.forEach(v)}function q(e,t){const n=e.$$;n.fragment!==null&&(U(n.after_update),g(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function X(e,t){e.$$.dirty[0]===-1&&(A.push(e),I(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function M(e,t,n,r,f,u,a=null,_=[-1]){const i=O;x(e);const s=e.$$={fragment:null,ctx:[],props:u,update:w,not_equal:f,bound:p(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(i?i.$$.context:[])),callbacks:p(),dirty:_,skip_bound:!1,root:t.target||i.$$.root};a&&a(s.root);let h=!1;if(s.ctx=n?n(e,t.props||{},(d,o,...c)=>{const l=c.length?c[0]:o;return s.ctx&&f(s.ctx[d],s.ctx[d]=l)&&(!s.skip_bound&&s.bound[d]&&s.bound[d](l),h&&X(e,d)),o}):[],s.update(),h=!0,g(s.before_update),s.fragment=r?r(s.ctx):!1,t.target){if(t.hydrate){T();const d=R(t.target);s.fragment&&s.fragment.l(d),d.forEach(C)}else s.fragment&&s.fragment.c();t.intro&&W(e.$$.fragment),j(e,t.target,t.anchor),V(),L()}x(i)}class ee{constructor(){y(this,"$$");y(this,"$$set")}$destroy(){q(this,1),this.$destroy=w}$on(t,n){if(!S(n))return w;const r=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return r.push(n),()=>{const f=r.indexOf(n);f!==-1&&r.splice(f,1)}}$set(t){this.$$set&&!B(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Y="4",Z="modulepreload",z=function(e,t){return new URL(e,t).href},E={},te=function(t,n,r){let f=Promise.resolve();if(n&&n.length>0){const u=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),_=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));f=Promise.all(n.map(i=>{if(i=z(i,r),i in E)return;E[i]=!0;const s=i.endsWith(".css"),h=s?'[rel="stylesheet"]':"";if(!!r)for(let c=u.length-1;c>=0;c--){const l=u[c];if(l.href===i&&(!s||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${i}"]${h}`))return;const o=document.createElement("link");if(o.rel=s?"stylesheet":Z,s||(o.as="script",o.crossOrigin=""),o.href=i,_&&o.setAttribute("nonce",_),document.head.appendChild(o),s)return new Promise((c,l)=>{o.addEventListener("load",c),o.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${i}`)))})}))}return f.then(()=>t()).catch(u=>{const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=u,window.dispatchEvent(a),!a.defaultPrevented)throw u})};typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Y);export{ee as S,te as _,J as a,N as b,H as c,Q as d,q as e,K as f,G as g,M as i,j as m,W as t};