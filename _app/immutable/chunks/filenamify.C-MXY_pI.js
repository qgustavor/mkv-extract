function f(){return/[<>:"/\\|?*\u0000-\u001F]/g}function h(){return/^(con|prn|aux|nul|com\d|lpt\d)$/i}const r=100,m=/^\.+(\\|\/)|^\.+$/,p=/\.+$/;function x(e,c={}){const o=/[\u0000-\u001F\u0080-\u009F]/g,u=/([<>:"/\\|?*\u0000-\u001F]){2,}/g;if(typeof e!="string")throw new TypeError("Expected a string");const a=c.replacement===void 0?"!":c.replacement;if(f().test(a)&&o.test(a))throw new Error("Replacement string cannot contain reserved filename characters");a.length>0&&(e=e.replace(u,"$1")),e=e.normalize("NFD"),e=e.replace(m,a),e=e.replace(f(),a),e=e.replace(o,a),e=e.replace(p,""),a.length>0&&(!(e[0]===".")&&e[0]==="."&&(e=a+e),e[e.length-1]==="."&&(e+=a)),e=h().test(e)?e+a:e;const t=typeof c.maxLength=="number"?c.maxLength:r;if(e.length>t){const l=e.lastIndexOf(".");if(l===-1)e=e.slice(0,t);else{const d=e.slice(0,l),n=e.slice(l);e=d.slice(0,Math.max(1,t-n.length))+n}}return e}export{x as default};