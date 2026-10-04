(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,46794,e=>{"use strict";var t=e.i(43476),r=e.i(932),a=e.i(75056),o=e.i(71645),i=e.i(1899),n=e.i(90072);let l=parseInt(n.REVISION.replace(/\D+/g,""));class c extends n.ShaderMaterial{constructor(){super({uniforms:{time:{value:0},fade:{value:1}},vertexShader:`
      uniform float time;
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
        gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
        gl_Position = projectionMatrix * mvPosition;
      }`,fragmentShader:`
      uniform sampler2D pointTexture;
      uniform float fade;
      varying vec3 vColor;
      void main() {
        float opacity = 1.0;
        if (fade == 1.0) {
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
        }
        gl_FragColor = vec4(vColor, opacity);

        #include <tonemapping_fragment>
	      #include <${l>=154?"colorspace_fragment":"encodings_fragment"}>
      }`})}}let s=e=>new n.Vector3().setFromSpherical(new n.Spherical(e,Math.acos(1-2*Math.random()),2*Math.random()*Math.PI)),u=o.forwardRef(({radius:e=100,depth:t=50,count:r=5e3,saturation:a=0,factor:l=4,fade:u=!1,speed:m=1},f)=>{let d=o.useRef(null),[p,v,h]=o.useMemo(()=>{let o=[],i=[],c=Array.from({length:r},()=>(.5+.5*Math.random())*l),u=new n.Color,m=e+t,f=t/r;for(let e=0;e<r;e++)m-=f*Math.random(),o.push(...s(m).toArray()),u.setHSL(e/r,a,.9),i.push(u.r,u.g,u.b);return[new Float32Array(o),new Float32Array(i),new Float32Array(c)]},[r,t,l,e,a]);(0,i.useFrame)(e=>d.current&&(d.current.uniforms.time.value=e.clock.elapsedTime*m));let[g]=o.useState(()=>new c);return o.createElement("points",{ref:f},o.createElement("bufferGeometry",null,o.createElement("bufferAttribute",{attach:"attributes-position",args:[p,3]}),o.createElement("bufferAttribute",{attach:"attributes-color",args:[v,3]}),o.createElement("bufferAttribute",{attach:"attributes-size",args:[h,1]})),o.createElement("primitive",{ref:d,object:g,attach:"material",blending:n.AdditiveBlending,"uniforms-fade-value":u,depthWrite:!1,transparent:!0,vertexColors:!0}))});function m(e){let o,i,n,l=(0,r.c)(4),{count:c}=e;return l[0]===Symbol.for("react.memo_cache_sentinel")?(o={position:[0,0,1]},i=[1,1.5],l[0]=o,l[1]=i):(o=l[0],i=l[1]),l[2]!==c?(n=(0,t.jsx)(a.Canvas,{camera:o,dpr:i,frameloop:"demand",children:(0,t.jsx)(u,{radius:100,depth:50,count:c,factor:4,saturation:0,fade:!0,speed:0})}),l[2]=c,l[3]=n):n=l[3],n}e.s(["default",()=>m],46794)},93648,e=>{e.n(e.i(46794))}]);