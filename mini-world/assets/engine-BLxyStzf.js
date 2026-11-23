import{c as lr,N as Ht,S as fr,C as Ke,F as Ua,M as nn,V as ze,R as dr,w as Je,a as gt,l as Si,e as vt,b as ei,W as Ei,d as an,f as lt,L as dn,H as Sn,U as Qt,D as Dt,B as bt,g as xn,h as Nn,p as ur,E as pr,i as ht,P as hn,A as hr,j as kn,k as yt,m as Dn,n as ui,o as _n,q as gn,r as Da,s as mr,t as xr,u as ya,v as Gt,x as ti,y as tn,z as yn,G as _r,I as gr,J as cn,O as vr,K as Sr,Q as Er,T as Mr,X as br,Y as Tr,Z as Ar,_ as Rr,$ as Cr,a0 as wr,a1 as Pr,a2 as Lr,a3 as Ur,a4 as Dr,a5 as yr,a6 as Ir,a7 as Nr,a8 as zn,a9 as bn,aa as Fr,ab as mn,ac as Or,ad as Br,ae as Gr,af as Vr,ag as Ia,ah as Hr,ai as kr,aj as zr,ak as Wr,al as ke,am as Xr,an as Yr,ao as qr,ap as zt,aq as Fn,ar as wn,as as It,at as Na,au as kt,av as Lt,aw as Fa,ax as Oa,ay as Ba,az as In,aA as Ga,aB as Va,aC as Ha,aD as ka,aE as Kr,aF as Zr,aG as $r,aH as Qr,aI as za,aJ as $t,aK as Jr,aL as jr,aM as eo,aN as Wn,aO as Xn,aP as Yn,aQ as qn,aR as Qe,aS as Mi,aT as bi,aU as Ti,aV as Ai,aW as Ri,aX as Ci,aY as wi,aZ as Pi,a_ as Li,a$ as Ui,b0 as Di,b1 as yi,b2 as Ii,b3 as Ni,b4 as Fi,b5 as Oi,b6 as Bi,b7 as Gi,b8 as Vi,b9 as Hi,ba as ki,bb as zi,bc as Wi,bd as Xi,be as Yi,bf as qi,bg as Ki,bh as Zi,bi as ni,bj as ii,bk as ai,bl as ri,bm as oi,bn as si,bo as ci,bp as to,bq as $i,br as no,bs as Pn,bt as io,bu as Qi,bv as Ji,bw as ji,bx as li,by as fi,bz as ao,bA as Wa,bB as ro,bC as On,bD as oo,bE as so,bF as Xa,bG as Ut,bH as ea,bI as Ya,bJ as ta,bK as qa,bL as vn,bM as rn,bN as co,bO as un,bP as lo,bQ as fo,bR as uo,bS as na,bT as _t,bU as po,bV as Ka,bW as ho,bX as mo,bY as xo,bZ as Za,b_ as _o,b$ as go,c0 as vo,c1 as So,c2 as Eo,c3 as Mo,c4 as bo,c5 as To,c6 as Ao,c7 as Ro,c8 as Co,c9 as wo,ca as Po,cb as Nt,cc as ct,cd as Lo,ce as Ct,cf as Uo,cg as ia,ch as Do,ci as Ln,cj as Ft,ck as Tn,cl as jt,cm as Kt,cn as aa,co as $a,cp as yo,cq as wt,cr as Ot,cs as Kn,ct as Io,cu as No,cv as Fo,cw as Oo,cx as Bo,cy as Go,cz as ra,cA as Vo,cB as ln,cC as oa,cD as Ho,cE as ko}from"./index-CkUOvYWS.js";/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Qa(){let e=null,n=!1,t=null,i=null;function o(a,d){t(a,d),i=e.requestAnimationFrame(o)}return{start:function(){n!==!0&&t!==null&&(i=e.requestAnimationFrame(o),n=!0)},stop:function(){e.cancelAnimationFrame(i),n=!1},setAnimationLoop:function(a){t=a},setContext:function(a){e=a}}}function zo(e){const n=new WeakMap;function t(f,b){const v=f.array,R=f.usage,m=v.byteLength,x=e.createBuffer();e.bindBuffer(b,x),e.bufferData(b,v,R),f.onUploadCallback();let M;if(v instanceof Float32Array)M=e.FLOAT;else if(typeof Float16Array<"u"&&v instanceof Float16Array)M=e.HALF_FLOAT;else if(v instanceof Uint16Array)f.isFloat16BufferAttribute?M=e.HALF_FLOAT:M=e.UNSIGNED_SHORT;else if(v instanceof Int16Array)M=e.SHORT;else if(v instanceof Uint32Array)M=e.UNSIGNED_INT;else if(v instanceof Int32Array)M=e.INT;else if(v instanceof Int8Array)M=e.BYTE;else if(v instanceof Uint8Array)M=e.UNSIGNED_BYTE;else if(v instanceof Uint8ClampedArray)M=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+v);return{buffer:x,type:M,bytesPerElement:v.BYTES_PER_ELEMENT,version:f.version,size:m}}function i(f,b,v){const R=b.array,m=b.updateRanges;if(e.bindBuffer(v,f),m.length===0)e.bufferSubData(v,0,R);else{m.sort((M,D)=>M.start-D.start);let x=0;for(let M=1;M<m.length;M++){const D=m[x],U=m[M];U.start<=D.start+D.count+1?D.count=Math.max(D.count,U.start+U.count-D.start):(++x,m[x]=U)}m.length=x+1;for(let M=0,D=m.length;M<D;M++){const U=m[M];e.bufferSubData(v,U.start*R.BYTES_PER_ELEMENT,R,U.start,U.count)}b.clearUpdateRanges()}b.onUploadCallback()}function o(f){return f.isInterleavedBufferAttribute&&(f=f.data),n.get(f)}function a(f){f.isInterleavedBufferAttribute&&(f=f.data);const b=n.get(f);b&&(e.deleteBuffer(b.buffer),n.delete(f))}function d(f,b){if(f.isInterleavedBufferAttribute&&(f=f.data),f.isGLBufferAttribute){const R=n.get(f);(!R||R.version<f.version)&&n.set(f,{buffer:f.buffer,type:f.type,bytesPerElement:f.elementSize,version:f.version});return}const v=n.get(f);if(v===void 0)n.set(f,t(f,b));else if(v.version<f.version){if(v.size!==f.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(v.buffer,f,b),v.version=f.version}}return{get:o,remove:a,update:d}}var Wo=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xo=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Yo=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,qo=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ko=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Zo=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$o=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Qo=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Jo=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,jo=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,es=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ts=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ns=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,is=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,as=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,rs=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,os=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ss=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cs=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ls=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,fs=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,ds=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,us=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,ps=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,hs=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ms=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,xs=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,_s=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,gs=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vs=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ss="gl_FragColor = linearToOutputTexel( gl_FragColor );",Es=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ms=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,bs=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Ts=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,As=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Rs=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Cs=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ws=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ps=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ls=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Us=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ds=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ys=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Is=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ns=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Fs=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Os=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Bs=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Gs=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Vs=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Hs=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ks=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,zs=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ws=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Xs=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ys=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,qs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ks=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Zs=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,$s=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Qs=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Js=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,js=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ec=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,tc=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,nc=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ic=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ac=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rc=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,oc=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sc=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,cc=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,lc=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fc=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dc=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,uc=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,pc=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hc=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,mc=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,xc=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_c=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gc=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,vc=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Sc=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ec=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mc=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,bc=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Tc=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ac=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Rc=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Cc=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,wc=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Pc=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Lc=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Uc=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Dc=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,yc=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ic=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Nc=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Fc=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Oc=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Bc=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Gc=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Vc=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Hc=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,kc=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const zc=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Wc=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xc=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Yc=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qc=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Kc=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zc=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,$c=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Qc=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Jc=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,jc=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,el=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tl=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,nl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,il=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,al=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ol=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,cl=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ll=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,fl=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,dl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ul=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,hl=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ml=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_l=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,gl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vl=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sl=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,El=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ml=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Le={alphahash_fragment:Wo,alphahash_pars_fragment:Xo,alphamap_fragment:Yo,alphamap_pars_fragment:qo,alphatest_fragment:Ko,alphatest_pars_fragment:Zo,aomap_fragment:$o,aomap_pars_fragment:Qo,batching_pars_vertex:Jo,batching_vertex:jo,begin_vertex:es,beginnormal_vertex:ts,bsdfs:ns,iridescence_fragment:is,bumpmap_pars_fragment:as,clipping_planes_fragment:rs,clipping_planes_pars_fragment:os,clipping_planes_pars_vertex:ss,clipping_planes_vertex:cs,color_fragment:ls,color_pars_fragment:fs,color_pars_vertex:ds,color_vertex:us,common:ps,cube_uv_reflection_fragment:hs,defaultnormal_vertex:ms,displacementmap_pars_vertex:xs,displacementmap_vertex:_s,emissivemap_fragment:gs,emissivemap_pars_fragment:vs,colorspace_fragment:Ss,colorspace_pars_fragment:Es,envmap_fragment:Ms,envmap_common_pars_fragment:bs,envmap_pars_fragment:Ts,envmap_pars_vertex:As,envmap_physical_pars_fragment:Fs,envmap_vertex:Rs,fog_vertex:Cs,fog_pars_vertex:ws,fog_fragment:Ps,fog_pars_fragment:Ls,gradientmap_pars_fragment:Us,lightmap_pars_fragment:Ds,lights_lambert_fragment:ys,lights_lambert_pars_fragment:Is,lights_pars_begin:Ns,lights_toon_fragment:Os,lights_toon_pars_fragment:Bs,lights_phong_fragment:Gs,lights_phong_pars_fragment:Vs,lights_physical_fragment:Hs,lights_physical_pars_fragment:ks,lights_fragment_begin:zs,lights_fragment_maps:Ws,lights_fragment_end:Xs,logdepthbuf_fragment:Ys,logdepthbuf_pars_fragment:qs,logdepthbuf_pars_vertex:Ks,logdepthbuf_vertex:Zs,map_fragment:$s,map_pars_fragment:Qs,map_particle_fragment:Js,map_particle_pars_fragment:js,metalnessmap_fragment:ec,metalnessmap_pars_fragment:tc,morphinstance_vertex:nc,morphcolor_vertex:ic,morphnormal_vertex:ac,morphtarget_pars_vertex:rc,morphtarget_vertex:oc,normal_fragment_begin:sc,normal_fragment_maps:cc,normal_pars_fragment:lc,normal_pars_vertex:fc,normal_vertex:dc,normalmap_pars_fragment:uc,clearcoat_normal_fragment_begin:pc,clearcoat_normal_fragment_maps:hc,clearcoat_pars_fragment:mc,iridescence_pars_fragment:xc,opaque_fragment:_c,packing:gc,premultiplied_alpha_fragment:vc,project_vertex:Sc,dithering_fragment:Ec,dithering_pars_fragment:Mc,roughnessmap_fragment:bc,roughnessmap_pars_fragment:Tc,shadowmap_pars_fragment:Ac,shadowmap_pars_vertex:Rc,shadowmap_vertex:Cc,shadowmask_pars_fragment:wc,skinbase_vertex:Pc,skinning_pars_vertex:Lc,skinning_vertex:Uc,skinnormal_vertex:Dc,specularmap_fragment:yc,specularmap_pars_fragment:Ic,tonemapping_fragment:Nc,tonemapping_pars_fragment:Fc,transmission_fragment:Oc,transmission_pars_fragment:Bc,uv_pars_fragment:Gc,uv_pars_vertex:Vc,uv_vertex:Hc,worldpos_vertex:kc,background_vert:zc,background_frag:Wc,backgroundCube_vert:Xc,backgroundCube_frag:Yc,cube_vert:qc,cube_frag:Kc,depth_vert:Zc,depth_frag:$c,distanceRGBA_vert:Qc,distanceRGBA_frag:Jc,equirect_vert:jc,equirect_frag:el,linedashed_vert:tl,linedashed_frag:nl,meshbasic_vert:il,meshbasic_frag:al,meshlambert_vert:rl,meshlambert_frag:ol,meshmatcap_vert:sl,meshmatcap_frag:cl,meshnormal_vert:ll,meshnormal_frag:fl,meshphong_vert:dl,meshphong_frag:ul,meshphysical_vert:pl,meshphysical_frag:hl,meshtoon_vert:ml,meshtoon_frag:xl,points_vert:_l,points_frag:gl,shadow_vert:vl,shadow_frag:Sl,sprite_vert:El,sprite_frag:Ml},ne={common:{diffuse:{value:new Ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new ht(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ke(16777215)},opacity:{value:1},center:{value:new ht(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},Rt={basic:{uniforms:_t([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.fog]),vertexShader:Le.meshbasic_vert,fragmentShader:Le.meshbasic_frag},lambert:{uniforms:_t([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ke(0)}}]),vertexShader:Le.meshlambert_vert,fragmentShader:Le.meshlambert_frag},phong:{uniforms:_t([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ke(0)},specular:{value:new Ke(1118481)},shininess:{value:30}}]),vertexShader:Le.meshphong_vert,fragmentShader:Le.meshphong_frag},standard:{uniforms:_t([ne.common,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.roughnessmap,ne.metalnessmap,ne.fog,ne.lights,{emissive:{value:new Ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Le.meshphysical_vert,fragmentShader:Le.meshphysical_frag},toon:{uniforms:_t([ne.common,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.gradientmap,ne.fog,ne.lights,{emissive:{value:new Ke(0)}}]),vertexShader:Le.meshtoon_vert,fragmentShader:Le.meshtoon_frag},matcap:{uniforms:_t([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,{matcap:{value:null}}]),vertexShader:Le.meshmatcap_vert,fragmentShader:Le.meshmatcap_frag},points:{uniforms:_t([ne.points,ne.fog]),vertexShader:Le.points_vert,fragmentShader:Le.points_frag},dashed:{uniforms:_t([ne.common,ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Le.linedashed_vert,fragmentShader:Le.linedashed_frag},depth:{uniforms:_t([ne.common,ne.displacementmap]),vertexShader:Le.depth_vert,fragmentShader:Le.depth_frag},normal:{uniforms:_t([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,{opacity:{value:1}}]),vertexShader:Le.meshnormal_vert,fragmentShader:Le.meshnormal_frag},sprite:{uniforms:_t([ne.sprite,ne.fog]),vertexShader:Le.sprite_vert,fragmentShader:Le.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Le.background_vert,fragmentShader:Le.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Le.backgroundCube_vert,fragmentShader:Le.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Le.cube_vert,fragmentShader:Le.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Le.equirect_vert,fragmentShader:Le.equirect_frag},distanceRGBA:{uniforms:_t([ne.common,ne.displacementmap,{referencePosition:{value:new ze},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Le.distanceRGBA_vert,fragmentShader:Le.distanceRGBA_frag},shadow:{uniforms:_t([ne.lights,ne.fog,{color:{value:new Ke(0)},opacity:{value:1}}]),vertexShader:Le.shadow_vert,fragmentShader:Le.shadow_frag}};Rt.physical={uniforms:_t([Rt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new ht(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new ht},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ke(0)},specularColor:{value:new Ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new ht},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Le.meshphysical_vert,fragmentShader:Le.meshphysical_frag};const An={r:0,b:0,g:0},Yt=new Ya,bl=new nn;function Tl(e,n,t,i,o,a,d){const f=new Ke(0);let b=a===!0?0:1,v,R,m=null,x=0,M=null;function D(_){let P=_.isScene===!0?_.background:null;return P&&P.isTexture&&(P=(_.backgroundBlurriness>0?t:n).get(P)),P}function U(_){let P=!1;const N=D(_);N===null?r(f,b):N&&N.isColor&&(r(N,1),P=!0);const E=e.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,d):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,d),(e.autoClear||P)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function l(_,P){const N=D(P);N&&(N.isCubeTexture||N.mapping===On)?(R===void 0&&(R=new It(new Ut(1,1,1),new zt({name:"BackgroundCubeMaterial",uniforms:ea(Rt.backgroundCube.uniforms),vertexShader:Rt.backgroundCube.vertexShader,fragmentShader:Rt.backgroundCube.fragmentShader,side:bt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),R.geometry.deleteAttribute("normal"),R.geometry.deleteAttribute("uv"),R.onBeforeRender=function(E,F,$){this.matrixWorld.copyPosition($.matrixWorld)},Object.defineProperty(R.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(R)),Yt.copy(P.backgroundRotation),Yt.x*=-1,Yt.y*=-1,Yt.z*=-1,N.isCubeTexture&&N.isRenderTargetTexture===!1&&(Yt.y*=-1,Yt.z*=-1),R.material.uniforms.envMap.value=N,R.material.uniforms.flipEnvMap.value=N.isCubeTexture&&N.isRenderTargetTexture===!1?-1:1,R.material.uniforms.backgroundBlurriness.value=P.backgroundBlurriness,R.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,R.material.uniforms.backgroundRotation.value.setFromMatrix4(bl.makeRotationFromEuler(Yt)),R.material.toneMapped=lt.getTransfer(N.colorSpace)!==Qe,(m!==N||x!==N.version||M!==e.toneMapping)&&(R.material.needsUpdate=!0,m=N,x=N.version,M=e.toneMapping),R.layers.enableAll(),_.unshift(R,R.geometry,R.material,0,0,null)):N&&N.isTexture&&(v===void 0&&(v=new It(new ka(2,2),new zt({name:"BackgroundMaterial",uniforms:ea(Rt.background.uniforms),vertexShader:Rt.background.vertexShader,fragmentShader:Rt.background.fragmentShader,side:xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),v.geometry.deleteAttribute("normal"),Object.defineProperty(v.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(v)),v.material.uniforms.t2D.value=N,v.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,v.material.toneMapped=lt.getTransfer(N.colorSpace)!==Qe,N.matrixAutoUpdate===!0&&N.updateMatrix(),v.material.uniforms.uvTransform.value.copy(N.matrix),(m!==N||x!==N.version||M!==e.toneMapping)&&(v.material.needsUpdate=!0,m=N,x=N.version,M=e.toneMapping),v.layers.enableAll(),_.unshift(v,v.geometry,v.material,0,0,null))}function r(_,P){_.getRGB(An,Xa(e)),i.buffers.color.setClear(An.r,An.g,An.b,P,d)}function T(){R!==void 0&&(R.geometry.dispose(),R.material.dispose(),R=void 0),v!==void 0&&(v.geometry.dispose(),v.material.dispose(),v=void 0)}return{getClearColor:function(){return f},setClearColor:function(_,P=1){f.set(_),b=P,r(f,b)},getClearAlpha:function(){return b},setClearAlpha:function(_){b=_,r(f,b)},render:U,addToRenderList:l,dispose:T}}function Al(e,n){const t=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},o=x(null);let a=o,d=!1;function f(u,w,B,z,W){let Z=!1;const X=m(z,B,w);a!==X&&(a=X,v(a.object)),Z=M(u,z,B,W),Z&&D(u,z,B,W),W!==null&&n.update(W,e.ELEMENT_ARRAY_BUFFER),(Z||d)&&(d=!1,P(u,w,B,z),W!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n.get(W).buffer))}function b(){return e.createVertexArray()}function v(u){return e.bindVertexArray(u)}function R(u){return e.deleteVertexArray(u)}function m(u,w,B){const z=B.wireframe===!0;let W=i[u.id];W===void 0&&(W={},i[u.id]=W);let Z=W[w.id];Z===void 0&&(Z={},W[w.id]=Z);let X=Z[z];return X===void 0&&(X=x(b()),Z[z]=X),X}function x(u){const w=[],B=[],z=[];for(let W=0;W<t;W++)w[W]=0,B[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:B,attributeDivisors:z,object:u,attributes:{},index:null}}function M(u,w,B,z){const W=a.attributes,Z=w.attributes;let X=0;const re=B.getAttributes();for(const V in re)if(re[V].location>=0){const pe=W[V];let De=Z[V];if(De===void 0&&(V==="instanceMatrix"&&u.instanceMatrix&&(De=u.instanceMatrix),V==="instanceColor"&&u.instanceColor&&(De=u.instanceColor)),pe===void 0||pe.attribute!==De||De&&pe.data!==De.data)return!0;X++}return a.attributesNum!==X||a.index!==z}function D(u,w,B,z){const W={},Z=w.attributes;let X=0;const re=B.getAttributes();for(const V in re)if(re[V].location>=0){let pe=Z[V];pe===void 0&&(V==="instanceMatrix"&&u.instanceMatrix&&(pe=u.instanceMatrix),V==="instanceColor"&&u.instanceColor&&(pe=u.instanceColor));const De={};De.attribute=pe,pe&&pe.data&&(De.data=pe.data),W[V]=De,X++}a.attributes=W,a.attributesNum=X,a.index=z}function U(){const u=a.newAttributes;for(let w=0,B=u.length;w<B;w++)u[w]=0}function l(u){r(u,0)}function r(u,w){const B=a.newAttributes,z=a.enabledAttributes,W=a.attributeDivisors;B[u]=1,z[u]===0&&(e.enableVertexAttribArray(u),z[u]=1),W[u]!==w&&(e.vertexAttribDivisor(u,w),W[u]=w)}function T(){const u=a.newAttributes,w=a.enabledAttributes;for(let B=0,z=w.length;B<z;B++)w[B]!==u[B]&&(e.disableVertexAttribArray(B),w[B]=0)}function _(u,w,B,z,W,Z,X){X===!0?e.vertexAttribIPointer(u,w,B,W,Z):e.vertexAttribPointer(u,w,B,z,W,Z)}function P(u,w,B,z){U();const W=z.attributes,Z=B.getAttributes(),X=w.defaultAttributeValues;for(const re in Z){const V=Z[re];if(V.location>=0){let fe=W[re];if(fe===void 0&&(re==="instanceMatrix"&&u.instanceMatrix&&(fe=u.instanceMatrix),re==="instanceColor"&&u.instanceColor&&(fe=u.instanceColor)),fe!==void 0){const pe=fe.normalized,De=fe.itemSize,Ye=n.get(fe);if(Ye===void 0)continue;const tt=Ye.buffer,je=Ye.type,nt=Ye.bytesPerElement,H=je===e.INT||je===e.UNSIGNED_INT||fe.gpuType===za;if(fe.isInterleavedBufferAttribute){const q=fe.data,le=q.stride,Pe=fe.offset;if(q.isInstancedInterleavedBuffer){for(let _e=0;_e<V.locationSize;_e++)r(V.location+_e,q.meshPerAttribute);u.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let _e=0;_e<V.locationSize;_e++)l(V.location+_e);e.bindBuffer(e.ARRAY_BUFFER,tt);for(let _e=0;_e<V.locationSize;_e++)_(V.location+_e,De/V.locationSize,je,pe,le*nt,(Pe+De/V.locationSize*_e)*nt,H)}else{if(fe.isInstancedBufferAttribute){for(let q=0;q<V.locationSize;q++)r(V.location+q,fe.meshPerAttribute);u.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let q=0;q<V.locationSize;q++)l(V.location+q);e.bindBuffer(e.ARRAY_BUFFER,tt);for(let q=0;q<V.locationSize;q++)_(V.location+q,De/V.locationSize,je,pe,De*nt,De/V.locationSize*q*nt,H)}}else if(X!==void 0){const pe=X[re];if(pe!==void 0)switch(pe.length){case 2:e.vertexAttrib2fv(V.location,pe);break;case 3:e.vertexAttrib3fv(V.location,pe);break;case 4:e.vertexAttrib4fv(V.location,pe);break;default:e.vertexAttrib1fv(V.location,pe)}}}}T()}function N(){$();for(const u in i){const w=i[u];for(const B in w){const z=w[B];for(const W in z)R(z[W].object),delete z[W];delete w[B]}delete i[u]}}function E(u){if(i[u.id]===void 0)return;const w=i[u.id];for(const B in w){const z=w[B];for(const W in z)R(z[W].object),delete z[W];delete w[B]}delete i[u.id]}function F(u){for(const w in i){const B=i[w];if(B[u.id]===void 0)continue;const z=B[u.id];for(const W in z)R(z[W].object),delete z[W];delete B[u.id]}}function $(){h(),d=!0,a!==o&&(a=o,v(a.object))}function h(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:f,reset:$,resetDefaultState:h,dispose:N,releaseStatesOfGeometry:E,releaseStatesOfProgram:F,initAttributes:U,enableAttribute:l,disableUnusedAttributes:T}}function Rl(e,n,t){let i;function o(v){i=v}function a(v,R){e.drawArrays(i,v,R),t.update(R,i,1)}function d(v,R,m){m!==0&&(e.drawArraysInstanced(i,v,R,m),t.update(R,i,m))}function f(v,R,m){if(m===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,v,0,R,0,m);let M=0;for(let D=0;D<m;D++)M+=R[D];t.update(M,i,1)}function b(v,R,m,x){if(m===0)return;const M=n.get("WEBGL_multi_draw");if(M===null)for(let D=0;D<v.length;D++)d(v[D],R[D],x[D]);else{M.multiDrawArraysInstancedWEBGL(i,v,0,R,0,x,0,m);let D=0;for(let U=0;U<m;U++)D+=R[U]*x[U];t.update(D,i,1)}}this.setMode=o,this.render=a,this.renderInstances=d,this.renderMultiDraw=f,this.renderMultiDrawInstances=b}function Cl(e,n,t,i){let o;function a(){if(o!==void 0)return o;if(n.has("EXT_texture_filter_anisotropic")===!0){const F=n.get("EXT_texture_filter_anisotropic");o=e.getParameter(F.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function d(F){return!(F!==yt&&i.convert(F)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function f(F){const $=F===Sn&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(F!==Qt&&i.convert(F)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&F!==$t&&!$)}function b(F){if(F==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";F="mediump"}return F==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let v=t.precision!==void 0?t.precision:"highp";const R=b(v);R!==v&&(Je("WebGLRenderer:",v,"not supported, using",R,"instead."),v=R);const m=t.logarithmicDepthBuffer===!0,x=t.reversedDepthBuffer===!0&&n.has("EXT_clip_control"),M=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),D=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),U=e.getParameter(e.MAX_TEXTURE_SIZE),l=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),r=e.getParameter(e.MAX_VERTEX_ATTRIBS),T=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),_=e.getParameter(e.MAX_VARYING_VECTORS),P=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),N=D>0,E=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:b,textureFormatReadable:d,textureTypeReadable:f,precision:v,logarithmicDepthBuffer:m,reversedDepthBuffer:x,maxTextures:M,maxVertexTextures:D,maxTextureSize:U,maxCubemapSize:l,maxAttributes:r,maxVertexUniforms:T,maxVaryings:_,maxFragmentUniforms:P,vertexTextures:N,maxSamples:E}}function wl(e){const n=this;let t=null,i=0,o=!1,a=!1;const d=new Wr,f=new ke,b={value:null,needsUpdate:!1};this.uniform=b,this.numPlanes=0,this.numIntersection=0,this.init=function(m,x){const M=m.length!==0||x||i!==0||o;return o=x,i=m.length,M},this.beginShadows=function(){a=!0,R(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(m,x){t=R(m,x,0)},this.setState=function(m,x,M){const D=m.clippingPlanes,U=m.clipIntersection,l=m.clipShadows,r=e.get(m);if(!o||D===null||D.length===0||a&&!l)a?R(null):v();else{const T=a?0:i,_=T*4;let P=r.clippingState||null;b.value=P,P=R(D,x,_,M);for(let N=0;N!==_;++N)P[N]=t[N];r.clippingState=P,this.numIntersection=U?this.numPlanes:0,this.numPlanes+=T}};function v(){b.value!==t&&(b.value=t,b.needsUpdate=i>0),n.numPlanes=i,n.numIntersection=0}function R(m,x,M,D){const U=m!==null?m.length:0;let l=null;if(U!==0){if(l=b.value,D!==!0||l===null){const r=M+U*4,T=x.matrixWorldInverse;f.getNormalMatrix(T),(l===null||l.length<r)&&(l=new Float32Array(r));for(let _=0,P=M;_!==U;++_,P+=4)d.copy(m[_]).applyMatrix4(T,f),d.normal.toArray(l,P),l[P+3]=d.constant}b.value=l,b.needsUpdate=!0}return n.numPlanes=U,n.numIntersection=0,l}}function Pl(e){let n=new WeakMap;function t(d,f){return f===li?d.mapping=vn:f===fi&&(d.mapping=rn),d}function i(d){if(d&&d.isTexture){const f=d.mapping;if(f===li||f===fi)if(n.has(d)){const b=n.get(d).texture;return t(b,d.mapping)}else{const b=d.image;if(b&&b.height>0){const v=new ao(b.height);return v.fromEquirectangularTexture(e,d),n.set(d,v),d.addEventListener("dispose",o),t(v.texture,d.mapping)}else return null}}return d}function o(d){const f=d.target;f.removeEventListener("dispose",o);const b=n.get(f);b!==void 0&&(n.delete(f),b.dispose())}function a(){n=new WeakMap}return{get:i,dispose:a}}const Vt=4,sa=[.125,.215,.35,.446,.526,.582],Zt=20,Ll=256,fn=new co,ca=new Ke;let Zn=null,$n=0,Qn=0,Jn=!1;const Ul=new ze;class la{constructor(n){this._renderer=n,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(n,t=0,i=.1,o=100,a={}){const{size:d=256,position:f=Ul}=a;Zn=this._renderer.getRenderTarget(),$n=this._renderer.getActiveCubeFace(),Qn=this._renderer.getActiveMipmapLevel(),Jn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(d);const b=this._allocateTargets();return b.depthBuffer=!0,this._sceneToCubeUV(n,i,o,b,f),t>0&&this._blur(b,0,0,t),this._applyPMREM(b),this._cleanup(b),b}fromEquirectangular(n,t=null){return this._fromTexture(n,t)}fromCubemap(n,t=null){return this._fromTexture(n,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ua(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=da(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(n){this._lodMax=Math.floor(Math.log2(n)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let n=0;n<this._lodMeshes.length;n++)this._lodMeshes[n].geometry.dispose()}_cleanup(n){this._renderer.setRenderTarget(Zn,$n,Qn),this._renderer.xr.enabled=Jn,n.scissorTest=!1,en(n,0,0,n.width,n.height)}_fromTexture(n,t){n.mapping===vn||n.mapping===rn?this._setSize(n.image.length===0?16:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4),Zn=this._renderer.getRenderTarget(),$n=this._renderer.getActiveCubeFace(),Qn=this._renderer.getActiveMipmapLevel(),Jn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(n,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const n=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Gt,minFilter:Gt,generateMipmaps:!1,type:Sn,format:yt,colorSpace:Nn,depthBuffer:!1},o=fa(n,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==n||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=fa(n,t,i);const{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Dl(a)),this._blurMaterial=Il(a,n,t),this._ggxMaterial=yl(a,n,t)}return o}_compileMaterial(n){const t=new It(new Fn,n);this._renderer.compile(t,fn)}_sceneToCubeUV(n,t,i,o,a){const b=new hn(90,1,t,i),v=[1,-1,1,1,1,1],R=[1,1,1,-1,-1,-1],m=this._renderer,x=m.autoClear,M=m.toneMapping;m.getClearColor(ca),m.toneMapping=Ht,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(o),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new It(new Ut,new un({name:"PMREM.Background",side:bt,depthWrite:!1,depthTest:!1})));const U=this._backgroundBox,l=U.material;let r=!1;const T=n.background;T?T.isColor&&(l.color.copy(T),n.background=null,r=!0):(l.color.copy(ca),r=!0);for(let _=0;_<6;_++){const P=_%3;P===0?(b.up.set(0,v[_],0),b.position.set(a.x,a.y,a.z),b.lookAt(a.x+R[_],a.y,a.z)):P===1?(b.up.set(0,0,v[_]),b.position.set(a.x,a.y,a.z),b.lookAt(a.x,a.y+R[_],a.z)):(b.up.set(0,v[_],0),b.position.set(a.x,a.y,a.z),b.lookAt(a.x,a.y,a.z+R[_]));const N=this._cubeSize;en(o,P*N,_>2?N:0,N,N),m.setRenderTarget(o),r&&m.render(U,b),m.render(n,b)}m.toneMapping=M,m.autoClear=x,n.background=T}_textureToCubeUV(n,t){const i=this._renderer,o=n.mapping===vn||n.mapping===rn;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=ua()),this._cubemapMaterial.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=da());const a=o?this._cubemapMaterial:this._equirectMaterial,d=this._lodMeshes[0];d.material=a;const f=a.uniforms;f.envMap.value=n;const b=this._cubeSize;en(t,0,0,3*b,2*b),i.setRenderTarget(t),i.render(d,fn)}_applyPMREM(n){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const o=this._lodMeshes.length;for(let a=1;a<o;a++)this._applyGGXFilter(n,a-1,a);t.autoClear=i}_applyGGXFilter(n,t,i){const o=this._renderer,a=this._pingPongRenderTarget,d=this._ggxMaterial,f=this._lodMeshes[i];f.material=d;const b=d.uniforms,v=i/(this._lodMeshes.length-1),R=t/(this._lodMeshes.length-1),m=Math.sqrt(v*v-R*R),x=.05+v*.95,M=m*x,{_lodMax:D}=this,U=this._sizeLods[i],l=3*U*(i>D-Vt?i-D+Vt:0),r=4*(this._cubeSize-U);b.envMap.value=n.texture,b.roughness.value=M,b.mipInt.value=D-t,en(a,l,r,3*U,2*U),o.setRenderTarget(a),o.render(f,fn),b.envMap.value=a.texture,b.roughness.value=0,b.mipInt.value=D-i,en(n,l,r,3*U,2*U),o.setRenderTarget(n),o.render(f,fn)}_blur(n,t,i,o,a){const d=this._pingPongRenderTarget;this._halfBlur(n,d,t,i,o,"latitudinal",a),this._halfBlur(d,n,i,i,o,"longitudinal",a)}_halfBlur(n,t,i,o,a,d,f){const b=this._renderer,v=this._blurMaterial;d!=="latitudinal"&&d!=="longitudinal"&&vt("blur direction must be either latitudinal or longitudinal!");const R=3,m=this._lodMeshes[o];m.material=v;const x=v.uniforms,M=this._sizeLods[i]-1,D=isFinite(a)?Math.PI/(2*M):2*Math.PI/(2*Zt-1),U=a/D,l=isFinite(a)?1+Math.floor(R*U):Zt;l>Zt&&Je(`sigmaRadians, ${a}, is too large and will clip, as it requested ${l} samples when the maximum is set to ${Zt}`);const r=[];let T=0;for(let F=0;F<Zt;++F){const $=F/U,h=Math.exp(-$*$/2);r.push(h),F===0?T+=h:F<l&&(T+=2*h)}for(let F=0;F<r.length;F++)r[F]=r[F]/T;x.envMap.value=n.texture,x.samples.value=l,x.weights.value=r,x.latitudinal.value=d==="latitudinal",f&&(x.poleAxis.value=f);const{_lodMax:_}=this;x.dTheta.value=D,x.mipInt.value=_-i;const P=this._sizeLods[o],N=3*P*(o>_-Vt?o-_+Vt:0),E=4*(this._cubeSize-P);en(t,N,E,3*P,2*P),b.setRenderTarget(t),b.render(m,fn)}}function Dl(e){const n=[],t=[],i=[];let o=e;const a=e-Vt+1+sa.length;for(let d=0;d<a;d++){const f=Math.pow(2,o);n.push(f);let b=1/f;d>e-Vt?b=sa[d-e+Vt-1]:d===0&&(b=0),t.push(b);const v=1/(f-2),R=-v,m=1+v,x=[R,R,m,R,m,m,R,R,m,m,R,m],M=6,D=6,U=3,l=2,r=1,T=new Float32Array(U*D*M),_=new Float32Array(l*D*M),P=new Float32Array(r*D*M);for(let E=0;E<M;E++){const F=E%3*2/3-1,$=E>2?0:-1,h=[F,$,0,F+2/3,$,0,F+2/3,$+1,0,F,$,0,F+2/3,$+1,0,F,$+1,0];T.set(h,U*D*E),_.set(x,l*D*E);const u=[E,E,E,E,E,E];P.set(u,r*D*E)}const N=new Fn;N.setAttribute("position",new wn(T,U)),N.setAttribute("uv",new wn(_,l)),N.setAttribute("faceIndex",new wn(P,r)),i.push(new It(N,null)),o>Vt&&o--}return{lodMeshes:i,sizeLods:n,sigmas:t}}function fa(e,n,t){const i=new an(e,n,t);return i.texture.mapping=On,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function en(e,n,t,i,o){e.viewport.set(n,t,i,o),e.scissor.set(n,t,i,o)}function yl(e,n,t){return new zt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ll,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Bn(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:kt,depthTest:!1,depthWrite:!1})}function Il(e,n,t){const i=new Float32Array(Zt),o=new ze(0,1,0);return new zt({name:"SphericalGaussianBlur",defines:{n:Zt,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:Bn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:kt,depthTest:!1,depthWrite:!1})}function da(){return new zt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Bn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:kt,depthTest:!1,depthWrite:!1})}function ua(){return new zt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Bn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:kt,depthTest:!1,depthWrite:!1})}function Bn(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Nl(e){let n=new WeakMap,t=null;function i(f){if(f&&f.isTexture){const b=f.mapping,v=b===li||b===fi,R=b===vn||b===rn;if(v||R){let m=n.get(f);const x=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==x)return t===null&&(t=new la(e)),m=v?t.fromEquirectangular(f,m):t.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,n.set(f,m),m.texture;if(m!==void 0)return m.texture;{const M=f.image;return v&&M&&M.height>0||R&&M&&o(M)?(t===null&&(t=new la(e)),m=v?t.fromEquirectangular(f):t.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,n.set(f,m),f.addEventListener("dispose",a),m.texture):null}}}return f}function o(f){let b=0;const v=6;for(let R=0;R<v;R++)f[R]!==void 0&&b++;return b===v}function a(f){const b=f.target;b.removeEventListener("dispose",a);const v=n.get(b);v!==void 0&&(n.delete(b),v.dispose())}function d(){n=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:d}}function Fl(e){const n={};function t(i){if(n[i]!==void 0)return n[i];const o=e.getExtension(i);return n[i]=o,o}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const o=t(i);return o===null&&ei("WebGLRenderer: "+i+" extension not supported."),o}}}function Ol(e,n,t,i){const o={},a=new WeakMap;function d(m){const x=m.target;x.index!==null&&n.remove(x.index);for(const D in x.attributes)n.remove(x.attributes[D]);x.removeEventListener("dispose",d),delete o[x.id];const M=a.get(x);M&&(n.remove(M),a.delete(x)),i.releaseStatesOfGeometry(x),x.isInstancedBufferGeometry===!0&&delete x._maxInstanceCount,t.memory.geometries--}function f(m,x){return o[x.id]===!0||(x.addEventListener("dispose",d),o[x.id]=!0,t.memory.geometries++),x}function b(m){const x=m.attributes;for(const M in x)n.update(x[M],e.ARRAY_BUFFER)}function v(m){const x=[],M=m.index,D=m.attributes.position;let U=0;if(M!==null){const T=M.array;U=M.version;for(let _=0,P=T.length;_<P;_+=3){const N=T[_+0],E=T[_+1],F=T[_+2];x.push(N,E,E,F,F,N)}}else if(D!==void 0){const T=D.array;U=D.version;for(let _=0,P=T.length/3-1;_<P;_+=3){const N=_+0,E=_+1,F=_+2;x.push(N,E,E,F,F,N)}}else return;const l=new(uo(x)?lo:fo)(x,1);l.version=U;const r=a.get(m);r&&n.remove(r),a.set(m,l)}function R(m){const x=a.get(m);if(x){const M=m.index;M!==null&&x.version<M.version&&v(m)}else v(m);return a.get(m)}return{get:f,update:b,getWireframeAttribute:R}}function Bl(e,n,t){let i;function o(x){i=x}let a,d;function f(x){a=x.type,d=x.bytesPerElement}function b(x,M){e.drawElements(i,M,a,x*d),t.update(M,i,1)}function v(x,M,D){D!==0&&(e.drawElementsInstanced(i,M,a,x*d,D),t.update(M,i,D))}function R(x,M,D){if(D===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,M,0,a,x,0,D);let l=0;for(let r=0;r<D;r++)l+=M[r];t.update(l,i,1)}function m(x,M,D,U){if(D===0)return;const l=n.get("WEBGL_multi_draw");if(l===null)for(let r=0;r<x.length;r++)v(x[r]/d,M[r],U[r]);else{l.multiDrawElementsInstancedWEBGL(i,M,0,a,x,0,U,0,D);let r=0;for(let T=0;T<D;T++)r+=M[T]*U[T];t.update(r,i,1)}}this.setMode=o,this.setIndex=f,this.render=b,this.renderInstances=v,this.renderMultiDraw=R,this.renderMultiDrawInstances=m}function Gl(e){const n={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,d,f){switch(t.calls++,d){case e.TRIANGLES:t.triangles+=f*(a/3);break;case e.LINES:t.lines+=f*(a/2);break;case e.LINE_STRIP:t.lines+=f*(a-1);break;case e.LINE_LOOP:t.lines+=f*a;break;case e.POINTS:t.points+=f*a;break;default:vt("WebGLInfo: Unknown draw mode:",d);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:n,render:t,programs:null,autoReset:!0,reset:o,update:i}}function Vl(e,n,t){const i=new WeakMap,o=new gt;function a(d,f,b){const v=d.morphTargetInfluences,R=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,m=R!==void 0?R.length:0;let x=i.get(f);if(x===void 0||x.count!==m){let h=function(){F.dispose(),i.delete(f),f.removeEventListener("dispose",h)};x!==void 0&&x.texture.dispose();const M=f.morphAttributes.position!==void 0,D=f.morphAttributes.normal!==void 0,U=f.morphAttributes.color!==void 0,l=f.morphAttributes.position||[],r=f.morphAttributes.normal||[],T=f.morphAttributes.color||[];let _=0;M===!0&&(_=1),D===!0&&(_=2),U===!0&&(_=3);let P=f.attributes.position.count*_,N=1;P>n.maxTextureSize&&(N=Math.ceil(P/n.maxTextureSize),P=n.maxTextureSize);const E=new Float32Array(P*N*4*m),F=new Wa(E,P,N,m);F.type=$t,F.needsUpdate=!0;const $=_*4;for(let u=0;u<m;u++){const w=l[u],B=r[u],z=T[u],W=P*N*4*u;for(let Z=0;Z<w.count;Z++){const X=Z*$;M===!0&&(o.fromBufferAttribute(w,Z),E[W+X+0]=o.x,E[W+X+1]=o.y,E[W+X+2]=o.z,E[W+X+3]=0),D===!0&&(o.fromBufferAttribute(B,Z),E[W+X+4]=o.x,E[W+X+5]=o.y,E[W+X+6]=o.z,E[W+X+7]=0),U===!0&&(o.fromBufferAttribute(z,Z),E[W+X+8]=o.x,E[W+X+9]=o.y,E[W+X+10]=o.z,E[W+X+11]=z.itemSize===4?o.w:1)}}x={count:m,texture:F,size:new ht(P,N)},i.set(f,x),f.addEventListener("dispose",h)}if(d.isInstancedMesh===!0&&d.morphTexture!==null)b.getUniforms().setValue(e,"morphTexture",d.morphTexture,t);else{let M=0;for(let U=0;U<v.length;U++)M+=v[U];const D=f.morphTargetsRelative?1:1-M;b.getUniforms().setValue(e,"morphTargetBaseInfluence",D),b.getUniforms().setValue(e,"morphTargetInfluences",v)}b.getUniforms().setValue(e,"morphTargetsTexture",x.texture,t),b.getUniforms().setValue(e,"morphTargetsTextureSize",x.size)}return{update:a}}function Hl(e,n,t,i){let o=new WeakMap;function a(b){const v=i.render.frame,R=b.geometry,m=n.get(b,R);if(o.get(m)!==v&&(n.update(m),o.set(m,v)),b.isInstancedMesh&&(b.hasEventListener("dispose",f)===!1&&b.addEventListener("dispose",f),o.get(b)!==v&&(t.update(b.instanceMatrix,e.ARRAY_BUFFER),b.instanceColor!==null&&t.update(b.instanceColor,e.ARRAY_BUFFER),o.set(b,v))),b.isSkinnedMesh){const x=b.skeleton;o.get(x)!==v&&(x.update(),o.set(x,v))}return m}function d(){o=new WeakMap}function f(b){const v=b.target;v.removeEventListener("dispose",f),t.remove(v.instanceMatrix),v.instanceColor!==null&&t.remove(v.instanceColor)}return{update:a,dispose:d}}const Ja=new Mo,pa=new Da(1,1),ja=new Wa,er=new Eo,tr=new So,ha=[],ma=[],xa=new Float32Array(16),_a=new Float32Array(9),ga=new Float32Array(4);function on(e,n,t){const i=e[0];if(i<=0||i>0)return e;const o=n*t;let a=ha[o];if(a===void 0&&(a=new Float32Array(o),ha[o]=a),n!==0){i.toArray(a,0);for(let d=1,f=0;d!==n;++d)f+=t,e[d].toArray(a,f)}return a}function ft(e,n){if(e.length!==n.length)return!1;for(let t=0,i=e.length;t<i;t++)if(e[t]!==n[t])return!1;return!0}function dt(e,n){for(let t=0,i=n.length;t<i;t++)e[t]=n[t]}function Gn(e,n){let t=ma[n];t===void 0&&(t=new Int32Array(n),ma[n]=t);for(let i=0;i!==n;++i)t[i]=e.allocateTextureUnit();return t}function kl(e,n){const t=this.cache;t[0]!==n&&(e.uniform1f(this.addr,n),t[0]=n)}function zl(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2f(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ft(t,n))return;e.uniform2fv(this.addr,n),dt(t,n)}}function Wl(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3f(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else if(n.r!==void 0)(t[0]!==n.r||t[1]!==n.g||t[2]!==n.b)&&(e.uniform3f(this.addr,n.r,n.g,n.b),t[0]=n.r,t[1]=n.g,t[2]=n.b);else{if(ft(t,n))return;e.uniform3fv(this.addr,n),dt(t,n)}}function Xl(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4f(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ft(t,n))return;e.uniform4fv(this.addr,n),dt(t,n)}}function Yl(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(ft(t,n))return;e.uniformMatrix2fv(this.addr,!1,n),dt(t,n)}else{if(ft(t,i))return;ga.set(i),e.uniformMatrix2fv(this.addr,!1,ga),dt(t,i)}}function ql(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(ft(t,n))return;e.uniformMatrix3fv(this.addr,!1,n),dt(t,n)}else{if(ft(t,i))return;_a.set(i),e.uniformMatrix3fv(this.addr,!1,_a),dt(t,i)}}function Kl(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(ft(t,n))return;e.uniformMatrix4fv(this.addr,!1,n),dt(t,n)}else{if(ft(t,i))return;xa.set(i),e.uniformMatrix4fv(this.addr,!1,xa),dt(t,i)}}function Zl(e,n){const t=this.cache;t[0]!==n&&(e.uniform1i(this.addr,n),t[0]=n)}function $l(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2i(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ft(t,n))return;e.uniform2iv(this.addr,n),dt(t,n)}}function Ql(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3i(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(ft(t,n))return;e.uniform3iv(this.addr,n),dt(t,n)}}function Jl(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4i(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ft(t,n))return;e.uniform4iv(this.addr,n),dt(t,n)}}function jl(e,n){const t=this.cache;t[0]!==n&&(e.uniform1ui(this.addr,n),t[0]=n)}function ef(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2ui(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ft(t,n))return;e.uniform2uiv(this.addr,n),dt(t,n)}}function tf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3ui(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(ft(t,n))return;e.uniform3uiv(this.addr,n),dt(t,n)}}function nf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4ui(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ft(t,n))return;e.uniform4uiv(this.addr,n),dt(t,n)}}function af(e,n,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(e.uniform1i(this.addr,o),i[0]=o);let a;this.type===e.SAMPLER_2D_SHADOW?(pa.compareFunction=Ia,a=pa):a=Ja,t.setTexture2D(n||a,o)}function rf(e,n,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(e.uniform1i(this.addr,o),i[0]=o),t.setTexture3D(n||er,o)}function of(e,n,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(e.uniform1i(this.addr,o),i[0]=o),t.setTextureCube(n||tr,o)}function sf(e,n,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(e.uniform1i(this.addr,o),i[0]=o),t.setTexture2DArray(n||ja,o)}function cf(e){switch(e){case 5126:return kl;case 35664:return zl;case 35665:return Wl;case 35666:return Xl;case 35674:return Yl;case 35675:return ql;case 35676:return Kl;case 5124:case 35670:return Zl;case 35667:case 35671:return $l;case 35668:case 35672:return Ql;case 35669:case 35673:return Jl;case 5125:return jl;case 36294:return ef;case 36295:return tf;case 36296:return nf;case 35678:case 36198:case 36298:case 36306:case 35682:return af;case 35679:case 36299:case 36307:return rf;case 35680:case 36300:case 36308:case 36293:return of;case 36289:case 36303:case 36311:case 36292:return sf}}function lf(e,n){e.uniform1fv(this.addr,n)}function ff(e,n){const t=on(n,this.size,2);e.uniform2fv(this.addr,t)}function df(e,n){const t=on(n,this.size,3);e.uniform3fv(this.addr,t)}function uf(e,n){const t=on(n,this.size,4);e.uniform4fv(this.addr,t)}function pf(e,n){const t=on(n,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function hf(e,n){const t=on(n,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function mf(e,n){const t=on(n,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function xf(e,n){e.uniform1iv(this.addr,n)}function _f(e,n){e.uniform2iv(this.addr,n)}function gf(e,n){e.uniform3iv(this.addr,n)}function vf(e,n){e.uniform4iv(this.addr,n)}function Sf(e,n){e.uniform1uiv(this.addr,n)}function Ef(e,n){e.uniform2uiv(this.addr,n)}function Mf(e,n){e.uniform3uiv(this.addr,n)}function bf(e,n){e.uniform4uiv(this.addr,n)}function Tf(e,n,t){const i=this.cache,o=n.length,a=Gn(t,o);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let d=0;d!==o;++d)t.setTexture2D(n[d]||Ja,a[d])}function Af(e,n,t){const i=this.cache,o=n.length,a=Gn(t,o);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let d=0;d!==o;++d)t.setTexture3D(n[d]||er,a[d])}function Rf(e,n,t){const i=this.cache,o=n.length,a=Gn(t,o);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let d=0;d!==o;++d)t.setTextureCube(n[d]||tr,a[d])}function Cf(e,n,t){const i=this.cache,o=n.length,a=Gn(t,o);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let d=0;d!==o;++d)t.setTexture2DArray(n[d]||ja,a[d])}function wf(e){switch(e){case 5126:return lf;case 35664:return ff;case 35665:return df;case 35666:return uf;case 35674:return pf;case 35675:return hf;case 35676:return mf;case 5124:case 35670:return xf;case 35667:case 35671:return _f;case 35668:case 35672:return gf;case 35669:case 35673:return vf;case 5125:return Sf;case 36294:return Ef;case 36295:return Mf;case 36296:return bf;case 35678:case 36198:case 36298:case 36306:case 35682:return Tf;case 35679:case 36299:case 36307:return Af;case 35680:case 36300:case 36308:case 36293:return Rf;case 36289:case 36303:case 36311:case 36292:return Cf}}class Pf{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.setValue=cf(t.type)}}class Lf{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=wf(t.type)}}class Uf{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,t,i){const o=this.seq;for(let a=0,d=o.length;a!==d;++a){const f=o[a];f.setValue(n,t[f.id],i)}}}const jn=/(\w+)(\])?(\[|\.)?/g;function va(e,n){e.seq.push(n),e.map[n.id]=n}function Df(e,n,t){const i=e.name,o=i.length;for(jn.lastIndex=0;;){const a=jn.exec(i),d=jn.lastIndex;let f=a[1];const b=a[2]==="]",v=a[3];if(b&&(f=f|0),v===void 0||v==="["&&d+2===o){va(t,v===void 0?new Pf(f,e,n):new Lf(f,e,n));break}else{let m=t.map[f];m===void 0&&(m=new Uf(f),va(t,m)),t=m}}}class Un{constructor(n,t){this.seq=[],this.map={};const i=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=n.getActiveUniform(t,o),d=n.getUniformLocation(t,a.name);Df(a,d,this)}}setValue(n,t,i,o){const a=this.map[t];a!==void 0&&a.setValue(n,i,o)}setOptional(n,t,i){const o=t[i];o!==void 0&&this.setValue(n,i,o)}static upload(n,t,i,o){for(let a=0,d=t.length;a!==d;++a){const f=t[a],b=i[f.id];b.needsUpdate!==!1&&f.setValue(n,b.value,o)}}static seqWithValue(n,t){const i=[];for(let o=0,a=n.length;o!==a;++o){const d=n[o];d.id in t&&i.push(d)}return i}}function Sa(e,n,t){const i=e.createShader(n);return e.shaderSource(i,t),e.compileShader(i),i}const yf=37297;let If=0;function Nf(e,n){const t=e.split(`
`),i=[],o=Math.max(n-6,0),a=Math.min(n+6,t.length);for(let d=o;d<a;d++){const f=d+1;i.push(`${f===n?">":" "} ${f}: ${t[d]}`)}return i.join(`
`)}const Ea=new ke;function Ff(e){lt._getMatrix(Ea,lt.workingColorSpace,e);const n=`mat3( ${Ea.elements.map(t=>t.toFixed(4))} )`;switch(lt.getTransfer(e)){case qa:return[n,"LinearTransferOETF"];case Qe:return[n,"sRGBTransferOETF"];default:return Je("WebGLProgram: Unsupported color space: ",e),[n,"LinearTransferOETF"]}}function Ma(e,n,t){const i=e.getShaderParameter(n,e.COMPILE_STATUS),a=(e.getShaderInfoLog(n)||"").trim();if(i&&a==="")return"";const d=/ERROR: 0:(\d+)/.exec(a);if(d){const f=parseInt(d[1]);return t.toUpperCase()+`

`+a+`

`+Nf(e.getShaderSource(n),f)}else return a}function Of(e,n){const t=Ff(n);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Bf(e,n){let t;switch(n){case vo:t="Linear";break;case go:t="Reinhard";break;case _o:t="Cineon";break;case Za:t="ACESFilmic";break;case xo:t="AgX";break;case mo:t="Neutral";break;case ho:t="Custom";break;default:Je("WebGLProgram: Unsupported toneMapping:",n),t="Linear"}return"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Rn=new ze;function Gf(){lt.getLuminanceCoefficients(Rn);const e=Rn.x.toFixed(4),n=Rn.y.toFixed(4),t=Rn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${n}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Vf(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(pn).join(`
`)}function Hf(e){const n=[];for(const t in e){const i=e[t];i!==!1&&n.push("#define "+t+" "+i)}return n.join(`
`)}function kf(e,n){const t={},i=e.getProgramParameter(n,e.ACTIVE_ATTRIBUTES);for(let o=0;o<i;o++){const a=e.getActiveAttrib(n,o),d=a.name;let f=1;a.type===e.FLOAT_MAT2&&(f=2),a.type===e.FLOAT_MAT3&&(f=3),a.type===e.FLOAT_MAT4&&(f=4),t[d]={type:a.type,location:e.getAttribLocation(n,d),locationSize:f}}return t}function pn(e){return e!==""}function ba(e,n){const t=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows)}function Ta(e,n){return e.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}const zf=/^[ \t]*#include +<([\w\d./]+)>/gm;function di(e){return e.replace(zf,Xf)}const Wf=new Map;function Xf(e,n){let t=Le[n];if(t===void 0){const i=Wf.get(n);if(i!==void 0)t=Le[i],Je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',n,i);else throw new Error("Can not resolve #include <"+n+">")}return di(t)}const Yf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Aa(e){return e.replace(Yf,qf)}function qf(e,n,t,i){let o="";for(let a=parseInt(n);a<parseInt(t);a++)o+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return o}function Ra(e){let n=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?n+=`
#define HIGH_PRECISION`:e.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}function Kf(e){let n="SHADOWMAP_TYPE_BASIC";return e.shadowMapType===Na?n="SHADOWMAP_TYPE_PCF":e.shadowMapType===Ka?n="SHADOWMAP_TYPE_PCF_SOFT":e.shadowMapType===Lt&&(n="SHADOWMAP_TYPE_VSM"),n}function Zf(e){let n="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case vn:case rn:n="ENVMAP_TYPE_CUBE";break;case On:n="ENVMAP_TYPE_CUBE_UV";break}return n}function $f(e){let n="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case rn:n="ENVMAP_MODE_REFRACTION";break}return n}function Qf(e){let n="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case Ro:n="ENVMAP_BLENDING_MULTIPLY";break;case Ao:n="ENVMAP_BLENDING_MIX";break;case To:n="ENVMAP_BLENDING_ADD";break}return n}function Jf(e){const n=e.envMapCubeUVHeight;if(n===null)return null;const t=Math.log2(n)-2,i=1/n;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function jf(e,n,t,i){const o=e.getContext(),a=t.defines;let d=t.vertexShader,f=t.fragmentShader;const b=Kf(t),v=Zf(t),R=$f(t),m=Qf(t),x=Jf(t),M=Vf(t),D=Hf(a),U=o.createProgram();let l,r,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(l=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D].filter(pn).join(`
`),l.length>0&&(l+=`
`),r=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D].filter(pn).join(`
`),r.length>0&&(r+=`
`)):(l=[Ra(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+R:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+b:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pn).join(`
`),r=[Ra(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+v:"",t.envMap?"#define "+R:"",t.envMap?"#define "+m:"",x?"#define CUBEUV_TEXEL_WIDTH "+x.texelWidth:"",x?"#define CUBEUV_TEXEL_HEIGHT "+x.texelHeight:"",x?"#define CUBEUV_MAX_MIP "+x.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+b:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ht?"#define TONE_MAPPING":"",t.toneMapping!==Ht?Le.tonemapping_pars_fragment:"",t.toneMapping!==Ht?Bf("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Le.colorspace_pars_fragment,Of("linearToOutputTexel",t.outputColorSpace),Gf(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(pn).join(`
`)),d=di(d),d=ba(d,t),d=Ta(d,t),f=di(f),f=ba(f,t),f=Ta(f,t),d=Aa(d),f=Aa(f),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,l=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+l,r=["#define varying in",t.glslVersion===na?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===na?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+r);const _=T+l+d,P=T+r+f,N=Sa(o,o.VERTEX_SHADER,_),E=Sa(o,o.FRAGMENT_SHADER,P);o.attachShader(U,N),o.attachShader(U,E),t.index0AttributeName!==void 0?o.bindAttribLocation(U,0,t.index0AttributeName):t.morphTargets===!0&&o.bindAttribLocation(U,0,"position"),o.linkProgram(U);function F(w){if(e.debug.checkShaderErrors){const B=o.getProgramInfoLog(U)||"",z=o.getShaderInfoLog(N)||"",W=o.getShaderInfoLog(E)||"",Z=B.trim(),X=z.trim(),re=W.trim();let V=!0,fe=!0;if(o.getProgramParameter(U,o.LINK_STATUS)===!1)if(V=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(o,U,N,E);else{const pe=Ma(o,N,"vertex"),De=Ma(o,E,"fragment");vt("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(U,o.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+Z+`
`+pe+`
`+De)}else Z!==""?Je("WebGLProgram: Program Info Log:",Z):(X===""||re==="")&&(fe=!1);fe&&(w.diagnostics={runnable:V,programLog:Z,vertexShader:{log:X,prefix:l},fragmentShader:{log:re,prefix:r}})}o.deleteShader(N),o.deleteShader(E),$=new Un(o,U),h=kf(o,U)}let $;this.getUniforms=function(){return $===void 0&&F(this),$};let h;this.getAttributes=function(){return h===void 0&&F(this),h};let u=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return u===!1&&(u=o.getProgramParameter(U,yf)),u},this.destroy=function(){i.releaseStatesOfProgram(this),o.deleteProgram(U),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=If++,this.cacheKey=n,this.usedTimes=1,this.program=U,this.vertexShader=N,this.fragmentShader=E,this}let ed=0;class td{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n){const t=n.vertexShader,i=n.fragmentShader,o=this._getShaderStage(t),a=this._getShaderStage(i),d=this._getShaderCacheForMaterial(n);return d.has(o)===!1&&(d.add(o),o.usedTimes++),d.has(a)===!1&&(d.add(a),a.usedTimes++),this}remove(n){const t=this.materialCache.get(n);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(n),this}getVertexShaderID(n){return this._getShaderStage(n.vertexShader).id}getFragmentShaderID(n){return this._getShaderStage(n.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){const t=this.materialCache;let i=t.get(n);return i===void 0&&(i=new Set,t.set(n,i)),i}_getShaderStage(n){const t=this.shaderCache;let i=t.get(n);return i===void 0&&(i=new nd(n),t.set(n,i)),i}}class nd{constructor(n){this.id=ed++,this.code=n,this.usedTimes=0}}function id(e,n,t,i,o,a,d){const f=new po,b=new td,v=new Set,R=[],m=o.logarithmicDepthBuffer,x=o.vertexTextures;let M=o.precision;const D={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function U(h){return v.add(h),h===0?"uv":`uv${h}`}function l(h,u,w,B,z){const W=B.fog,Z=z.geometry,X=h.isMeshStandardMaterial?B.environment:null,re=(h.isMeshStandardMaterial?t:n).get(h.envMap||X),V=re&&re.mapping===On?re.image.height:null,fe=D[h.type];h.precision!==null&&(M=o.getMaxPrecision(h.precision),M!==h.precision&&Je("WebGLProgram.getParameters:",h.precision,"not supported, using",M,"instead."));const pe=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,De=pe!==void 0?pe.length:0;let Ye=0;Z.morphAttributes.position!==void 0&&(Ye=1),Z.morphAttributes.normal!==void 0&&(Ye=2),Z.morphAttributes.color!==void 0&&(Ye=3);let tt,je,nt,H;if(fe){const We=Rt[fe];tt=We.vertexShader,je=We.fragmentShader}else tt=h.vertexShader,je=h.fragmentShader,b.update(h),nt=b.getVertexShaderID(h),H=b.getFragmentShaderID(h);const q=e.getRenderTarget(),le=e.state.buffers.depth.getReversed(),Pe=z.isInstancedMesh===!0,_e=z.isBatchedMesh===!0,Ie=!!h.map,ut=!!h.matcap,ye=!!re,et=!!h.aoMap,g=!!h.lightMap,Ne=!!h.bumpMap,Fe=!!h.normalMap,Ze=!!h.displacementMap,he=!!h.emissiveMap,it=!!h.metalnessMap,ve=!!h.roughnessMap,we=h.anisotropy>0,p=h.clearcoat>0,s=h.dispersion>0,L=h.iridescence>0,G=h.sheen>0,Y=h.transmission>0,O=we&&!!h.anisotropyMap,xe=p&&!!h.clearcoatMap,ie=p&&!!h.clearcoatNormalMap,Se=p&&!!h.clearcoatRoughnessMap,me=L&&!!h.iridescenceMap,K=L&&!!h.iridescenceThicknessMap,j=G&&!!h.sheenColorMap,Te=G&&!!h.sheenRoughnessMap,Me=!!h.specularMap,se=!!h.specularColorMap,Re=!!h.specularIntensityMap,S=Y&&!!h.transmissionMap,ae=Y&&!!h.thicknessMap,ee=!!h.gradientMap,te=!!h.alphaMap,Q=h.alphaTest>0,k=!!h.alphaHash,de=!!h.extensions;let Ce=Ht;h.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Ce=e.toneMapping);const $e={shaderID:fe,shaderType:h.type,shaderName:h.name,vertexShader:tt,fragmentShader:je,defines:h.defines,customVertexShaderID:nt,customFragmentShaderID:H,isRawShaderMaterial:h.isRawShaderMaterial===!0,glslVersion:h.glslVersion,precision:M,batching:_e,batchingColor:_e&&z._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&z.instanceColor!==null,instancingMorph:Pe&&z.morphTexture!==null,supportsVertexTextures:x,outputColorSpace:q===null?e.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:Nn,alphaToCoverage:!!h.alphaToCoverage,map:Ie,matcap:ut,envMap:ye,envMapMode:ye&&re.mapping,envMapCubeUVHeight:V,aoMap:et,lightMap:g,bumpMap:Ne,normalMap:Fe,displacementMap:x&&Ze,emissiveMap:he,normalMapObjectSpace:Fe&&h.normalMapType===so,normalMapTangentSpace:Fe&&h.normalMapType===oo,metalnessMap:it,roughnessMap:ve,anisotropy:we,anisotropyMap:O,clearcoat:p,clearcoatMap:xe,clearcoatNormalMap:ie,clearcoatRoughnessMap:Se,dispersion:s,iridescence:L,iridescenceMap:me,iridescenceThicknessMap:K,sheen:G,sheenColorMap:j,sheenRoughnessMap:Te,specularMap:Me,specularColorMap:se,specularIntensityMap:Re,transmission:Y,transmissionMap:S,thicknessMap:ae,gradientMap:ee,opaque:h.transparent===!1&&h.blending===Pn&&h.alphaToCoverage===!1,alphaMap:te,alphaTest:Q,alphaHash:k,combine:h.combine,mapUv:Ie&&U(h.map.channel),aoMapUv:et&&U(h.aoMap.channel),lightMapUv:g&&U(h.lightMap.channel),bumpMapUv:Ne&&U(h.bumpMap.channel),normalMapUv:Fe&&U(h.normalMap.channel),displacementMapUv:Ze&&U(h.displacementMap.channel),emissiveMapUv:he&&U(h.emissiveMap.channel),metalnessMapUv:it&&U(h.metalnessMap.channel),roughnessMapUv:ve&&U(h.roughnessMap.channel),anisotropyMapUv:O&&U(h.anisotropyMap.channel),clearcoatMapUv:xe&&U(h.clearcoatMap.channel),clearcoatNormalMapUv:ie&&U(h.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&U(h.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&U(h.iridescenceMap.channel),iridescenceThicknessMapUv:K&&U(h.iridescenceThicknessMap.channel),sheenColorMapUv:j&&U(h.sheenColorMap.channel),sheenRoughnessMapUv:Te&&U(h.sheenRoughnessMap.channel),specularMapUv:Me&&U(h.specularMap.channel),specularColorMapUv:se&&U(h.specularColorMap.channel),specularIntensityMapUv:Re&&U(h.specularIntensityMap.channel),transmissionMapUv:S&&U(h.transmissionMap.channel),thicknessMapUv:ae&&U(h.thicknessMap.channel),alphaMapUv:te&&U(h.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(Fe||we),vertexColors:h.vertexColors,vertexAlphas:h.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!Z.attributes.uv&&(Ie||te),fog:!!W,useFog:h.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:h.flatShading===!0&&h.wireframe===!1,sizeAttenuation:h.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:le,skinning:z.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:De,morphTextureStride:Ye,numDirLights:u.directional.length,numPointLights:u.point.length,numSpotLights:u.spot.length,numSpotLightMaps:u.spotLightMap.length,numRectAreaLights:u.rectArea.length,numHemiLights:u.hemi.length,numDirLightShadows:u.directionalShadowMap.length,numPointLightShadows:u.pointShadowMap.length,numSpotLightShadows:u.spotShadowMap.length,numSpotLightShadowsWithMaps:u.numSpotLightShadowsWithMaps,numLightProbes:u.numLightProbes,numClippingPlanes:d.numPlanes,numClipIntersection:d.numIntersection,dithering:h.dithering,shadowMapEnabled:e.shadowMap.enabled&&w.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ce,decodeVideoTexture:Ie&&h.map.isVideoTexture===!0&&lt.getTransfer(h.map.colorSpace)===Qe,decodeVideoTextureEmissive:he&&h.emissiveMap.isVideoTexture===!0&&lt.getTransfer(h.emissiveMap.colorSpace)===Qe,premultipliedAlpha:h.premultipliedAlpha,doubleSided:h.side===Dt,flipSided:h.side===bt,useDepthPacking:h.depthPacking>=0,depthPacking:h.depthPacking||0,index0AttributeName:h.index0AttributeName,extensionClipCullDistance:de&&h.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(de&&h.extensions.multiDraw===!0||_e)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:h.customProgramCacheKey()};return $e.vertexUv1s=v.has(1),$e.vertexUv2s=v.has(2),$e.vertexUv3s=v.has(3),v.clear(),$e}function r(h){const u=[];if(h.shaderID?u.push(h.shaderID):(u.push(h.customVertexShaderID),u.push(h.customFragmentShaderID)),h.defines!==void 0)for(const w in h.defines)u.push(w),u.push(h.defines[w]);return h.isRawShaderMaterial===!1&&(T(u,h),_(u,h),u.push(e.outputColorSpace)),u.push(h.customProgramCacheKey),u.join()}function T(h,u){h.push(u.precision),h.push(u.outputColorSpace),h.push(u.envMapMode),h.push(u.envMapCubeUVHeight),h.push(u.mapUv),h.push(u.alphaMapUv),h.push(u.lightMapUv),h.push(u.aoMapUv),h.push(u.bumpMapUv),h.push(u.normalMapUv),h.push(u.displacementMapUv),h.push(u.emissiveMapUv),h.push(u.metalnessMapUv),h.push(u.roughnessMapUv),h.push(u.anisotropyMapUv),h.push(u.clearcoatMapUv),h.push(u.clearcoatNormalMapUv),h.push(u.clearcoatRoughnessMapUv),h.push(u.iridescenceMapUv),h.push(u.iridescenceThicknessMapUv),h.push(u.sheenColorMapUv),h.push(u.sheenRoughnessMapUv),h.push(u.specularMapUv),h.push(u.specularColorMapUv),h.push(u.specularIntensityMapUv),h.push(u.transmissionMapUv),h.push(u.thicknessMapUv),h.push(u.combine),h.push(u.fogExp2),h.push(u.sizeAttenuation),h.push(u.morphTargetsCount),h.push(u.morphAttributeCount),h.push(u.numDirLights),h.push(u.numPointLights),h.push(u.numSpotLights),h.push(u.numSpotLightMaps),h.push(u.numHemiLights),h.push(u.numRectAreaLights),h.push(u.numDirLightShadows),h.push(u.numPointLightShadows),h.push(u.numSpotLightShadows),h.push(u.numSpotLightShadowsWithMaps),h.push(u.numLightProbes),h.push(u.shadowMapType),h.push(u.toneMapping),h.push(u.numClippingPlanes),h.push(u.numClipIntersection),h.push(u.depthPacking)}function _(h,u){f.disableAll(),u.supportsVertexTextures&&f.enable(0),u.instancing&&f.enable(1),u.instancingColor&&f.enable(2),u.instancingMorph&&f.enable(3),u.matcap&&f.enable(4),u.envMap&&f.enable(5),u.normalMapObjectSpace&&f.enable(6),u.normalMapTangentSpace&&f.enable(7),u.clearcoat&&f.enable(8),u.iridescence&&f.enable(9),u.alphaTest&&f.enable(10),u.vertexColors&&f.enable(11),u.vertexAlphas&&f.enable(12),u.vertexUv1s&&f.enable(13),u.vertexUv2s&&f.enable(14),u.vertexUv3s&&f.enable(15),u.vertexTangents&&f.enable(16),u.anisotropy&&f.enable(17),u.alphaHash&&f.enable(18),u.batching&&f.enable(19),u.dispersion&&f.enable(20),u.batchingColor&&f.enable(21),u.gradientMap&&f.enable(22),h.push(f.mask),f.disableAll(),u.fog&&f.enable(0),u.useFog&&f.enable(1),u.flatShading&&f.enable(2),u.logarithmicDepthBuffer&&f.enable(3),u.reversedDepthBuffer&&f.enable(4),u.skinning&&f.enable(5),u.morphTargets&&f.enable(6),u.morphNormals&&f.enable(7),u.morphColors&&f.enable(8),u.premultipliedAlpha&&f.enable(9),u.shadowMapEnabled&&f.enable(10),u.doubleSided&&f.enable(11),u.flipSided&&f.enable(12),u.useDepthPacking&&f.enable(13),u.dithering&&f.enable(14),u.transmission&&f.enable(15),u.sheen&&f.enable(16),u.opaque&&f.enable(17),u.pointsUvs&&f.enable(18),u.decodeVideoTexture&&f.enable(19),u.decodeVideoTextureEmissive&&f.enable(20),u.alphaToCoverage&&f.enable(21),h.push(f.mask)}function P(h){const u=D[h.type];let w;if(u){const B=Rt[u];w=ro.clone(B.uniforms)}else w=h.uniforms;return w}function N(h,u){let w;for(let B=0,z=R.length;B<z;B++){const W=R[B];if(W.cacheKey===u){w=W,++w.usedTimes;break}}return w===void 0&&(w=new jf(e,u,h,a),R.push(w)),w}function E(h){if(--h.usedTimes===0){const u=R.indexOf(h);R[u]=R[R.length-1],R.pop(),h.destroy()}}function F(h){b.remove(h)}function $(){b.dispose()}return{getParameters:l,getProgramCacheKey:r,getUniforms:P,acquireProgram:N,releaseProgram:E,releaseShaderCache:F,programs:R,dispose:$}}function ad(){let e=new WeakMap;function n(d){return e.has(d)}function t(d){let f=e.get(d);return f===void 0&&(f={},e.set(d,f)),f}function i(d){e.delete(d)}function o(d,f,b){e.get(d)[f]=b}function a(){e=new WeakMap}return{has:n,get:t,remove:i,update:o,dispose:a}}function rd(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.material.id!==n.material.id?e.material.id-n.material.id:e.z!==n.z?e.z-n.z:e.id-n.id}function Ca(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.z!==n.z?n.z-e.z:e.id-n.id}function wa(){const e=[];let n=0;const t=[],i=[],o=[];function a(){n=0,t.length=0,i.length=0,o.length=0}function d(m,x,M,D,U,l){let r=e[n];return r===void 0?(r={id:m.id,object:m,geometry:x,material:M,groupOrder:D,renderOrder:m.renderOrder,z:U,group:l},e[n]=r):(r.id=m.id,r.object=m,r.geometry=x,r.material=M,r.groupOrder=D,r.renderOrder=m.renderOrder,r.z=U,r.group=l),n++,r}function f(m,x,M,D,U,l){const r=d(m,x,M,D,U,l);M.transmission>0?i.push(r):M.transparent===!0?o.push(r):t.push(r)}function b(m,x,M,D,U,l){const r=d(m,x,M,D,U,l);M.transmission>0?i.unshift(r):M.transparent===!0?o.unshift(r):t.unshift(r)}function v(m,x){t.length>1&&t.sort(m||rd),i.length>1&&i.sort(x||Ca),o.length>1&&o.sort(x||Ca)}function R(){for(let m=n,x=e.length;m<x;m++){const M=e[m];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:t,transmissive:i,transparent:o,init:a,push:f,unshift:b,finish:R,sort:v}}function od(){let e=new WeakMap;function n(i,o){const a=e.get(i);let d;return a===void 0?(d=new wa,e.set(i,[d])):o>=a.length?(d=new wa,a.push(d)):d=a[o],d}function t(){e=new WeakMap}return{get:n,dispose:t}}function sd(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={direction:new ze,color:new Ke};break;case"SpotLight":t={position:new ze,direction:new ze,color:new Ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new ze,color:new Ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new ze,skyColor:new Ke,groundColor:new Ke};break;case"RectAreaLight":t={color:new Ke,position:new ze,halfWidth:new ze,halfHeight:new ze};break}return e[n.id]=t,t}}}function cd(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[n.id]=t,t}}}let ld=0;function fd(e,n){return(n.castShadow?2:0)-(e.castShadow?2:0)+(n.map?1:0)-(e.map?1:0)}function dd(e){const n=new sd,t=cd(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let v=0;v<9;v++)i.probe.push(new ze);const o=new ze,a=new nn,d=new nn;function f(v){let R=0,m=0,x=0;for(let h=0;h<9;h++)i.probe[h].set(0,0,0);let M=0,D=0,U=0,l=0,r=0,T=0,_=0,P=0,N=0,E=0,F=0;v.sort(fd);for(let h=0,u=v.length;h<u;h++){const w=v[h],B=w.color,z=w.intensity,W=w.distance,Z=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)R+=B.r*z,m+=B.g*z,x+=B.b*z;else if(w.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(w.sh.coefficients[X],z);F++}else if(w.isDirectionalLight){const X=n.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const re=w.shadow,V=t.get(w);V.shadowIntensity=re.intensity,V.shadowBias=re.bias,V.shadowNormalBias=re.normalBias,V.shadowRadius=re.radius,V.shadowMapSize=re.mapSize,i.directionalShadow[M]=V,i.directionalShadowMap[M]=Z,i.directionalShadowMatrix[M]=w.shadow.matrix,T++}i.directional[M]=X,M++}else if(w.isSpotLight){const X=n.get(w);X.position.setFromMatrixPosition(w.matrixWorld),X.color.copy(B).multiplyScalar(z),X.distance=W,X.coneCos=Math.cos(w.angle),X.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),X.decay=w.decay,i.spot[U]=X;const re=w.shadow;if(w.map&&(i.spotLightMap[N]=w.map,N++,re.updateMatrices(w),w.castShadow&&E++),i.spotLightMatrix[U]=re.matrix,w.castShadow){const V=t.get(w);V.shadowIntensity=re.intensity,V.shadowBias=re.bias,V.shadowNormalBias=re.normalBias,V.shadowRadius=re.radius,V.shadowMapSize=re.mapSize,i.spotShadow[U]=V,i.spotShadowMap[U]=Z,P++}U++}else if(w.isRectAreaLight){const X=n.get(w);X.color.copy(B).multiplyScalar(z),X.halfWidth.set(w.width*.5,0,0),X.halfHeight.set(0,w.height*.5,0),i.rectArea[l]=X,l++}else if(w.isPointLight){const X=n.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),X.distance=w.distance,X.decay=w.decay,w.castShadow){const re=w.shadow,V=t.get(w);V.shadowIntensity=re.intensity,V.shadowBias=re.bias,V.shadowNormalBias=re.normalBias,V.shadowRadius=re.radius,V.shadowMapSize=re.mapSize,V.shadowCameraNear=re.camera.near,V.shadowCameraFar=re.camera.far,i.pointShadow[D]=V,i.pointShadowMap[D]=Z,i.pointShadowMatrix[D]=w.shadow.matrix,_++}i.point[D]=X,D++}else if(w.isHemisphereLight){const X=n.get(w);X.skyColor.copy(w.color).multiplyScalar(z),X.groundColor.copy(w.groundColor).multiplyScalar(z),i.hemi[r]=X,r++}}l>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ne.LTC_FLOAT_1,i.rectAreaLTC2=ne.LTC_FLOAT_2):(i.rectAreaLTC1=ne.LTC_HALF_1,i.rectAreaLTC2=ne.LTC_HALF_2)),i.ambient[0]=R,i.ambient[1]=m,i.ambient[2]=x;const $=i.hash;($.directionalLength!==M||$.pointLength!==D||$.spotLength!==U||$.rectAreaLength!==l||$.hemiLength!==r||$.numDirectionalShadows!==T||$.numPointShadows!==_||$.numSpotShadows!==P||$.numSpotMaps!==N||$.numLightProbes!==F)&&(i.directional.length=M,i.spot.length=U,i.rectArea.length=l,i.point.length=D,i.hemi.length=r,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=_,i.pointShadowMap.length=_,i.spotShadow.length=P,i.spotShadowMap.length=P,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=_,i.spotLightMatrix.length=P+N-E,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=F,$.directionalLength=M,$.pointLength=D,$.spotLength=U,$.rectAreaLength=l,$.hemiLength=r,$.numDirectionalShadows=T,$.numPointShadows=_,$.numSpotShadows=P,$.numSpotMaps=N,$.numLightProbes=F,i.version=ld++)}function b(v,R){let m=0,x=0,M=0,D=0,U=0;const l=R.matrixWorldInverse;for(let r=0,T=v.length;r<T;r++){const _=v[r];if(_.isDirectionalLight){const P=i.directional[m];P.direction.setFromMatrixPosition(_.matrixWorld),o.setFromMatrixPosition(_.target.matrixWorld),P.direction.sub(o),P.direction.transformDirection(l),m++}else if(_.isSpotLight){const P=i.spot[M];P.position.setFromMatrixPosition(_.matrixWorld),P.position.applyMatrix4(l),P.direction.setFromMatrixPosition(_.matrixWorld),o.setFromMatrixPosition(_.target.matrixWorld),P.direction.sub(o),P.direction.transformDirection(l),M++}else if(_.isRectAreaLight){const P=i.rectArea[D];P.position.setFromMatrixPosition(_.matrixWorld),P.position.applyMatrix4(l),d.identity(),a.copy(_.matrixWorld),a.premultiply(l),d.extractRotation(a),P.halfWidth.set(_.width*.5,0,0),P.halfHeight.set(0,_.height*.5,0),P.halfWidth.applyMatrix4(d),P.halfHeight.applyMatrix4(d),D++}else if(_.isPointLight){const P=i.point[x];P.position.setFromMatrixPosition(_.matrixWorld),P.position.applyMatrix4(l),x++}else if(_.isHemisphereLight){const P=i.hemi[U];P.direction.setFromMatrixPosition(_.matrixWorld),P.direction.transformDirection(l),U++}}}return{setup:f,setupView:b,state:i}}function Pa(e){const n=new dd(e),t=[],i=[];function o(R){v.camera=R,t.length=0,i.length=0}function a(R){t.push(R)}function d(R){i.push(R)}function f(){n.setup(t)}function b(R){n.setupView(t,R)}const v={lightsArray:t,shadowsArray:i,camera:null,lights:n,transmissionRenderTarget:{}};return{init:o,state:v,setupLights:f,setupLightsView:b,pushLight:a,pushShadow:d}}function ud(e){let n=new WeakMap;function t(o,a=0){const d=n.get(o);let f;return d===void 0?(f=new Pa(e),n.set(o,[f])):a>=d.length?(f=new Pa(e),d.push(f)):f=d[a],f}function i(){n=new WeakMap}return{get:t,dispose:i}}const pd=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,hd=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function md(e,n,t){let i=new Ua;const o=new ht,a=new ht,d=new gt,f=new Xr({depthPacking:Yr}),b=new qr,v={},R=t.maxTextureSize,m={[xn]:bt,[bt]:xn,[Dt]:Dt},x=new zt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ht},radius:{value:4}},vertexShader:pd,fragmentShader:hd}),M=x.clone();M.defines.HORIZONTAL_PASS=1;const D=new Fn;D.setAttribute("position",new wn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const U=new It(D,x),l=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Na;let r=this.type;this.render=function(E,F,$){if(l.enabled===!1||l.autoUpdate===!1&&l.needsUpdate===!1||E.length===0)return;const h=e.getRenderTarget(),u=e.getActiveCubeFace(),w=e.getActiveMipmapLevel(),B=e.state;B.setBlending(kt),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const z=r!==Lt&&this.type===Lt,W=r===Lt&&this.type!==Lt;for(let Z=0,X=E.length;Z<X;Z++){const re=E[Z],V=re.shadow;if(V===void 0){Je("WebGLShadowMap:",re,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;o.copy(V.mapSize);const fe=V.getFrameExtents();if(o.multiply(fe),a.copy(V.mapSize),(o.x>R||o.y>R)&&(o.x>R&&(a.x=Math.floor(R/fe.x),o.x=a.x*fe.x,V.mapSize.x=a.x),o.y>R&&(a.y=Math.floor(R/fe.y),o.y=a.y*fe.y,V.mapSize.y=a.y)),V.map===null||z===!0||W===!0){const De=this.type!==Lt?{minFilter:mn,magFilter:mn}:{};V.map!==null&&V.map.dispose(),V.map=new an(o.x,o.y,De),V.map.texture.name=re.name+".shadowMap",V.camera.updateProjectionMatrix()}e.setRenderTarget(V.map),e.clear();const pe=V.getViewportCount();for(let De=0;De<pe;De++){const Ye=V.getViewport(De);d.set(a.x*Ye.x,a.y*Ye.y,a.x*Ye.z,a.y*Ye.w),B.viewport(d),V.updateMatrices(re,De),i=V.getFrustum(),P(F,$,V.camera,re,this.type)}V.isPointLightShadow!==!0&&this.type===Lt&&T(V,$),V.needsUpdate=!1}r=this.type,l.needsUpdate=!1,e.setRenderTarget(h,u,w)};function T(E,F){const $=n.update(U);x.defines.VSM_SAMPLES!==E.blurSamples&&(x.defines.VSM_SAMPLES=E.blurSamples,M.defines.VSM_SAMPLES=E.blurSamples,x.needsUpdate=!0,M.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new an(o.x,o.y)),x.uniforms.shadow_pass.value=E.map.texture,x.uniforms.resolution.value=E.mapSize,x.uniforms.radius.value=E.radius,e.setRenderTarget(E.mapPass),e.clear(),e.renderBufferDirect(F,null,$,x,U,null),M.uniforms.shadow_pass.value=E.mapPass.texture,M.uniforms.resolution.value=E.mapSize,M.uniforms.radius.value=E.radius,e.setRenderTarget(E.map),e.clear(),e.renderBufferDirect(F,null,$,M,U,null)}function _(E,F,$,h){let u=null;const w=$.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(w!==void 0)u=w;else if(u=$.isPointLight===!0?b:f,e.localClippingEnabled&&F.clipShadows===!0&&Array.isArray(F.clippingPlanes)&&F.clippingPlanes.length!==0||F.displacementMap&&F.displacementScale!==0||F.alphaMap&&F.alphaTest>0||F.map&&F.alphaTest>0||F.alphaToCoverage===!0){const B=u.uuid,z=F.uuid;let W=v[B];W===void 0&&(W={},v[B]=W);let Z=W[z];Z===void 0&&(Z=u.clone(),W[z]=Z,F.addEventListener("dispose",N)),u=Z}if(u.visible=F.visible,u.wireframe=F.wireframe,h===Lt?u.side=F.shadowSide!==null?F.shadowSide:F.side:u.side=F.shadowSide!==null?F.shadowSide:m[F.side],u.alphaMap=F.alphaMap,u.alphaTest=F.alphaToCoverage===!0?.5:F.alphaTest,u.map=F.map,u.clipShadows=F.clipShadows,u.clippingPlanes=F.clippingPlanes,u.clipIntersection=F.clipIntersection,u.displacementMap=F.displacementMap,u.displacementScale=F.displacementScale,u.displacementBias=F.displacementBias,u.wireframeLinewidth=F.wireframeLinewidth,u.linewidth=F.linewidth,$.isPointLight===!0&&u.isMeshDistanceMaterial===!0){const B=e.properties.get(u);B.light=$}return u}function P(E,F,$,h,u){if(E.visible===!1)return;if(E.layers.test(F.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&u===Lt)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,E.matrixWorld);const z=n.update(E),W=E.material;if(Array.isArray(W)){const Z=z.groups;for(let X=0,re=Z.length;X<re;X++){const V=Z[X],fe=W[V.materialIndex];if(fe&&fe.visible){const pe=_(E,fe,h,u);E.onBeforeShadow(e,E,F,$,z,pe,V),e.renderBufferDirect($,null,z,pe,E,V),E.onAfterShadow(e,E,F,$,z,pe,V)}}}else if(W.visible){const Z=_(E,W,h,u);E.onBeforeShadow(e,E,F,$,z,Z,null),e.renderBufferDirect($,null,z,Z,E,null),E.onAfterShadow(e,E,F,$,z,Z,null)}}const B=E.children;for(let z=0,W=B.length;z<W;z++)P(B[z],F,$,h,u)}function N(E){E.target.removeEventListener("dispose",N);for(const $ in v){const h=v[$],u=E.target.uuid;u in h&&(h[u].dispose(),delete h[u])}}}const xd={[ci]:si,[oi]:ii,[ri]:ni,[yn]:ai,[si]:ci,[ii]:oi,[ni]:ri,[ai]:yn};function _d(e,n){function t(){let S=!1;const ae=new gt;let ee=null;const te=new gt(0,0,0,0);return{setMask:function(Q){ee!==Q&&!S&&(e.colorMask(Q,Q,Q,Q),ee=Q)},setLocked:function(Q){S=Q},setClear:function(Q,k,de,Ce,$e){$e===!0&&(Q*=Ce,k*=Ce,de*=Ce),ae.set(Q,k,de,Ce),te.equals(ae)===!1&&(e.clearColor(Q,k,de,Ce),te.copy(ae))},reset:function(){S=!1,ee=null,te.set(-1,0,0,0)}}}function i(){let S=!1,ae=!1,ee=null,te=null,Q=null;return{setReversed:function(k){if(ae!==k){const de=n.get("EXT_clip_control");k?de.clipControlEXT(de.LOWER_LEFT_EXT,de.ZERO_TO_ONE_EXT):de.clipControlEXT(de.LOWER_LEFT_EXT,de.NEGATIVE_ONE_TO_ONE_EXT),ae=k;const Ce=Q;Q=null,this.setClear(Ce)}},getReversed:function(){return ae},setTest:function(k){k?q(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(k){ee!==k&&!S&&(e.depthMask(k),ee=k)},setFunc:function(k){if(ae&&(k=xd[k]),te!==k){switch(k){case ci:e.depthFunc(e.NEVER);break;case si:e.depthFunc(e.ALWAYS);break;case oi:e.depthFunc(e.LESS);break;case yn:e.depthFunc(e.LEQUAL);break;case ri:e.depthFunc(e.EQUAL);break;case ai:e.depthFunc(e.GEQUAL);break;case ii:e.depthFunc(e.GREATER);break;case ni:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}te=k}},setLocked:function(k){S=k},setClear:function(k){Q!==k&&(ae&&(k=1-k),e.clearDepth(k),Q=k)},reset:function(){S=!1,ee=null,te=null,Q=null,ae=!1}}}function o(){let S=!1,ae=null,ee=null,te=null,Q=null,k=null,de=null,Ce=null,$e=null;return{setTest:function(We){S||(We?q(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(We){ae!==We&&!S&&(e.stencilMask(We),ae=We)},setFunc:function(We,At,Tt){(ee!==We||te!==At||Q!==Tt)&&(e.stencilFunc(We,At,Tt),ee=We,te=At,Q=Tt)},setOp:function(We,At,Tt){(k!==We||de!==At||Ce!==Tt)&&(e.stencilOp(We,At,Tt),k=We,de=At,Ce=Tt)},setLocked:function(We){S=We},setClear:function(We){$e!==We&&(e.clearStencil(We),$e=We)},reset:function(){S=!1,ae=null,ee=null,te=null,Q=null,k=null,de=null,Ce=null,$e=null}}}const a=new t,d=new i,f=new o,b=new WeakMap,v=new WeakMap;let R={},m={},x=new WeakMap,M=[],D=null,U=!1,l=null,r=null,T=null,_=null,P=null,N=null,E=null,F=new Ke(0,0,0),$=0,h=!1,u=null,w=null,B=null,z=null,W=null;const Z=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,re=0;const V=e.getParameter(e.VERSION);V.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(V)[1]),X=re>=1):V.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),X=re>=2);let fe=null,pe={};const De=e.getParameter(e.SCISSOR_BOX),Ye=e.getParameter(e.VIEWPORT),tt=new gt().fromArray(De),je=new gt().fromArray(Ye);function nt(S,ae,ee,te){const Q=new Uint8Array(4),k=e.createTexture();e.bindTexture(S,k),e.texParameteri(S,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(S,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let de=0;de<ee;de++)S===e.TEXTURE_3D||S===e.TEXTURE_2D_ARRAY?e.texImage3D(ae,0,e.RGBA,1,1,te,0,e.RGBA,e.UNSIGNED_BYTE,Q):e.texImage2D(ae+de,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Q);return k}const H={};H[e.TEXTURE_2D]=nt(e.TEXTURE_2D,e.TEXTURE_2D,1),H[e.TEXTURE_CUBE_MAP]=nt(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),H[e.TEXTURE_2D_ARRAY]=nt(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),H[e.TEXTURE_3D]=nt(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),d.setClear(1),f.setClear(0),q(e.DEPTH_TEST),d.setFunc(yn),Ne(!1),Fe($i),q(e.CULL_FACE),et(kt);function q(S){R[S]!==!0&&(e.enable(S),R[S]=!0)}function le(S){R[S]!==!1&&(e.disable(S),R[S]=!1)}function Pe(S,ae){return m[S]!==ae?(e.bindFramebuffer(S,ae),m[S]=ae,S===e.DRAW_FRAMEBUFFER&&(m[e.FRAMEBUFFER]=ae),S===e.FRAMEBUFFER&&(m[e.DRAW_FRAMEBUFFER]=ae),!0):!1}function _e(S,ae){let ee=M,te=!1;if(S){ee=x.get(ae),ee===void 0&&(ee=[],x.set(ae,ee));const Q=S.textures;if(ee.length!==Q.length||ee[0]!==e.COLOR_ATTACHMENT0){for(let k=0,de=Q.length;k<de;k++)ee[k]=e.COLOR_ATTACHMENT0+k;ee.length=Q.length,te=!0}}else ee[0]!==e.BACK&&(ee[0]=e.BACK,te=!0);te&&e.drawBuffers(ee)}function Ie(S){return D!==S?(e.useProgram(S),D=S,!0):!1}const ut={[cn]:e.FUNC_ADD,[gr]:e.FUNC_SUBTRACT,[_r]:e.FUNC_REVERSE_SUBTRACT};ut[Co]=e.MIN,ut[wo]=e.MAX;const ye={[yr]:e.ZERO,[Dr]:e.ONE,[Ur]:e.SRC_COLOR,[Lr]:e.SRC_ALPHA,[Pr]:e.SRC_ALPHA_SATURATE,[wr]:e.DST_COLOR,[Cr]:e.DST_ALPHA,[Rr]:e.ONE_MINUS_SRC_COLOR,[Ar]:e.ONE_MINUS_SRC_ALPHA,[Tr]:e.ONE_MINUS_DST_COLOR,[br]:e.ONE_MINUS_DST_ALPHA,[Mr]:e.CONSTANT_COLOR,[Er]:e.ONE_MINUS_CONSTANT_COLOR,[Sr]:e.CONSTANT_ALPHA,[vr]:e.ONE_MINUS_CONSTANT_ALPHA};function et(S,ae,ee,te,Q,k,de,Ce,$e,We){if(S===kt){U===!0&&(le(e.BLEND),U=!1);return}if(U===!1&&(q(e.BLEND),U=!0),S!==io){if(S!==l||We!==h){if((r!==cn||P!==cn)&&(e.blendEquation(e.FUNC_ADD),r=cn,P=cn),We)switch(S){case Pn:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ji:e.blendFunc(e.ONE,e.ONE);break;case Ji:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Qi:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:vt("WebGLState: Invalid blending: ",S);break}else switch(S){case Pn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ji:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case Ji:vt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Qi:vt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:vt("WebGLState: Invalid blending: ",S);break}T=null,_=null,N=null,E=null,F.set(0,0,0),$=0,l=S,h=We}return}Q=Q||ae,k=k||ee,de=de||te,(ae!==r||Q!==P)&&(e.blendEquationSeparate(ut[ae],ut[Q]),r=ae,P=Q),(ee!==T||te!==_||k!==N||de!==E)&&(e.blendFuncSeparate(ye[ee],ye[te],ye[k],ye[de]),T=ee,_=te,N=k,E=de),(Ce.equals(F)===!1||$e!==$)&&(e.blendColor(Ce.r,Ce.g,Ce.b,$e),F.copy(Ce),$=$e),l=S,h=!1}function g(S,ae){S.side===Dt?le(e.CULL_FACE):q(e.CULL_FACE);let ee=S.side===bt;ae&&(ee=!ee),Ne(ee),S.blending===Pn&&S.transparent===!1?et(kt):et(S.blending,S.blendEquation,S.blendSrc,S.blendDst,S.blendEquationAlpha,S.blendSrcAlpha,S.blendDstAlpha,S.blendColor,S.blendAlpha,S.premultipliedAlpha),d.setFunc(S.depthFunc),d.setTest(S.depthTest),d.setMask(S.depthWrite),a.setMask(S.colorWrite);const te=S.stencilWrite;f.setTest(te),te&&(f.setMask(S.stencilWriteMask),f.setFunc(S.stencilFunc,S.stencilRef,S.stencilFuncMask),f.setOp(S.stencilFail,S.stencilZFail,S.stencilZPass)),he(S.polygonOffset,S.polygonOffsetFactor,S.polygonOffsetUnits),S.alphaToCoverage===!0?q(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function Ne(S){u!==S&&(S?e.frontFace(e.CW):e.frontFace(e.CCW),u=S)}function Fe(S){S!==to?(q(e.CULL_FACE),S!==w&&(S===$i?e.cullFace(e.BACK):S===no?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):le(e.CULL_FACE),w=S}function Ze(S){S!==B&&(X&&e.lineWidth(S),B=S)}function he(S,ae,ee){S?(q(e.POLYGON_OFFSET_FILL),(z!==ae||W!==ee)&&(e.polygonOffset(ae,ee),z=ae,W=ee)):le(e.POLYGON_OFFSET_FILL)}function it(S){S?q(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function ve(S){S===void 0&&(S=e.TEXTURE0+Z-1),fe!==S&&(e.activeTexture(S),fe=S)}function we(S,ae,ee){ee===void 0&&(fe===null?ee=e.TEXTURE0+Z-1:ee=fe);let te=pe[ee];te===void 0&&(te={type:void 0,texture:void 0},pe[ee]=te),(te.type!==S||te.texture!==ae)&&(fe!==ee&&(e.activeTexture(ee),fe=ee),e.bindTexture(S,ae||H[S]),te.type=S,te.texture=ae)}function p(){const S=pe[fe];S!==void 0&&S.type!==void 0&&(e.bindTexture(S.type,null),S.type=void 0,S.texture=void 0)}function s(){try{e.compressedTexImage2D(...arguments)}catch(S){S("WebGLState:",S)}}function L(){try{e.compressedTexImage3D(...arguments)}catch(S){S("WebGLState:",S)}}function G(){try{e.texSubImage2D(...arguments)}catch(S){S("WebGLState:",S)}}function Y(){try{e.texSubImage3D(...arguments)}catch(S){S("WebGLState:",S)}}function O(){try{e.compressedTexSubImage2D(...arguments)}catch(S){S("WebGLState:",S)}}function xe(){try{e.compressedTexSubImage3D(...arguments)}catch(S){S("WebGLState:",S)}}function ie(){try{e.texStorage2D(...arguments)}catch(S){S("WebGLState:",S)}}function Se(){try{e.texStorage3D(...arguments)}catch(S){S("WebGLState:",S)}}function me(){try{e.texImage2D(...arguments)}catch(S){S("WebGLState:",S)}}function K(){try{e.texImage3D(...arguments)}catch(S){S("WebGLState:",S)}}function j(S){tt.equals(S)===!1&&(e.scissor(S.x,S.y,S.z,S.w),tt.copy(S))}function Te(S){je.equals(S)===!1&&(e.viewport(S.x,S.y,S.z,S.w),je.copy(S))}function Me(S,ae){let ee=v.get(ae);ee===void 0&&(ee=new WeakMap,v.set(ae,ee));let te=ee.get(S);te===void 0&&(te=e.getUniformBlockIndex(ae,S.name),ee.set(S,te))}function se(S,ae){const te=v.get(ae).get(S);b.get(ae)!==te&&(e.uniformBlockBinding(ae,te,S.__bindingPointIndex),b.set(ae,te))}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),d.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),R={},fe=null,pe={},m={},x=new WeakMap,M=[],D=null,U=!1,l=null,r=null,T=null,_=null,P=null,N=null,E=null,F=new Ke(0,0,0),$=0,h=!1,u=null,w=null,B=null,z=null,W=null,tt.set(0,0,e.canvas.width,e.canvas.height),je.set(0,0,e.canvas.width,e.canvas.height),a.reset(),d.reset(),f.reset()}return{buffers:{color:a,depth:d,stencil:f},enable:q,disable:le,bindFramebuffer:Pe,drawBuffers:_e,useProgram:Ie,setBlending:et,setMaterial:g,setFlipSided:Ne,setCullFace:Fe,setLineWidth:Ze,setPolygonOffset:he,setScissorTest:it,activeTexture:ve,bindTexture:we,unbindTexture:p,compressedTexImage2D:s,compressedTexImage3D:L,texImage2D:me,texImage3D:K,updateUBOMapping:Me,uniformBlockBinding:se,texStorage2D:ie,texStorage3D:Se,texSubImage2D:G,texSubImage3D:Y,compressedTexSubImage2D:O,compressedTexSubImage3D:xe,scissor:j,viewport:Te,reset:Re}}function gd(e,n,t,i,o,a,d){const f=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,b=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),v=new ht,R=new WeakMap;let m;const x=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function D(p,s){return M?new OffscreenCanvas(p,s):bo("canvas")}function U(p,s,L){let G=1;const Y=we(p);if((Y.width>L||Y.height>L)&&(G=L/Math.max(Y.width,Y.height)),G<1)if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap||typeof VideoFrame<"u"&&p instanceof VideoFrame){const O=Math.floor(G*Y.width),xe=Math.floor(G*Y.height);m===void 0&&(m=D(O,xe));const ie=s?D(O,xe):m;return ie.width=O,ie.height=xe,ie.getContext("2d").drawImage(p,0,0,O,xe),Je("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+O+"x"+xe+")."),ie}else return"data"in p&&Je("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),p;return p}function l(p){return p.generateMipmaps}function r(p){e.generateMipmap(p)}function T(p){return p.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:p.isWebGL3DRenderTarget?e.TEXTURE_3D:p.isWebGLArrayRenderTarget||p.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function _(p,s,L,G,Y=!1){if(p!==null){if(e[p]!==void 0)return e[p];Je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+p+"'")}let O=s;if(s===e.RED&&(L===e.FLOAT&&(O=e.R32F),L===e.HALF_FLOAT&&(O=e.R16F),L===e.UNSIGNED_BYTE&&(O=e.R8)),s===e.RED_INTEGER&&(L===e.UNSIGNED_BYTE&&(O=e.R8UI),L===e.UNSIGNED_SHORT&&(O=e.R16UI),L===e.UNSIGNED_INT&&(O=e.R32UI),L===e.BYTE&&(O=e.R8I),L===e.SHORT&&(O=e.R16I),L===e.INT&&(O=e.R32I)),s===e.RG&&(L===e.FLOAT&&(O=e.RG32F),L===e.HALF_FLOAT&&(O=e.RG16F),L===e.UNSIGNED_BYTE&&(O=e.RG8)),s===e.RG_INTEGER&&(L===e.UNSIGNED_BYTE&&(O=e.RG8UI),L===e.UNSIGNED_SHORT&&(O=e.RG16UI),L===e.UNSIGNED_INT&&(O=e.RG32UI),L===e.BYTE&&(O=e.RG8I),L===e.SHORT&&(O=e.RG16I),L===e.INT&&(O=e.RG32I)),s===e.RGB_INTEGER&&(L===e.UNSIGNED_BYTE&&(O=e.RGB8UI),L===e.UNSIGNED_SHORT&&(O=e.RGB16UI),L===e.UNSIGNED_INT&&(O=e.RGB32UI),L===e.BYTE&&(O=e.RGB8I),L===e.SHORT&&(O=e.RGB16I),L===e.INT&&(O=e.RGB32I)),s===e.RGBA_INTEGER&&(L===e.UNSIGNED_BYTE&&(O=e.RGBA8UI),L===e.UNSIGNED_SHORT&&(O=e.RGBA16UI),L===e.UNSIGNED_INT&&(O=e.RGBA32UI),L===e.BYTE&&(O=e.RGBA8I),L===e.SHORT&&(O=e.RGBA16I),L===e.INT&&(O=e.RGBA32I)),s===e.RGB&&(L===e.UNSIGNED_INT_5_9_9_9_REV&&(O=e.RGB9_E5),L===e.UNSIGNED_INT_10F_11F_11F_REV&&(O=e.R11F_G11F_B10F)),s===e.RGBA){const xe=Y?qa:lt.getTransfer(G);L===e.FLOAT&&(O=e.RGBA32F),L===e.HALF_FLOAT&&(O=e.RGBA16F),L===e.UNSIGNED_BYTE&&(O=xe===Qe?e.SRGB8_ALPHA8:e.RGBA8),L===e.UNSIGNED_SHORT_4_4_4_4&&(O=e.RGBA4),L===e.UNSIGNED_SHORT_5_5_5_1&&(O=e.RGB5_A1)}return(O===e.R16F||O===e.R32F||O===e.RG16F||O===e.RG32F||O===e.RGBA16F||O===e.RGBA32F)&&n.get("EXT_color_buffer_float"),O}function P(p,s){let L;return p?s===null||s===gn||s===_n?L=e.DEPTH24_STENCIL8:s===$t?L=e.DEPTH32F_STENCIL8:s===In&&(L=e.DEPTH24_STENCIL8,Je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):s===null||s===gn||s===_n?L=e.DEPTH_COMPONENT24:s===$t?L=e.DEPTH_COMPONENT32F:s===In&&(L=e.DEPTH_COMPONENT16),L}function N(p,s){return l(p)===!0||p.isFramebufferTexture&&p.minFilter!==mn&&p.minFilter!==Gt?Math.log2(Math.max(s.width,s.height))+1:p.mipmaps!==void 0&&p.mipmaps.length>0?p.mipmaps.length:p.isCompressedTexture&&Array.isArray(p.image)?s.mipmaps.length:1}function E(p){const s=p.target;s.removeEventListener("dispose",E),$(s),s.isVideoTexture&&R.delete(s)}function F(p){const s=p.target;s.removeEventListener("dispose",F),u(s)}function $(p){const s=i.get(p);if(s.__webglInit===void 0)return;const L=p.source,G=x.get(L);if(G){const Y=G[s.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&h(p),Object.keys(G).length===0&&x.delete(L)}i.remove(p)}function h(p){const s=i.get(p);e.deleteTexture(s.__webglTexture);const L=p.source,G=x.get(L);delete G[s.__cacheKey],d.memory.textures--}function u(p){const s=i.get(p);if(p.depthTexture&&(p.depthTexture.dispose(),i.remove(p.depthTexture)),p.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(s.__webglFramebuffer[G]))for(let Y=0;Y<s.__webglFramebuffer[G].length;Y++)e.deleteFramebuffer(s.__webglFramebuffer[G][Y]);else e.deleteFramebuffer(s.__webglFramebuffer[G]);s.__webglDepthbuffer&&e.deleteRenderbuffer(s.__webglDepthbuffer[G])}else{if(Array.isArray(s.__webglFramebuffer))for(let G=0;G<s.__webglFramebuffer.length;G++)e.deleteFramebuffer(s.__webglFramebuffer[G]);else e.deleteFramebuffer(s.__webglFramebuffer);if(s.__webglDepthbuffer&&e.deleteRenderbuffer(s.__webglDepthbuffer),s.__webglMultisampledFramebuffer&&e.deleteFramebuffer(s.__webglMultisampledFramebuffer),s.__webglColorRenderbuffer)for(let G=0;G<s.__webglColorRenderbuffer.length;G++)s.__webglColorRenderbuffer[G]&&e.deleteRenderbuffer(s.__webglColorRenderbuffer[G]);s.__webglDepthRenderbuffer&&e.deleteRenderbuffer(s.__webglDepthRenderbuffer)}const L=p.textures;for(let G=0,Y=L.length;G<Y;G++){const O=i.get(L[G]);O.__webglTexture&&(e.deleteTexture(O.__webglTexture),d.memory.textures--),i.remove(L[G])}i.remove(p)}let w=0;function B(){w=0}function z(){const p=w;return p>=o.maxTextures&&Je("WebGLTextures: Trying to use "+p+" texture units while this GPU supports only "+o.maxTextures),w+=1,p}function W(p){const s=[];return s.push(p.wrapS),s.push(p.wrapT),s.push(p.wrapR||0),s.push(p.magFilter),s.push(p.minFilter),s.push(p.anisotropy),s.push(p.internalFormat),s.push(p.format),s.push(p.type),s.push(p.generateMipmaps),s.push(p.premultiplyAlpha),s.push(p.flipY),s.push(p.unpackAlignment),s.push(p.colorSpace),s.join()}function Z(p,s){const L=i.get(p);if(p.isVideoTexture&&it(p),p.isRenderTargetTexture===!1&&p.isExternalTexture!==!0&&p.version>0&&L.__version!==p.version){const G=p.image;if(G===null)Je("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Je("WebGLRenderer: Texture marked for update but image is incomplete");else{H(L,p,s);return}}else p.isExternalTexture&&(L.__webglTexture=p.sourceTexture?p.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,L.__webglTexture,e.TEXTURE0+s)}function X(p,s){const L=i.get(p);if(p.isRenderTargetTexture===!1&&p.version>0&&L.__version!==p.version){H(L,p,s);return}else p.isExternalTexture&&(L.__webglTexture=p.sourceTexture?p.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,L.__webglTexture,e.TEXTURE0+s)}function re(p,s){const L=i.get(p);if(p.isRenderTargetTexture===!1&&p.version>0&&L.__version!==p.version){H(L,p,s);return}t.bindTexture(e.TEXTURE_3D,L.__webglTexture,e.TEXTURE0+s)}function V(p,s){const L=i.get(p);if(p.version>0&&L.__version!==p.version){q(L,p,s);return}t.bindTexture(e.TEXTURE_CUBE_MAP,L.__webglTexture,e.TEXTURE0+s)}const fe={[Nr]:e.REPEAT,[ti]:e.CLAMP_TO_EDGE,[Ir]:e.MIRRORED_REPEAT},pe={[mn]:e.NEAREST,[Fr]:e.NEAREST_MIPMAP_NEAREST,[bn]:e.NEAREST_MIPMAP_LINEAR,[Gt]:e.LINEAR,[zn]:e.LINEAR_MIPMAP_NEAREST,[dn]:e.LINEAR_MIPMAP_LINEAR},De={[zr]:e.NEVER,[kr]:e.ALWAYS,[Hr]:e.LESS,[Ia]:e.LEQUAL,[Vr]:e.EQUAL,[Gr]:e.GEQUAL,[Br]:e.GREATER,[Or]:e.NOTEQUAL};function Ye(p,s){if(s.type===$t&&n.has("OES_texture_float_linear")===!1&&(s.magFilter===Gt||s.magFilter===zn||s.magFilter===bn||s.magFilter===dn||s.minFilter===Gt||s.minFilter===zn||s.minFilter===bn||s.minFilter===dn)&&Je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(p,e.TEXTURE_WRAP_S,fe[s.wrapS]),e.texParameteri(p,e.TEXTURE_WRAP_T,fe[s.wrapT]),(p===e.TEXTURE_3D||p===e.TEXTURE_2D_ARRAY)&&e.texParameteri(p,e.TEXTURE_WRAP_R,fe[s.wrapR]),e.texParameteri(p,e.TEXTURE_MAG_FILTER,pe[s.magFilter]),e.texParameteri(p,e.TEXTURE_MIN_FILTER,pe[s.minFilter]),s.compareFunction&&(e.texParameteri(p,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(p,e.TEXTURE_COMPARE_FUNC,De[s.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(s.magFilter===mn||s.minFilter!==bn&&s.minFilter!==dn||s.type===$t&&n.has("OES_texture_float_linear")===!1)return;if(s.anisotropy>1||i.get(s).__currentAnisotropy){const L=n.get("EXT_texture_filter_anisotropic");e.texParameterf(p,L.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(s.anisotropy,o.getMaxAnisotropy())),i.get(s).__currentAnisotropy=s.anisotropy}}}function tt(p,s){let L=!1;p.__webglInit===void 0&&(p.__webglInit=!0,s.addEventListener("dispose",E));const G=s.source;let Y=x.get(G);Y===void 0&&(Y={},x.set(G,Y));const O=W(s);if(O!==p.__cacheKey){Y[O]===void 0&&(Y[O]={texture:e.createTexture(),usedTimes:0},d.memory.textures++,L=!0),Y[O].usedTimes++;const xe=Y[p.__cacheKey];xe!==void 0&&(Y[p.__cacheKey].usedTimes--,xe.usedTimes===0&&h(s)),p.__cacheKey=O,p.__webglTexture=Y[O].texture}return L}function je(p,s,L){return Math.floor(Math.floor(p/L)/s)}function nt(p,s,L,G){const O=p.updateRanges;if(O.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,s.width,s.height,L,G,s.data);else{O.sort((K,j)=>K.start-j.start);let xe=0;for(let K=1;K<O.length;K++){const j=O[xe],Te=O[K],Me=j.start+j.count,se=je(Te.start,s.width,4),Re=je(j.start,s.width,4);Te.start<=Me+1&&se===Re&&je(Te.start+Te.count-1,s.width,4)===se?j.count=Math.max(j.count,Te.start+Te.count-j.start):(++xe,O[xe]=Te)}O.length=xe+1;const ie=e.getParameter(e.UNPACK_ROW_LENGTH),Se=e.getParameter(e.UNPACK_SKIP_PIXELS),me=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,s.width);for(let K=0,j=O.length;K<j;K++){const Te=O[K],Me=Math.floor(Te.start/4),se=Math.ceil(Te.count/4),Re=Me%s.width,S=Math.floor(Me/s.width),ae=se,ee=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,Re),e.pixelStorei(e.UNPACK_SKIP_ROWS,S),t.texSubImage2D(e.TEXTURE_2D,0,Re,S,ae,ee,L,G,s.data)}p.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,ie),e.pixelStorei(e.UNPACK_SKIP_PIXELS,Se),e.pixelStorei(e.UNPACK_SKIP_ROWS,me)}}function H(p,s,L){let G=e.TEXTURE_2D;(s.isDataArrayTexture||s.isCompressedArrayTexture)&&(G=e.TEXTURE_2D_ARRAY),s.isData3DTexture&&(G=e.TEXTURE_3D);const Y=tt(p,s),O=s.source;t.bindTexture(G,p.__webglTexture,e.TEXTURE0+L);const xe=i.get(O);if(O.version!==xe.__version||Y===!0){t.activeTexture(e.TEXTURE0+L);const ie=lt.getPrimaries(lt.workingColorSpace),Se=s.colorSpace===tn?null:lt.getPrimaries(s.colorSpace),me=s.colorSpace===tn||ie===Se?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,s.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,s.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,s.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let K=U(s.image,!1,o.maxTextureSize);K=ve(s,K);const j=a.convert(s.format,s.colorSpace),Te=a.convert(s.type);let Me=_(s.internalFormat,j,Te,s.colorSpace,s.isVideoTexture);Ye(G,s);let se;const Re=s.mipmaps,S=s.isVideoTexture!==!0,ae=xe.__version===void 0||Y===!0,ee=O.dataReady,te=N(s,K);if(s.isDepthTexture)Me=P(s.format===Dn,s.type),ae&&(S?t.texStorage2D(e.TEXTURE_2D,1,Me,K.width,K.height):t.texImage2D(e.TEXTURE_2D,0,Me,K.width,K.height,0,j,Te,null));else if(s.isDataTexture)if(Re.length>0){S&&ae&&t.texStorage2D(e.TEXTURE_2D,te,Me,Re[0].width,Re[0].height);for(let Q=0,k=Re.length;Q<k;Q++)se=Re[Q],S?ee&&t.texSubImage2D(e.TEXTURE_2D,Q,0,0,se.width,se.height,j,Te,se.data):t.texImage2D(e.TEXTURE_2D,Q,Me,se.width,se.height,0,j,Te,se.data);s.generateMipmaps=!1}else S?(ae&&t.texStorage2D(e.TEXTURE_2D,te,Me,K.width,K.height),ee&&nt(s,K,j,Te)):t.texImage2D(e.TEXTURE_2D,0,Me,K.width,K.height,0,j,Te,K.data);else if(s.isCompressedTexture)if(s.isCompressedArrayTexture){S&&ae&&t.texStorage3D(e.TEXTURE_2D_ARRAY,te,Me,Re[0].width,Re[0].height,K.depth);for(let Q=0,k=Re.length;Q<k;Q++)if(se=Re[Q],s.format!==yt)if(j!==null)if(S){if(ee)if(s.layerUpdates.size>0){const de=ta(se.width,se.height,s.format,s.type);for(const Ce of s.layerUpdates){const $e=se.data.subarray(Ce*de/se.data.BYTES_PER_ELEMENT,(Ce+1)*de/se.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,Ce,se.width,se.height,1,j,$e)}s.clearLayerUpdates()}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,se.width,se.height,K.depth,j,se.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Q,Me,se.width,se.height,K.depth,0,se.data,0,0);else Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else S?ee&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,se.width,se.height,K.depth,j,Te,se.data):t.texImage3D(e.TEXTURE_2D_ARRAY,Q,Me,se.width,se.height,K.depth,0,j,Te,se.data)}else{S&&ae&&t.texStorage2D(e.TEXTURE_2D,te,Me,Re[0].width,Re[0].height);for(let Q=0,k=Re.length;Q<k;Q++)se=Re[Q],s.format!==yt?j!==null?S?ee&&t.compressedTexSubImage2D(e.TEXTURE_2D,Q,0,0,se.width,se.height,j,se.data):t.compressedTexImage2D(e.TEXTURE_2D,Q,Me,se.width,se.height,0,se.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):S?ee&&t.texSubImage2D(e.TEXTURE_2D,Q,0,0,se.width,se.height,j,Te,se.data):t.texImage2D(e.TEXTURE_2D,Q,Me,se.width,se.height,0,j,Te,se.data)}else if(s.isDataArrayTexture)if(S){if(ae&&t.texStorage3D(e.TEXTURE_2D_ARRAY,te,Me,K.width,K.height,K.depth),ee)if(s.layerUpdates.size>0){const Q=ta(K.width,K.height,s.format,s.type);for(const k of s.layerUpdates){const de=K.data.subarray(k*Q/K.data.BYTES_PER_ELEMENT,(k+1)*Q/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,k,K.width,K.height,1,j,Te,de)}s.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,j,Te,K.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,Me,K.width,K.height,K.depth,0,j,Te,K.data);else if(s.isData3DTexture)S?(ae&&t.texStorage3D(e.TEXTURE_3D,te,Me,K.width,K.height,K.depth),ee&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,j,Te,K.data)):t.texImage3D(e.TEXTURE_3D,0,Me,K.width,K.height,K.depth,0,j,Te,K.data);else if(s.isFramebufferTexture){if(ae)if(S)t.texStorage2D(e.TEXTURE_2D,te,Me,K.width,K.height);else{let Q=K.width,k=K.height;for(let de=0;de<te;de++)t.texImage2D(e.TEXTURE_2D,de,Me,Q,k,0,j,Te,null),Q>>=1,k>>=1}}else if(Re.length>0){if(S&&ae){const Q=we(Re[0]);t.texStorage2D(e.TEXTURE_2D,te,Me,Q.width,Q.height)}for(let Q=0,k=Re.length;Q<k;Q++)se=Re[Q],S?ee&&t.texSubImage2D(e.TEXTURE_2D,Q,0,0,j,Te,se):t.texImage2D(e.TEXTURE_2D,Q,Me,j,Te,se);s.generateMipmaps=!1}else if(S){if(ae){const Q=we(K);t.texStorage2D(e.TEXTURE_2D,te,Me,Q.width,Q.height)}ee&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,j,Te,K)}else t.texImage2D(e.TEXTURE_2D,0,Me,j,Te,K);l(s)&&r(G),xe.__version=O.version,s.onUpdate&&s.onUpdate(s)}p.__version=s.version}function q(p,s,L){if(s.image.length!==6)return;const G=tt(p,s),Y=s.source;t.bindTexture(e.TEXTURE_CUBE_MAP,p.__webglTexture,e.TEXTURE0+L);const O=i.get(Y);if(Y.version!==O.__version||G===!0){t.activeTexture(e.TEXTURE0+L);const xe=lt.getPrimaries(lt.workingColorSpace),ie=s.colorSpace===tn?null:lt.getPrimaries(s.colorSpace),Se=s.colorSpace===tn||xe===ie?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,s.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,s.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,s.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);const me=s.isCompressedTexture||s.image[0].isCompressedTexture,K=s.image[0]&&s.image[0].isDataTexture,j=[];for(let k=0;k<6;k++)!me&&!K?j[k]=U(s.image[k],!0,o.maxCubemapSize):j[k]=K?s.image[k].image:s.image[k],j[k]=ve(s,j[k]);const Te=j[0],Me=a.convert(s.format,s.colorSpace),se=a.convert(s.type),Re=_(s.internalFormat,Me,se,s.colorSpace),S=s.isVideoTexture!==!0,ae=O.__version===void 0||G===!0,ee=Y.dataReady;let te=N(s,Te);Ye(e.TEXTURE_CUBE_MAP,s);let Q;if(me){S&&ae&&t.texStorage2D(e.TEXTURE_CUBE_MAP,te,Re,Te.width,Te.height);for(let k=0;k<6;k++){Q=j[k].mipmaps;for(let de=0;de<Q.length;de++){const Ce=Q[de];s.format!==yt?Me!==null?S?ee&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de,0,0,Ce.width,Ce.height,Me,Ce.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de,Re,Ce.width,Ce.height,0,Ce.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):S?ee&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de,0,0,Ce.width,Ce.height,Me,se,Ce.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de,Re,Ce.width,Ce.height,0,Me,se,Ce.data)}}}else{if(Q=s.mipmaps,S&&ae){Q.length>0&&te++;const k=we(j[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,te,Re,k.width,k.height)}for(let k=0;k<6;k++)if(K){S?ee&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,0,0,j[k].width,j[k].height,Me,se,j[k].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,Re,j[k].width,j[k].height,0,Me,se,j[k].data);for(let de=0;de<Q.length;de++){const $e=Q[de].image[k].image;S?ee&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de+1,0,0,$e.width,$e.height,Me,se,$e.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de+1,Re,$e.width,$e.height,0,Me,se,$e.data)}}else{S?ee&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,0,0,Me,se,j[k]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,Re,Me,se,j[k]);for(let de=0;de<Q.length;de++){const Ce=Q[de];S?ee&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de+1,0,0,Me,se,Ce.image[k]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+k,de+1,Re,Me,se,Ce.image[k])}}}l(s)&&r(e.TEXTURE_CUBE_MAP),O.__version=Y.version,s.onUpdate&&s.onUpdate(s)}p.__version=s.version}function le(p,s,L,G,Y,O){const xe=a.convert(L.format,L.colorSpace),ie=a.convert(L.type),Se=_(L.internalFormat,xe,ie,L.colorSpace),me=i.get(s),K=i.get(L);if(K.__renderTarget=s,!me.__hasExternalTextures){const j=Math.max(1,s.width>>O),Te=Math.max(1,s.height>>O);Y===e.TEXTURE_3D||Y===e.TEXTURE_2D_ARRAY?t.texImage3D(Y,O,Se,j,Te,s.depth,0,xe,ie,null):t.texImage2D(Y,O,Se,j,Te,0,xe,ie,null)}t.bindFramebuffer(e.FRAMEBUFFER,p),he(s)?f.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,G,Y,K.__webglTexture,0,Ze(s)):(Y===e.TEXTURE_2D||Y>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,G,Y,K.__webglTexture,O),t.bindFramebuffer(e.FRAMEBUFFER,null)}function Pe(p,s,L){if(e.bindRenderbuffer(e.RENDERBUFFER,p),s.depthBuffer){const G=s.depthTexture,Y=G&&G.isDepthTexture?G.type:null,O=P(s.stencilBuffer,Y),xe=s.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ie=Ze(s);he(s)?f.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ie,O,s.width,s.height):L?e.renderbufferStorageMultisample(e.RENDERBUFFER,ie,O,s.width,s.height):e.renderbufferStorage(e.RENDERBUFFER,O,s.width,s.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,xe,e.RENDERBUFFER,p)}else{const G=s.textures;for(let Y=0;Y<G.length;Y++){const O=G[Y],xe=a.convert(O.format,O.colorSpace),ie=a.convert(O.type),Se=_(O.internalFormat,xe,ie,O.colorSpace),me=Ze(s);L&&he(s)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,me,Se,s.width,s.height):he(s)?f.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,me,Se,s.width,s.height):e.renderbufferStorage(e.RENDERBUFFER,Se,s.width,s.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function _e(p,s){if(s&&s.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(e.FRAMEBUFFER,p),!(s.depthTexture&&s.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const G=i.get(s.depthTexture);G.__renderTarget=s,(!G.__webglTexture||s.depthTexture.image.width!==s.width||s.depthTexture.image.height!==s.height)&&(s.depthTexture.image.width=s.width,s.depthTexture.image.height=s.height,s.depthTexture.needsUpdate=!0),Z(s.depthTexture,0);const Y=G.__webglTexture,O=Ze(s);if(s.depthTexture.format===ui)he(s)?f.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,Y,0,O):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,Y,0);else if(s.depthTexture.format===Dn)he(s)?f.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,Y,0,O):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,Y,0);else throw new Error("Unknown depthTexture format")}function Ie(p){const s=i.get(p),L=p.isWebGLCubeRenderTarget===!0;if(s.__boundDepthTexture!==p.depthTexture){const G=p.depthTexture;if(s.__depthDisposeCallback&&s.__depthDisposeCallback(),G){const Y=()=>{delete s.__boundDepthTexture,delete s.__depthDisposeCallback,G.removeEventListener("dispose",Y)};G.addEventListener("dispose",Y),s.__depthDisposeCallback=Y}s.__boundDepthTexture=G}if(p.depthTexture&&!s.__autoAllocateDepthBuffer){if(L)throw new Error("target.depthTexture not supported in Cube render targets");const G=p.texture.mipmaps;G&&G.length>0?_e(s.__webglFramebuffer[0],p):_e(s.__webglFramebuffer,p)}else if(L){s.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer[G]),s.__webglDepthbuffer[G]===void 0)s.__webglDepthbuffer[G]=e.createRenderbuffer(),Pe(s.__webglDepthbuffer[G],p,!1);else{const Y=p.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,O=s.__webglDepthbuffer[G];e.bindRenderbuffer(e.RENDERBUFFER,O),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,O)}}else{const G=p.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),s.__webglDepthbuffer===void 0)s.__webglDepthbuffer=e.createRenderbuffer(),Pe(s.__webglDepthbuffer,p,!1);else{const Y=p.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,O=s.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,O),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,O)}}t.bindFramebuffer(e.FRAMEBUFFER,null)}function ut(p,s,L){const G=i.get(p);s!==void 0&&le(G.__webglFramebuffer,p,p.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),L!==void 0&&Ie(p)}function ye(p){const s=p.texture,L=i.get(p),G=i.get(s);p.addEventListener("dispose",F);const Y=p.textures,O=p.isWebGLCubeRenderTarget===!0,xe=Y.length>1;if(xe||(G.__webglTexture===void 0&&(G.__webglTexture=e.createTexture()),G.__version=s.version,d.memory.textures++),O){L.__webglFramebuffer=[];for(let ie=0;ie<6;ie++)if(s.mipmaps&&s.mipmaps.length>0){L.__webglFramebuffer[ie]=[];for(let Se=0;Se<s.mipmaps.length;Se++)L.__webglFramebuffer[ie][Se]=e.createFramebuffer()}else L.__webglFramebuffer[ie]=e.createFramebuffer()}else{if(s.mipmaps&&s.mipmaps.length>0){L.__webglFramebuffer=[];for(let ie=0;ie<s.mipmaps.length;ie++)L.__webglFramebuffer[ie]=e.createFramebuffer()}else L.__webglFramebuffer=e.createFramebuffer();if(xe)for(let ie=0,Se=Y.length;ie<Se;ie++){const me=i.get(Y[ie]);me.__webglTexture===void 0&&(me.__webglTexture=e.createTexture(),d.memory.textures++)}if(p.samples>0&&he(p)===!1){L.__webglMultisampledFramebuffer=e.createFramebuffer(),L.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,L.__webglMultisampledFramebuffer);for(let ie=0;ie<Y.length;ie++){const Se=Y[ie];L.__webglColorRenderbuffer[ie]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,L.__webglColorRenderbuffer[ie]);const me=a.convert(Se.format,Se.colorSpace),K=a.convert(Se.type),j=_(Se.internalFormat,me,K,Se.colorSpace,p.isXRRenderTarget===!0),Te=Ze(p);e.renderbufferStorageMultisample(e.RENDERBUFFER,Te,j,p.width,p.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ie,e.RENDERBUFFER,L.__webglColorRenderbuffer[ie])}e.bindRenderbuffer(e.RENDERBUFFER,null),p.depthBuffer&&(L.__webglDepthRenderbuffer=e.createRenderbuffer(),Pe(L.__webglDepthRenderbuffer,p,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(O){t.bindTexture(e.TEXTURE_CUBE_MAP,G.__webglTexture),Ye(e.TEXTURE_CUBE_MAP,s);for(let ie=0;ie<6;ie++)if(s.mipmaps&&s.mipmaps.length>0)for(let Se=0;Se<s.mipmaps.length;Se++)le(L.__webglFramebuffer[ie][Se],p,s,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Se);else le(L.__webglFramebuffer[ie],p,s,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0);l(s)&&r(e.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(xe){for(let ie=0,Se=Y.length;ie<Se;ie++){const me=Y[ie],K=i.get(me);let j=e.TEXTURE_2D;(p.isWebGL3DRenderTarget||p.isWebGLArrayRenderTarget)&&(j=p.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(j,K.__webglTexture),Ye(j,me),le(L.__webglFramebuffer,p,me,e.COLOR_ATTACHMENT0+ie,j,0),l(me)&&r(j)}t.unbindTexture()}else{let ie=e.TEXTURE_2D;if((p.isWebGL3DRenderTarget||p.isWebGLArrayRenderTarget)&&(ie=p.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(ie,G.__webglTexture),Ye(ie,s),s.mipmaps&&s.mipmaps.length>0)for(let Se=0;Se<s.mipmaps.length;Se++)le(L.__webglFramebuffer[Se],p,s,e.COLOR_ATTACHMENT0,ie,Se);else le(L.__webglFramebuffer,p,s,e.COLOR_ATTACHMENT0,ie,0);l(s)&&r(ie),t.unbindTexture()}p.depthBuffer&&Ie(p)}function et(p){const s=p.textures;for(let L=0,G=s.length;L<G;L++){const Y=s[L];if(l(Y)){const O=T(p),xe=i.get(Y).__webglTexture;t.bindTexture(O,xe),r(O),t.unbindTexture()}}}const g=[],Ne=[];function Fe(p){if(p.samples>0){if(he(p)===!1){const s=p.textures,L=p.width,G=p.height;let Y=e.COLOR_BUFFER_BIT;const O=p.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,xe=i.get(p),ie=s.length>1;if(ie)for(let me=0;me<s.length;me++)t.bindFramebuffer(e.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,xe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);const Se=p.texture.mipmaps;Se&&Se.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let me=0;me<s.length;me++){if(p.resolveDepthBuffer&&(p.depthBuffer&&(Y|=e.DEPTH_BUFFER_BIT),p.stencilBuffer&&p.resolveStencilBuffer&&(Y|=e.STENCIL_BUFFER_BIT)),ie){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,xe.__webglColorRenderbuffer[me]);const K=i.get(s[me]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,K,0)}e.blitFramebuffer(0,0,L,G,0,0,L,G,Y,e.NEAREST),b===!0&&(g.length=0,Ne.length=0,g.push(e.COLOR_ATTACHMENT0+me),p.depthBuffer&&p.resolveDepthBuffer===!1&&(g.push(O),Ne.push(O),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ne)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,g))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),ie)for(let me=0;me<s.length;me++){t.bindFramebuffer(e.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.RENDERBUFFER,xe.__webglColorRenderbuffer[me]);const K=i.get(s[me]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,xe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.TEXTURE_2D,K,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(p.depthBuffer&&p.resolveDepthBuffer===!1&&b){const s=p.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[s])}}}function Ze(p){return Math.min(o.maxSamples,p.samples)}function he(p){const s=i.get(p);return p.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&s.__useRenderToTexture!==!1}function it(p){const s=d.render.frame;R.get(p)!==s&&(R.set(p,s),p.update())}function ve(p,s){const L=p.colorSpace,G=p.format,Y=p.type;return p.isCompressedTexture===!0||p.isVideoTexture===!0||L!==Nn&&L!==tn&&(lt.getTransfer(L)===Qe?(G!==yt||Y!==Qt)&&Je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):vt("WebGLTextures: Unsupported texture color space:",L)),s}function we(p){return typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement?(v.width=p.naturalWidth||p.width,v.height=p.naturalHeight||p.height):typeof VideoFrame<"u"&&p instanceof VideoFrame?(v.width=p.displayWidth,v.height=p.displayHeight):(v.width=p.width,v.height=p.height),v}this.allocateTextureUnit=z,this.resetTextureUnits=B,this.setTexture2D=Z,this.setTexture2DArray=X,this.setTexture3D=re,this.setTextureCube=V,this.rebindTextures=ut,this.setupRenderTarget=ye,this.updateRenderTargetMipmap=et,this.updateMultisampleRenderTarget=Fe,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=le,this.useMultisampledRTT=he}function vd(e,n){function t(i,o=tn){let a;const d=lt.getTransfer(o);if(i===Qt)return e.UNSIGNED_BYTE;if(i===Ga)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Va)return e.UNSIGNED_SHORT_5_5_5_1;if(i===Kr)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===Zr)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===$r)return e.BYTE;if(i===Qr)return e.SHORT;if(i===In)return e.UNSIGNED_SHORT;if(i===za)return e.INT;if(i===gn)return e.UNSIGNED_INT;if(i===$t)return e.FLOAT;if(i===Sn)return e.HALF_FLOAT;if(i===Jr)return e.ALPHA;if(i===jr)return e.RGB;if(i===yt)return e.RGBA;if(i===ui)return e.DEPTH_COMPONENT;if(i===Dn)return e.DEPTH_STENCIL;if(i===eo)return e.RED;if(i===Ba)return e.RED_INTEGER;if(i===ya)return e.RG;if(i===Oa)return e.RG_INTEGER;if(i===Fa)return e.RGBA_INTEGER;if(i===Wn||i===Xn||i===Yn||i===qn)if(d===Qe)if(a=n.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Wn)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Xn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Yn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===qn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=n.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Wn)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Xn)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Yn)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===qn)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Mi||i===bi||i===Ti||i===Ai)if(a=n.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Mi)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===bi)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ti)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ai)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ri||i===Ci||i===wi)if(a=n.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Ri||i===Ci)return d===Qe?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===wi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Pi||i===Li||i===Ui||i===Di||i===yi||i===Ii||i===Ni||i===Fi||i===Oi||i===Bi||i===Gi||i===Vi||i===Hi||i===ki)if(a=n.get("WEBGL_compressed_texture_astc"),a!==null){if(i===Pi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Li)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ui)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Di)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===yi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ii)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ni)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Fi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Oi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Bi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Gi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Vi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Hi)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ki)return d===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===zi||i===Wi||i===Xi)if(a=n.get("EXT_texture_compression_bptc"),a!==null){if(i===zi)return d===Qe?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Wi)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Xi)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Yi||i===qi||i===Ki||i===Zi)if(a=n.get("EXT_texture_compression_rgtc"),a!==null){if(i===Yi)return a.COMPRESSED_RED_RGTC1_EXT;if(i===qi)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ki)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Zi)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===_n?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:t}}const Sd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ed=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Md{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,t){if(this.texture===null){const i=new Ha(n.texture);(n.depthNear!==t.depthNear||n.depthFar!==t.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=i}}getMesh(n){if(this.texture!==null&&this.mesh===null){const t=n.cameras[0].viewport,i=new zt({vertexShader:Sd,fragmentShader:Ed,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new It(new ka(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class bd extends pr{constructor(n,t){super();const i=this;let o=null,a=1,d=null,f="local-floor",b=1,v=null,R=null,m=null,x=null,M=null,D=null;const U=typeof XRWebGLBinding<"u",l=new Md,r={},T=t.getContextAttributes();let _=null,P=null;const N=[],E=[],F=new ht;let $=null;const h=new hn;h.viewport=new gt;const u=new hn;u.viewport=new gt;const w=[h,u],B=new hr;let z=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(H){let q=N[H];return q===void 0&&(q=new kn,N[H]=q),q.getTargetRaySpace()},this.getControllerGrip=function(H){let q=N[H];return q===void 0&&(q=new kn,N[H]=q),q.getGripSpace()},this.getHand=function(H){let q=N[H];return q===void 0&&(q=new kn,N[H]=q),q.getHandSpace()};function Z(H){const q=E.indexOf(H.inputSource);if(q===-1)return;const le=N[q];le!==void 0&&(le.update(H.inputSource,H.frame,v||d),le.dispatchEvent({type:H.type,data:H.inputSource}))}function X(){o.removeEventListener("select",Z),o.removeEventListener("selectstart",Z),o.removeEventListener("selectend",Z),o.removeEventListener("squeeze",Z),o.removeEventListener("squeezestart",Z),o.removeEventListener("squeezeend",Z),o.removeEventListener("end",X),o.removeEventListener("inputsourceschange",re);for(let H=0;H<N.length;H++){const q=E[H];q!==null&&(E[H]=null,N[H].disconnect(q))}z=null,W=null,l.reset();for(const H in r)delete r[H];n.setRenderTarget(_),M=null,x=null,m=null,o=null,P=null,nt.stop(),i.isPresenting=!1,n.setPixelRatio($),n.setSize(F.width,F.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(H){a=H,i.isPresenting===!0&&Je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(H){f=H,i.isPresenting===!0&&Je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return v||d},this.setReferenceSpace=function(H){v=H},this.getBaseLayer=function(){return x!==null?x:M},this.getBinding=function(){return m===null&&U&&(m=new XRWebGLBinding(o,t)),m},this.getFrame=function(){return D},this.getSession=function(){return o},this.setSession=async function(H){if(o=H,o!==null){if(_=n.getRenderTarget(),o.addEventListener("select",Z),o.addEventListener("selectstart",Z),o.addEventListener("selectend",Z),o.addEventListener("squeeze",Z),o.addEventListener("squeezestart",Z),o.addEventListener("squeezeend",Z),o.addEventListener("end",X),o.addEventListener("inputsourceschange",re),T.xrCompatible!==!0&&await t.makeXRCompatible(),$=n.getPixelRatio(),n.getSize(F),U&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,Pe=null,_e=null;T.depth&&(_e=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=T.stencil?Dn:ui,Pe=T.stencil?_n:gn);const Ie={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:a};m=this.getBinding(),x=m.createProjectionLayer(Ie),o.updateRenderState({layers:[x]}),n.setPixelRatio(1),n.setSize(x.textureWidth,x.textureHeight,!1),P=new an(x.textureWidth,x.textureHeight,{format:yt,type:Qt,depthTexture:new Da(x.textureWidth,x.textureHeight,Pe,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:T.stencil,colorSpace:n.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:x.ignoreDepthValues===!1,resolveStencilBuffer:x.ignoreDepthValues===!1})}else{const le={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:a};M=new XRWebGLLayer(o,t,le),o.updateRenderState({baseLayer:M}),n.setPixelRatio(1),n.setSize(M.framebufferWidth,M.framebufferHeight,!1),P=new an(M.framebufferWidth,M.framebufferHeight,{format:yt,type:Qt,colorSpace:n.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:M.ignoreDepthValues===!1,resolveStencilBuffer:M.ignoreDepthValues===!1})}P.isXRRenderTarget=!0,this.setFoveation(b),v=null,d=await o.requestReferenceSpace(f),nt.setContext(o),nt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return l.getDepthTexture()};function re(H){for(let q=0;q<H.removed.length;q++){const le=H.removed[q],Pe=E.indexOf(le);Pe>=0&&(E[Pe]=null,N[Pe].disconnect(le))}for(let q=0;q<H.added.length;q++){const le=H.added[q];let Pe=E.indexOf(le);if(Pe===-1){for(let Ie=0;Ie<N.length;Ie++)if(Ie>=E.length){E.push(le),Pe=Ie;break}else if(E[Ie]===null){E[Ie]=le,Pe=Ie;break}if(Pe===-1)break}const _e=N[Pe];_e&&_e.connect(le)}}const V=new ze,fe=new ze;function pe(H,q,le){V.setFromMatrixPosition(q.matrixWorld),fe.setFromMatrixPosition(le.matrixWorld);const Pe=V.distanceTo(fe),_e=q.projectionMatrix.elements,Ie=le.projectionMatrix.elements,ut=_e[14]/(_e[10]-1),ye=_e[14]/(_e[10]+1),et=(_e[9]+1)/_e[5],g=(_e[9]-1)/_e[5],Ne=(_e[8]-1)/_e[0],Fe=(Ie[8]+1)/Ie[0],Ze=ut*Ne,he=ut*Fe,it=Pe/(-Ne+Fe),ve=it*-Ne;if(q.matrixWorld.decompose(H.position,H.quaternion,H.scale),H.translateX(ve),H.translateZ(it),H.matrixWorld.compose(H.position,H.quaternion,H.scale),H.matrixWorldInverse.copy(H.matrixWorld).invert(),_e[10]===-1)H.projectionMatrix.copy(q.projectionMatrix),H.projectionMatrixInverse.copy(q.projectionMatrixInverse);else{const we=ut+it,p=ye+it,s=Ze-ve,L=he+(Pe-ve),G=et*ye/p*we,Y=g*ye/p*we;H.projectionMatrix.makePerspective(s,L,G,Y,we,p),H.projectionMatrixInverse.copy(H.projectionMatrix).invert()}}function De(H,q){q===null?H.matrixWorld.copy(H.matrix):H.matrixWorld.multiplyMatrices(q.matrixWorld,H.matrix),H.matrixWorldInverse.copy(H.matrixWorld).invert()}this.updateCamera=function(H){if(o===null)return;let q=H.near,le=H.far;l.texture!==null&&(l.depthNear>0&&(q=l.depthNear),l.depthFar>0&&(le=l.depthFar)),B.near=u.near=h.near=q,B.far=u.far=h.far=le,(z!==B.near||W!==B.far)&&(o.updateRenderState({depthNear:B.near,depthFar:B.far}),z=B.near,W=B.far),B.layers.mask=H.layers.mask|6,h.layers.mask=B.layers.mask&3,u.layers.mask=B.layers.mask&5;const Pe=H.parent,_e=B.cameras;De(B,Pe);for(let Ie=0;Ie<_e.length;Ie++)De(_e[Ie],Pe);_e.length===2?pe(B,h,u):B.projectionMatrix.copy(h.projectionMatrix),Ye(H,B,Pe)};function Ye(H,q,le){le===null?H.matrix.copy(q.matrixWorld):(H.matrix.copy(le.matrixWorld),H.matrix.invert(),H.matrix.multiply(q.matrixWorld)),H.matrix.decompose(H.position,H.quaternion,H.scale),H.updateMatrixWorld(!0),H.projectionMatrix.copy(q.projectionMatrix),H.projectionMatrixInverse.copy(q.projectionMatrixInverse),H.isPerspectiveCamera&&(H.fov=mr*2*Math.atan(1/H.projectionMatrix.elements[5]),H.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(x===null&&M===null))return b},this.setFoveation=function(H){b=H,x!==null&&(x.fixedFoveation=H),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=H)},this.hasDepthSensing=function(){return l.texture!==null},this.getDepthSensingMesh=function(){return l.getMesh(B)},this.getCameraTexture=function(H){return r[H]};let tt=null;function je(H,q){if(R=q.getViewerPose(v||d),D=q,R!==null){const le=R.views;M!==null&&(n.setRenderTargetFramebuffer(P,M.framebuffer),n.setRenderTarget(P));let Pe=!1;le.length!==B.cameras.length&&(B.cameras.length=0,Pe=!0);for(let ye=0;ye<le.length;ye++){const et=le[ye];let g=null;if(M!==null)g=M.getViewport(et);else{const Fe=m.getViewSubImage(x,et);g=Fe.viewport,ye===0&&(n.setRenderTargetTextures(P,Fe.colorTexture,Fe.depthStencilTexture),n.setRenderTarget(P))}let Ne=w[ye];Ne===void 0&&(Ne=new hn,Ne.layers.enable(ye),Ne.viewport=new gt,w[ye]=Ne),Ne.matrix.fromArray(et.transform.matrix),Ne.matrix.decompose(Ne.position,Ne.quaternion,Ne.scale),Ne.projectionMatrix.fromArray(et.projectionMatrix),Ne.projectionMatrixInverse.copy(Ne.projectionMatrix).invert(),Ne.viewport.set(g.x,g.y,g.width,g.height),ye===0&&(B.matrix.copy(Ne.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Pe===!0&&B.cameras.push(Ne)}const _e=o.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&o.depthUsage=="gpu-optimized"&&U){m=i.getBinding();const ye=m.getDepthInformation(le[0]);ye&&ye.isValid&&ye.texture&&l.init(ye,o.renderState)}if(_e&&_e.includes("camera-access")&&U){n.state.unbindTexture(),m=i.getBinding();for(let ye=0;ye<le.length;ye++){const et=le[ye].camera;if(et){let g=r[et];g||(g=new Ha,r[et]=g);const Ne=m.getCameraImage(et);g.sourceTexture=Ne}}}}for(let le=0;le<N.length;le++){const Pe=E[le],_e=N[le];Pe!==null&&_e!==void 0&&_e.update(Pe,q,v||d)}tt&&tt(H,q),q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:q}),D=null}const nt=new Qa;nt.setAnimationLoop(je),this.setAnimationLoop=function(H){tt=H},this.dispose=function(){}}}const qt=new Ya,Td=new nn;function Ad(e,n){function t(l,r){l.matrixAutoUpdate===!0&&l.updateMatrix(),r.value.copy(l.matrix)}function i(l,r){r.color.getRGB(l.fogColor.value,Xa(e)),r.isFog?(l.fogNear.value=r.near,l.fogFar.value=r.far):r.isFogExp2&&(l.fogDensity.value=r.density)}function o(l,r,T,_,P){r.isMeshBasicMaterial||r.isMeshLambertMaterial?a(l,r):r.isMeshToonMaterial?(a(l,r),m(l,r)):r.isMeshPhongMaterial?(a(l,r),R(l,r)):r.isMeshStandardMaterial?(a(l,r),x(l,r),r.isMeshPhysicalMaterial&&M(l,r,P)):r.isMeshMatcapMaterial?(a(l,r),D(l,r)):r.isMeshDepthMaterial?a(l,r):r.isMeshDistanceMaterial?(a(l,r),U(l,r)):r.isMeshNormalMaterial?a(l,r):r.isLineBasicMaterial?(d(l,r),r.isLineDashedMaterial&&f(l,r)):r.isPointsMaterial?b(l,r,T,_):r.isSpriteMaterial?v(l,r):r.isShadowMaterial?(l.color.value.copy(r.color),l.opacity.value=r.opacity):r.isShaderMaterial&&(r.uniformsNeedUpdate=!1)}function a(l,r){l.opacity.value=r.opacity,r.color&&l.diffuse.value.copy(r.color),r.emissive&&l.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(l.map.value=r.map,t(r.map,l.mapTransform)),r.alphaMap&&(l.alphaMap.value=r.alphaMap,t(r.alphaMap,l.alphaMapTransform)),r.bumpMap&&(l.bumpMap.value=r.bumpMap,t(r.bumpMap,l.bumpMapTransform),l.bumpScale.value=r.bumpScale,r.side===bt&&(l.bumpScale.value*=-1)),r.normalMap&&(l.normalMap.value=r.normalMap,t(r.normalMap,l.normalMapTransform),l.normalScale.value.copy(r.normalScale),r.side===bt&&l.normalScale.value.negate()),r.displacementMap&&(l.displacementMap.value=r.displacementMap,t(r.displacementMap,l.displacementMapTransform),l.displacementScale.value=r.displacementScale,l.displacementBias.value=r.displacementBias),r.emissiveMap&&(l.emissiveMap.value=r.emissiveMap,t(r.emissiveMap,l.emissiveMapTransform)),r.specularMap&&(l.specularMap.value=r.specularMap,t(r.specularMap,l.specularMapTransform)),r.alphaTest>0&&(l.alphaTest.value=r.alphaTest);const T=n.get(r),_=T.envMap,P=T.envMapRotation;_&&(l.envMap.value=_,qt.copy(P),qt.x*=-1,qt.y*=-1,qt.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(qt.y*=-1,qt.z*=-1),l.envMapRotation.value.setFromMatrix4(Td.makeRotationFromEuler(qt)),l.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,l.reflectivity.value=r.reflectivity,l.ior.value=r.ior,l.refractionRatio.value=r.refractionRatio),r.lightMap&&(l.lightMap.value=r.lightMap,l.lightMapIntensity.value=r.lightMapIntensity,t(r.lightMap,l.lightMapTransform)),r.aoMap&&(l.aoMap.value=r.aoMap,l.aoMapIntensity.value=r.aoMapIntensity,t(r.aoMap,l.aoMapTransform))}function d(l,r){l.diffuse.value.copy(r.color),l.opacity.value=r.opacity,r.map&&(l.map.value=r.map,t(r.map,l.mapTransform))}function f(l,r){l.dashSize.value=r.dashSize,l.totalSize.value=r.dashSize+r.gapSize,l.scale.value=r.scale}function b(l,r,T,_){l.diffuse.value.copy(r.color),l.opacity.value=r.opacity,l.size.value=r.size*T,l.scale.value=_*.5,r.map&&(l.map.value=r.map,t(r.map,l.uvTransform)),r.alphaMap&&(l.alphaMap.value=r.alphaMap,t(r.alphaMap,l.alphaMapTransform)),r.alphaTest>0&&(l.alphaTest.value=r.alphaTest)}function v(l,r){l.diffuse.value.copy(r.color),l.opacity.value=r.opacity,l.rotation.value=r.rotation,r.map&&(l.map.value=r.map,t(r.map,l.mapTransform)),r.alphaMap&&(l.alphaMap.value=r.alphaMap,t(r.alphaMap,l.alphaMapTransform)),r.alphaTest>0&&(l.alphaTest.value=r.alphaTest)}function R(l,r){l.specular.value.copy(r.specular),l.shininess.value=Math.max(r.shininess,1e-4)}function m(l,r){r.gradientMap&&(l.gradientMap.value=r.gradientMap)}function x(l,r){l.metalness.value=r.metalness,r.metalnessMap&&(l.metalnessMap.value=r.metalnessMap,t(r.metalnessMap,l.metalnessMapTransform)),l.roughness.value=r.roughness,r.roughnessMap&&(l.roughnessMap.value=r.roughnessMap,t(r.roughnessMap,l.roughnessMapTransform)),r.envMap&&(l.envMapIntensity.value=r.envMapIntensity)}function M(l,r,T){l.ior.value=r.ior,r.sheen>0&&(l.sheenColor.value.copy(r.sheenColor).multiplyScalar(r.sheen),l.sheenRoughness.value=r.sheenRoughness,r.sheenColorMap&&(l.sheenColorMap.value=r.sheenColorMap,t(r.sheenColorMap,l.sheenColorMapTransform)),r.sheenRoughnessMap&&(l.sheenRoughnessMap.value=r.sheenRoughnessMap,t(r.sheenRoughnessMap,l.sheenRoughnessMapTransform))),r.clearcoat>0&&(l.clearcoat.value=r.clearcoat,l.clearcoatRoughness.value=r.clearcoatRoughness,r.clearcoatMap&&(l.clearcoatMap.value=r.clearcoatMap,t(r.clearcoatMap,l.clearcoatMapTransform)),r.clearcoatRoughnessMap&&(l.clearcoatRoughnessMap.value=r.clearcoatRoughnessMap,t(r.clearcoatRoughnessMap,l.clearcoatRoughnessMapTransform)),r.clearcoatNormalMap&&(l.clearcoatNormalMap.value=r.clearcoatNormalMap,t(r.clearcoatNormalMap,l.clearcoatNormalMapTransform),l.clearcoatNormalScale.value.copy(r.clearcoatNormalScale),r.side===bt&&l.clearcoatNormalScale.value.negate())),r.dispersion>0&&(l.dispersion.value=r.dispersion),r.iridescence>0&&(l.iridescence.value=r.iridescence,l.iridescenceIOR.value=r.iridescenceIOR,l.iridescenceThicknessMinimum.value=r.iridescenceThicknessRange[0],l.iridescenceThicknessMaximum.value=r.iridescenceThicknessRange[1],r.iridescenceMap&&(l.iridescenceMap.value=r.iridescenceMap,t(r.iridescenceMap,l.iridescenceMapTransform)),r.iridescenceThicknessMap&&(l.iridescenceThicknessMap.value=r.iridescenceThicknessMap,t(r.iridescenceThicknessMap,l.iridescenceThicknessMapTransform))),r.transmission>0&&(l.transmission.value=r.transmission,l.transmissionSamplerMap.value=T.texture,l.transmissionSamplerSize.value.set(T.width,T.height),r.transmissionMap&&(l.transmissionMap.value=r.transmissionMap,t(r.transmissionMap,l.transmissionMapTransform)),l.thickness.value=r.thickness,r.thicknessMap&&(l.thicknessMap.value=r.thicknessMap,t(r.thicknessMap,l.thicknessMapTransform)),l.attenuationDistance.value=r.attenuationDistance,l.attenuationColor.value.copy(r.attenuationColor)),r.anisotropy>0&&(l.anisotropyVector.value.set(r.anisotropy*Math.cos(r.anisotropyRotation),r.anisotropy*Math.sin(r.anisotropyRotation)),r.anisotropyMap&&(l.anisotropyMap.value=r.anisotropyMap,t(r.anisotropyMap,l.anisotropyMapTransform))),l.specularIntensity.value=r.specularIntensity,l.specularColor.value.copy(r.specularColor),r.specularColorMap&&(l.specularColorMap.value=r.specularColorMap,t(r.specularColorMap,l.specularColorMapTransform)),r.specularIntensityMap&&(l.specularIntensityMap.value=r.specularIntensityMap,t(r.specularIntensityMap,l.specularIntensityMapTransform))}function D(l,r){r.matcap&&(l.matcap.value=r.matcap)}function U(l,r){const T=n.get(r).light;l.referencePosition.value.setFromMatrixPosition(T.matrixWorld),l.nearDistance.value=T.shadow.camera.near,l.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:o}}function Rd(e,n,t,i){let o={},a={},d=[];const f=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function b(T,_){const P=_.program;i.uniformBlockBinding(T,P)}function v(T,_){let P=o[T.id];P===void 0&&(D(T),P=R(T),o[T.id]=P,T.addEventListener("dispose",l));const N=_.program;i.updateUBOMapping(T,N);const E=n.render.frame;a[T.id]!==E&&(x(T),a[T.id]=E)}function R(T){const _=m();T.__bindingPointIndex=_;const P=e.createBuffer(),N=T.__size,E=T.usage;return e.bindBuffer(e.UNIFORM_BUFFER,P),e.bufferData(e.UNIFORM_BUFFER,N,E),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,_,P),P}function m(){for(let T=0;T<f;T++)if(d.indexOf(T)===-1)return d.push(T),T;return vt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function x(T){const _=o[T.id],P=T.uniforms,N=T.__cache;e.bindBuffer(e.UNIFORM_BUFFER,_);for(let E=0,F=P.length;E<F;E++){const $=Array.isArray(P[E])?P[E]:[P[E]];for(let h=0,u=$.length;h<u;h++){const w=$[h];if(M(w,E,h,N)===!0){const B=w.__offset,z=Array.isArray(w.value)?w.value:[w.value];let W=0;for(let Z=0;Z<z.length;Z++){const X=z[Z],re=U(X);typeof X=="number"||typeof X=="boolean"?(w.__data[0]=X,e.bufferSubData(e.UNIFORM_BUFFER,B+W,w.__data)):X.isMatrix3?(w.__data[0]=X.elements[0],w.__data[1]=X.elements[1],w.__data[2]=X.elements[2],w.__data[3]=0,w.__data[4]=X.elements[3],w.__data[5]=X.elements[4],w.__data[6]=X.elements[5],w.__data[7]=0,w.__data[8]=X.elements[6],w.__data[9]=X.elements[7],w.__data[10]=X.elements[8],w.__data[11]=0):(X.toArray(w.__data,W),W+=re.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,B,w.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function M(T,_,P,N){const E=T.value,F=_+"_"+P;if(N[F]===void 0)return typeof E=="number"||typeof E=="boolean"?N[F]=E:N[F]=E.clone(),!0;{const $=N[F];if(typeof E=="number"||typeof E=="boolean"){if($!==E)return N[F]=E,!0}else if($.equals(E)===!1)return $.copy(E),!0}return!1}function D(T){const _=T.uniforms;let P=0;const N=16;for(let F=0,$=_.length;F<$;F++){const h=Array.isArray(_[F])?_[F]:[_[F]];for(let u=0,w=h.length;u<w;u++){const B=h[u],z=Array.isArray(B.value)?B.value:[B.value];for(let W=0,Z=z.length;W<Z;W++){const X=z[W],re=U(X),V=P%N,fe=V%re.boundary,pe=V+fe;P+=fe,pe!==0&&N-pe<re.storage&&(P+=N-pe),B.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=P,P+=re.storage}}}const E=P%N;return E>0&&(P+=N-E),T.__size=P,T.__cache={},this}function U(T){const _={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(_.boundary=4,_.storage=4):T.isVector2?(_.boundary=8,_.storage=8):T.isVector3||T.isColor?(_.boundary=16,_.storage=12):T.isVector4?(_.boundary=16,_.storage=16):T.isMatrix3?(_.boundary=48,_.storage=48):T.isMatrix4?(_.boundary=64,_.storage=64):T.isTexture?Je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Je("WebGLRenderer: Unsupported uniform value type.",T),_}function l(T){const _=T.target;_.removeEventListener("dispose",l);const P=d.indexOf(_.__bindingPointIndex);d.splice(P,1),e.deleteBuffer(o[_.id]),delete o[_.id],delete a[_.id]}function r(){for(const T in o)e.deleteBuffer(o[T]);d=[],o={},a={}}return{bind:b,update:v,dispose:r}}const Cd=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]);let Pt=null;function wd(){return Pt===null&&(Pt=new xr(Cd,32,32,ya,Sn),Pt.minFilter=Gt,Pt.magFilter=Gt,Pt.wrapS=ti,Pt.wrapT=ti,Pt.generateMipmaps=!1,Pt.needsUpdate=!0),Pt}class Pd{constructor(n={}){const{canvas:t=lr(),context:i=null,depth:o=!0,stencil:a=!1,alpha:d=!1,antialias:f=!1,premultipliedAlpha:b=!0,preserveDrawingBuffer:v=!1,powerPreference:R="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:x=!1}=n;this.isWebGLRenderer=!0;let M;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=i.getContextAttributes().alpha}else M=d;const D=new Set([Fa,Oa,Ba]),U=new Set([Qt,gn,In,_n,Ga,Va]),l=new Uint32Array(4),r=new Int32Array(4);let T=null,_=null;const P=[],N=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ht,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const E=this;let F=!1;this._outputColorSpace=fr;let $=0,h=0,u=null,w=-1,B=null;const z=new gt,W=new gt;let Z=null;const X=new Ke(0);let re=0,V=t.width,fe=t.height,pe=1,De=null,Ye=null;const tt=new gt(0,0,V,fe),je=new gt(0,0,V,fe);let nt=!1;const H=new Ua;let q=!1,le=!1;const Pe=new nn,_e=new ze,Ie=new gt,ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ye=!1;function et(){return u===null?pe:1}let g=i;function Ne(c,A){return t.getContext(c,A)}try{const c={alpha:!0,depth:o,stencil:a,antialias:f,premultipliedAlpha:b,preserveDrawingBuffer:v,powerPreference:R,failIfMajorPerformanceCaveat:m};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${dr}`),t.addEventListener("webglcontextlost",Q,!1),t.addEventListener("webglcontextrestored",k,!1),t.addEventListener("webglcontextcreationerror",de,!1),g===null){const A="webgl2";if(g=Ne(A,c),g===null)throw Ne(A)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(c){throw c("WebGLRenderer: "+c.message),c}let Fe,Ze,he,it,ve,we,p,s,L,G,Y,O,xe,ie,Se,me,K,j,Te,Me,se,Re,S,ae;function ee(){Fe=new Fl(g),Fe.init(),Re=new vd(g,Fe),Ze=new Cl(g,Fe,n,Re),he=new _d(g,Fe),Ze.reversedDepthBuffer&&x&&he.buffers.depth.setReversed(!0),it=new Gl(g),ve=new ad,we=new gd(g,Fe,he,ve,Ze,Re,it),p=new Pl(E),s=new Nl(E),L=new zo(g),S=new Al(g,L),G=new Ol(g,L,it,S),Y=new Hl(g,G,L,it),Te=new Vl(g,Ze,we),me=new wl(ve),O=new id(E,p,s,Fe,Ze,S,me),xe=new Ad(E,ve),ie=new od,Se=new ud(Fe),j=new Tl(E,p,s,he,Y,M,b),K=new md(E,Y,Ze),ae=new Rd(g,it,Ze,he),Me=new Rl(g,Fe,it),se=new Bl(g,Fe,it),it.programs=O.programs,E.capabilities=Ze,E.extensions=Fe,E.properties=ve,E.renderLists=ie,E.shadowMap=K,E.state=he,E.info=it}ee();const te=new bd(E,g);this.xr=te,this.getContext=function(){return g},this.getContextAttributes=function(){return g.getContextAttributes()},this.forceContextLoss=function(){const c=Fe.get("WEBGL_lose_context");c&&c.loseContext()},this.forceContextRestore=function(){const c=Fe.get("WEBGL_lose_context");c&&c.restoreContext()},this.getPixelRatio=function(){return pe},this.setPixelRatio=function(c){c!==void 0&&(pe=c,this.setSize(V,fe,!1))},this.getSize=function(c){return c.set(V,fe)},this.setSize=function(c,A,y=!0){if(te.isPresenting){Je("WebGLRenderer: Can't change size while VR device is presenting.");return}V=c,fe=A,t.width=Math.floor(c*pe),t.height=Math.floor(A*pe),y===!0&&(t.style.width=c+"px",t.style.height=A+"px"),this.setViewport(0,0,c,A)},this.getDrawingBufferSize=function(c){return c.set(V*pe,fe*pe).floor()},this.setDrawingBufferSize=function(c,A,y){V=c,fe=A,pe=y,t.width=Math.floor(c*y),t.height=Math.floor(A*y),this.setViewport(0,0,c,A)},this.getCurrentViewport=function(c){return c.copy(z)},this.getViewport=function(c){return c.copy(tt)},this.setViewport=function(c,A,y,I){c.isVector4?tt.set(c.x,c.y,c.z,c.w):tt.set(c,A,y,I),he.viewport(z.copy(tt).multiplyScalar(pe).round())},this.getScissor=function(c){return c.copy(je)},this.setScissor=function(c,A,y,I){c.isVector4?je.set(c.x,c.y,c.z,c.w):je.set(c,A,y,I),he.scissor(W.copy(je).multiplyScalar(pe).round())},this.getScissorTest=function(){return nt},this.setScissorTest=function(c){he.setScissorTest(nt=c)},this.setOpaqueSort=function(c){De=c},this.setTransparentSort=function(c){Ye=c},this.getClearColor=function(c){return c.copy(j.getClearColor())},this.setClearColor=function(){j.setClearColor(...arguments)},this.getClearAlpha=function(){return j.getClearAlpha()},this.setClearAlpha=function(){j.setClearAlpha(...arguments)},this.clear=function(c=!0,A=!0,y=!0){let I=0;if(c){let C=!1;if(u!==null){const J=u.texture.format;C=D.has(J)}if(C){const J=u.texture.type,oe=U.has(J),ue=j.getClearColor(),ce=j.getClearAlpha(),be=ue.r,Ae=ue.g,ge=ue.b;oe?(l[0]=be,l[1]=Ae,l[2]=ge,l[3]=ce,g.clearBufferuiv(g.COLOR,0,l)):(r[0]=be,r[1]=Ae,r[2]=ge,r[3]=ce,g.clearBufferiv(g.COLOR,0,r))}else I|=g.COLOR_BUFFER_BIT}A&&(I|=g.DEPTH_BUFFER_BIT),y&&(I|=g.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),g.clear(I)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Q,!1),t.removeEventListener("webglcontextrestored",k,!1),t.removeEventListener("webglcontextcreationerror",de,!1),j.dispose(),ie.dispose(),Se.dispose(),ve.dispose(),p.dispose(),s.dispose(),Y.dispose(),S.dispose(),ae.dispose(),O.dispose(),te.dispose(),te.removeEventListener("sessionstart",pi),te.removeEventListener("sessionend",hi),Wt.stop()};function Q(c){c.preventDefault(),Si("WebGLRenderer: Context Lost."),F=!0}function k(){Si("WebGLRenderer: Context Restored."),F=!1;const c=it.autoReset,A=K.enabled,y=K.autoUpdate,I=K.needsUpdate,C=K.type;ee(),it.autoReset=c,K.enabled=A,K.autoUpdate=y,K.needsUpdate=I,K.type=C}function de(c){vt("WebGLRenderer: A WebGL context could not be created. Reason: ",c.statusMessage)}function Ce(c){const A=c.target;A.removeEventListener("dispose",Ce),$e(A)}function $e(c){We(c),ve.remove(c)}function We(c){const A=ve.get(c).programs;A!==void 0&&(A.forEach(function(y){O.releaseProgram(y)}),c.isShaderMaterial&&O.releaseShaderCache(c))}this.renderBufferDirect=function(c,A,y,I,C,J){A===null&&(A=ut);const oe=C.isMesh&&C.matrixWorld.determinant()<0,ue=ir(c,A,y,I,C);he.setMaterial(I,oe);let ce=y.index,be=1;if(I.wireframe===!0){if(ce=G.getWireframeAttribute(y),ce===void 0)return;be=2}const Ae=y.drawRange,ge=y.attributes.position;let Oe=Ae.start*be,Xe=(Ae.start+Ae.count)*be;J!==null&&(Oe=Math.max(Oe,J.start*be),Xe=Math.min(Xe,(J.start+J.count)*be)),ce!==null?(Oe=Math.max(Oe,0),Xe=Math.min(Xe,ce.count)):ge!=null&&(Oe=Math.max(Oe,0),Xe=Math.min(Xe,ge.count));const ot=Xe-Oe;if(ot<0||ot===1/0)return;S.setup(C,I,ue,y,ce);let st,qe=Me;if(ce!==null&&(st=L.get(ce),qe=se,qe.setIndex(st)),C.isMesh)I.wireframe===!0?(he.setLineWidth(I.wireframeLinewidth*et()),qe.setMode(g.LINES)):qe.setMode(g.TRIANGLES);else if(C.isLine){let Ee=I.linewidth;Ee===void 0&&(Ee=1),he.setLineWidth(Ee*et()),C.isLineSegments?qe.setMode(g.LINES):C.isLineLoop?qe.setMode(g.LINE_LOOP):qe.setMode(g.LINE_STRIP)}else C.isPoints?qe.setMode(g.POINTS):C.isSprite&&qe.setMode(g.TRIANGLES);if(C.isBatchedMesh)if(C._multiDrawInstances!==null)ei("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),qe.renderMultiDrawInstances(C._multiDrawStarts,C._multiDrawCounts,C._multiDrawCount,C._multiDrawInstances);else if(Fe.get("WEBGL_multi_draw"))qe.renderMultiDraw(C._multiDrawStarts,C._multiDrawCounts,C._multiDrawCount);else{const Ee=C._multiDrawStarts,at=C._multiDrawCounts,Ge=C._multiDrawCount,St=ce?L.get(ce).bytesPerElement:1,Jt=ve.get(I).currentProgram.getUniforms();for(let Et=0;Et<Ge;Et++)Jt.setValue(g,"_gl_DrawID",Et),qe.render(Ee[Et]/St,at[Et])}else if(C.isInstancedMesh)qe.renderInstances(Oe,ot,C.count);else if(y.isInstancedBufferGeometry){const Ee=y._maxInstanceCount!==void 0?y._maxInstanceCount:1/0,at=Math.min(y.instanceCount,Ee);qe.renderInstances(Oe,ot,at)}else qe.render(Oe,ot)};function At(c,A,y){c.transparent===!0&&c.side===Dt&&c.forceSinglePass===!1?(c.side=bt,c.needsUpdate=!0,Mn(c,A,y),c.side=xn,c.needsUpdate=!0,Mn(c,A,y),c.side=Dt):Mn(c,A,y)}this.compile=function(c,A,y=null){y===null&&(y=c),_=Se.get(y),_.init(A),N.push(_),y.traverseVisible(function(C){C.isLight&&C.layers.test(A.layers)&&(_.pushLight(C),C.castShadow&&_.pushShadow(C))}),c!==y&&c.traverseVisible(function(C){C.isLight&&C.layers.test(A.layers)&&(_.pushLight(C),C.castShadow&&_.pushShadow(C))}),_.setupLights();const I=new Set;return c.traverse(function(C){if(!(C.isMesh||C.isPoints||C.isLine||C.isSprite))return;const J=C.material;if(J)if(Array.isArray(J))for(let oe=0;oe<J.length;oe++){const ue=J[oe];At(ue,y,C),I.add(ue)}else At(J,y,C),I.add(J)}),_=N.pop(),I},this.compileAsync=function(c,A,y=null){const I=this.compile(c,A,y);return new Promise(C=>{function J(){if(I.forEach(function(oe){ve.get(oe).currentProgram.isReady()&&I.delete(oe)}),I.size===0){C(c);return}setTimeout(J,10)}Fe.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let Tt=null;function nr(c){Tt&&Tt(c)}function pi(){Wt.stop()}function hi(){Wt.start()}const Wt=new Qa;Wt.setAnimationLoop(nr),typeof self<"u"&&Wt.setContext(self),this.setAnimationLoop=function(c){Tt=c,te.setAnimationLoop(c),c===null?Wt.stop():Wt.start()},te.addEventListener("sessionstart",pi),te.addEventListener("sessionend",hi),this.render=function(c,A){if(A!==void 0&&A.isCamera!==!0){vt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(F===!0)return;if(c.matrixWorldAutoUpdate===!0&&c.updateMatrixWorld(),A.parent===null&&A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),te.enabled===!0&&te.isPresenting===!0&&(te.cameraAutoUpdate===!0&&te.updateCamera(A),A=te.getCamera()),c.isScene===!0&&c.onBeforeRender(E,c,A,u),_=Se.get(c,N.length),_.init(A),N.push(_),Pe.multiplyMatrices(A.projectionMatrix,A.matrixWorldInverse),H.setFromProjectionMatrix(Pe,Ei,A.reversedDepth),le=this.localClippingEnabled,q=me.init(this.clippingPlanes,le),T=ie.get(c,P.length),T.init(),P.push(T),te.enabled===!0&&te.isPresenting===!0){const J=E.xr.getDepthSensingMesh();J!==null&&Vn(J,A,-1/0,E.sortObjects)}Vn(c,A,0,E.sortObjects),T.finish(),E.sortObjects===!0&&T.sort(De,Ye),ye=te.enabled===!1||te.isPresenting===!1||te.hasDepthSensing()===!1,ye&&j.addToRenderList(T,c),this.info.render.frame++,q===!0&&me.beginShadows();const y=_.state.shadowsArray;K.render(y,c,A),q===!0&&me.endShadows(),this.info.autoReset===!0&&this.info.reset();const I=T.opaque,C=T.transmissive;if(_.setupLights(),A.isArrayCamera){const J=A.cameras;if(C.length>0)for(let oe=0,ue=J.length;oe<ue;oe++){const ce=J[oe];xi(I,C,c,ce)}ye&&j.render(c);for(let oe=0,ue=J.length;oe<ue;oe++){const ce=J[oe];mi(T,c,ce,ce.viewport)}}else C.length>0&&xi(I,C,c,A),ye&&j.render(c),mi(T,c,A);u!==null&&h===0&&(we.updateMultisampleRenderTarget(u),we.updateRenderTargetMipmap(u)),c.isScene===!0&&c.onAfterRender(E,c,A),S.resetDefaultState(),w=-1,B=null,N.pop(),N.length>0?(_=N[N.length-1],q===!0&&me.setGlobalState(E.clippingPlanes,_.state.camera)):_=null,P.pop(),P.length>0?T=P[P.length-1]:T=null};function Vn(c,A,y,I){if(c.visible===!1)return;if(c.layers.test(A.layers)){if(c.isGroup)y=c.renderOrder;else if(c.isLOD)c.autoUpdate===!0&&c.update(A);else if(c.isLight)_.pushLight(c),c.castShadow&&_.pushShadow(c);else if(c.isSprite){if(!c.frustumCulled||H.intersectsSprite(c)){I&&Ie.setFromMatrixPosition(c.matrixWorld).applyMatrix4(Pe);const oe=Y.update(c),ue=c.material;ue.visible&&T.push(c,oe,ue,y,Ie.z,null)}}else if((c.isMesh||c.isLine||c.isPoints)&&(!c.frustumCulled||H.intersectsObject(c))){const oe=Y.update(c),ue=c.material;if(I&&(c.boundingSphere!==void 0?(c.boundingSphere===null&&c.computeBoundingSphere(),Ie.copy(c.boundingSphere.center)):(oe.boundingSphere===null&&oe.computeBoundingSphere(),Ie.copy(oe.boundingSphere.center)),Ie.applyMatrix4(c.matrixWorld).applyMatrix4(Pe)),Array.isArray(ue)){const ce=oe.groups;for(let be=0,Ae=ce.length;be<Ae;be++){const ge=ce[be],Oe=ue[ge.materialIndex];Oe&&Oe.visible&&T.push(c,oe,Oe,y,Ie.z,ge)}}else ue.visible&&T.push(c,oe,ue,y,Ie.z,null)}}const J=c.children;for(let oe=0,ue=J.length;oe<ue;oe++)Vn(J[oe],A,y,I)}function mi(c,A,y,I){const{opaque:C,transmissive:J,transparent:oe}=c;_.setupLightsView(y),q===!0&&me.setGlobalState(E.clippingPlanes,y),I&&he.viewport(z.copy(I)),C.length>0&&En(C,A,y),J.length>0&&En(J,A,y),oe.length>0&&En(oe,A,y),he.buffers.depth.setTest(!0),he.buffers.depth.setMask(!0),he.buffers.color.setMask(!0),he.setPolygonOffset(!1)}function xi(c,A,y,I){if((y.isScene===!0?y.overrideMaterial:null)!==null)return;_.state.transmissionRenderTarget[I.id]===void 0&&(_.state.transmissionRenderTarget[I.id]=new an(1,1,{generateMipmaps:!0,type:Fe.has("EXT_color_buffer_half_float")||Fe.has("EXT_color_buffer_float")?Sn:Qt,minFilter:dn,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:lt.workingColorSpace}));const J=_.state.transmissionRenderTarget[I.id],oe=I.viewport||z;J.setSize(oe.z*E.transmissionResolutionScale,oe.w*E.transmissionResolutionScale);const ue=E.getRenderTarget(),ce=E.getActiveCubeFace(),be=E.getActiveMipmapLevel();E.setRenderTarget(J),E.getClearColor(X),re=E.getClearAlpha(),re<1&&E.setClearColor(16777215,.5),E.clear(),ye&&j.render(y);const Ae=E.toneMapping;E.toneMapping=Ht;const ge=I.viewport;if(I.viewport!==void 0&&(I.viewport=void 0),_.setupLightsView(I),q===!0&&me.setGlobalState(E.clippingPlanes,I),En(c,y,I),we.updateMultisampleRenderTarget(J),we.updateRenderTargetMipmap(J),Fe.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let Xe=0,ot=A.length;Xe<ot;Xe++){const st=A[Xe],{object:qe,geometry:Ee,material:at,group:Ge}=st;if(at.side===Dt&&qe.layers.test(I.layers)){const St=at.side;at.side=bt,at.needsUpdate=!0,_i(qe,y,I,Ee,at,Ge),at.side=St,at.needsUpdate=!0,Oe=!0}}Oe===!0&&(we.updateMultisampleRenderTarget(J),we.updateRenderTargetMipmap(J))}E.setRenderTarget(ue,ce,be),E.setClearColor(X,re),ge!==void 0&&(I.viewport=ge),E.toneMapping=Ae}function En(c,A,y){const I=A.isScene===!0?A.overrideMaterial:null;for(let C=0,J=c.length;C<J;C++){const oe=c[C],{object:ue,geometry:ce,group:be}=oe;let Ae=oe.material;Ae.allowOverride===!0&&I!==null&&(Ae=I),ue.layers.test(y.layers)&&_i(ue,A,y,ce,Ae,be)}}function _i(c,A,y,I,C,J){c.onBeforeRender(E,A,y,I,C,J),c.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,c.matrixWorld),c.normalMatrix.getNormalMatrix(c.modelViewMatrix),C.onBeforeRender(E,A,y,I,c,J),C.transparent===!0&&C.side===Dt&&C.forceSinglePass===!1?(C.side=bt,C.needsUpdate=!0,E.renderBufferDirect(y,A,I,C,c,J),C.side=xn,C.needsUpdate=!0,E.renderBufferDirect(y,A,I,C,c,J),C.side=Dt):E.renderBufferDirect(y,A,I,C,c,J),c.onAfterRender(E,A,y,I,C,J)}function Mn(c,A,y){A.isScene!==!0&&(A=ut);const I=ve.get(c),C=_.state.lights,J=_.state.shadowsArray,oe=C.state.version,ue=O.getParameters(c,C.state,J,A,y),ce=O.getProgramCacheKey(ue);let be=I.programs;I.environment=c.isMeshStandardMaterial?A.environment:null,I.fog=A.fog,I.envMap=(c.isMeshStandardMaterial?s:p).get(c.envMap||I.environment),I.envMapRotation=I.environment!==null&&c.envMap===null?A.environmentRotation:c.envMapRotation,be===void 0&&(c.addEventListener("dispose",Ce),be=new Map,I.programs=be);let Ae=be.get(ce);if(Ae!==void 0){if(I.currentProgram===Ae&&I.lightsStateVersion===oe)return vi(c,ue),Ae}else ue.uniforms=O.getUniforms(c),c.onBeforeCompile(ue,E),Ae=O.acquireProgram(ue,ce),be.set(ce,Ae),I.uniforms=ue.uniforms;const ge=I.uniforms;return(!c.isShaderMaterial&&!c.isRawShaderMaterial||c.clipping===!0)&&(ge.clippingPlanes=me.uniform),vi(c,ue),I.needsLights=rr(c),I.lightsStateVersion=oe,I.needsLights&&(ge.ambientLightColor.value=C.state.ambient,ge.lightProbe.value=C.state.probe,ge.directionalLights.value=C.state.directional,ge.directionalLightShadows.value=C.state.directionalShadow,ge.spotLights.value=C.state.spot,ge.spotLightShadows.value=C.state.spotShadow,ge.rectAreaLights.value=C.state.rectArea,ge.ltc_1.value=C.state.rectAreaLTC1,ge.ltc_2.value=C.state.rectAreaLTC2,ge.pointLights.value=C.state.point,ge.pointLightShadows.value=C.state.pointShadow,ge.hemisphereLights.value=C.state.hemi,ge.directionalShadowMap.value=C.state.directionalShadowMap,ge.directionalShadowMatrix.value=C.state.directionalShadowMatrix,ge.spotShadowMap.value=C.state.spotShadowMap,ge.spotLightMatrix.value=C.state.spotLightMatrix,ge.spotLightMap.value=C.state.spotLightMap,ge.pointShadowMap.value=C.state.pointShadowMap,ge.pointShadowMatrix.value=C.state.pointShadowMatrix),I.currentProgram=Ae,I.uniformsList=null,Ae}function gi(c){if(c.uniformsList===null){const A=c.currentProgram.getUniforms();c.uniformsList=Un.seqWithValue(A.seq,c.uniforms)}return c.uniformsList}function vi(c,A){const y=ve.get(c);y.outputColorSpace=A.outputColorSpace,y.batching=A.batching,y.batchingColor=A.batchingColor,y.instancing=A.instancing,y.instancingColor=A.instancingColor,y.instancingMorph=A.instancingMorph,y.skinning=A.skinning,y.morphTargets=A.morphTargets,y.morphNormals=A.morphNormals,y.morphColors=A.morphColors,y.morphTargetsCount=A.morphTargetsCount,y.numClippingPlanes=A.numClippingPlanes,y.numIntersection=A.numClipIntersection,y.vertexAlphas=A.vertexAlphas,y.vertexTangents=A.vertexTangents,y.toneMapping=A.toneMapping}function ir(c,A,y,I,C){A.isScene!==!0&&(A=ut),we.resetTextureUnits();const J=A.fog,oe=I.isMeshStandardMaterial?A.environment:null,ue=u===null?E.outputColorSpace:u.isXRRenderTarget===!0?u.texture.colorSpace:Nn,ce=(I.isMeshStandardMaterial?s:p).get(I.envMap||oe),be=I.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,Ae=!!y.attributes.tangent&&(!!I.normalMap||I.anisotropy>0),ge=!!y.morphAttributes.position,Oe=!!y.morphAttributes.normal,Xe=!!y.morphAttributes.color;let ot=Ht;I.toneMapped&&(u===null||u.isXRRenderTarget===!0)&&(ot=E.toneMapping);const st=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,qe=st!==void 0?st.length:0,Ee=ve.get(I),at=_.state.lights;if(q===!0&&(le===!0||c!==B)){const pt=c===B&&I.id===w;me.setState(I,c,pt)}let Ge=!1;I.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==at.state.version||Ee.outputColorSpace!==ue||C.isBatchedMesh&&Ee.batching===!1||!C.isBatchedMesh&&Ee.batching===!0||C.isBatchedMesh&&Ee.batchingColor===!0&&C.colorTexture===null||C.isBatchedMesh&&Ee.batchingColor===!1&&C.colorTexture!==null||C.isInstancedMesh&&Ee.instancing===!1||!C.isInstancedMesh&&Ee.instancing===!0||C.isSkinnedMesh&&Ee.skinning===!1||!C.isSkinnedMesh&&Ee.skinning===!0||C.isInstancedMesh&&Ee.instancingColor===!0&&C.instanceColor===null||C.isInstancedMesh&&Ee.instancingColor===!1&&C.instanceColor!==null||C.isInstancedMesh&&Ee.instancingMorph===!0&&C.morphTexture===null||C.isInstancedMesh&&Ee.instancingMorph===!1&&C.morphTexture!==null||Ee.envMap!==ce||I.fog===!0&&Ee.fog!==J||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==me.numPlanes||Ee.numIntersection!==me.numIntersection)||Ee.vertexAlphas!==be||Ee.vertexTangents!==Ae||Ee.morphTargets!==ge||Ee.morphNormals!==Oe||Ee.morphColors!==Xe||Ee.toneMapping!==ot||Ee.morphTargetsCount!==qe)&&(Ge=!0):(Ge=!0,Ee.__version=I.version);let St=Ee.currentProgram;Ge===!0&&(St=Mn(I,A,C));let Jt=!1,Et=!1,sn=!1;const rt=St.getUniforms(),mt=Ee.uniforms;if(he.useProgram(St.program)&&(Jt=!0,Et=!0,sn=!0),I.id!==w&&(w=I.id,Et=!0),Jt||B!==c){he.buffers.depth.getReversed()&&c.reversedDepth!==!0&&(c._reversedDepth=!0,c.updateProjectionMatrix()),rt.setValue(g,"projectionMatrix",c.projectionMatrix),rt.setValue(g,"viewMatrix",c.matrixWorldInverse);const xt=rt.map.cameraPosition;xt!==void 0&&xt.setValue(g,_e.setFromMatrixPosition(c.matrixWorld)),Ze.logarithmicDepthBuffer&&rt.setValue(g,"logDepthBufFC",2/(Math.log(c.far+1)/Math.LN2)),(I.isMeshPhongMaterial||I.isMeshToonMaterial||I.isMeshLambertMaterial||I.isMeshBasicMaterial||I.isMeshStandardMaterial||I.isShaderMaterial)&&rt.setValue(g,"isOrthographic",c.isOrthographicCamera===!0),B!==c&&(B=c,Et=!0,sn=!0)}if(C.isSkinnedMesh){rt.setOptional(g,C,"bindMatrix"),rt.setOptional(g,C,"bindMatrixInverse");const pt=C.skeleton;pt&&(pt.boneTexture===null&&pt.computeBoneTexture(),rt.setValue(g,"boneTexture",pt.boneTexture,we))}C.isBatchedMesh&&(rt.setOptional(g,C,"batchingTexture"),rt.setValue(g,"batchingTexture",C._matricesTexture,we),rt.setOptional(g,C,"batchingIdTexture"),rt.setValue(g,"batchingIdTexture",C._indirectTexture,we),rt.setOptional(g,C,"batchingColorTexture"),C._colorsTexture!==null&&rt.setValue(g,"batchingColorTexture",C._colorsTexture,we));const Mt=y.morphAttributes;if((Mt.position!==void 0||Mt.normal!==void 0||Mt.color!==void 0)&&Te.update(C,y,St),(Et||Ee.receiveShadow!==C.receiveShadow)&&(Ee.receiveShadow=C.receiveShadow,rt.setValue(g,"receiveShadow",C.receiveShadow)),I.isMeshGouraudMaterial&&I.envMap!==null&&(mt.envMap.value=ce,mt.flipEnvMap.value=ce.isCubeTexture&&ce.isRenderTargetTexture===!1?-1:1),I.isMeshStandardMaterial&&I.envMap===null&&A.environment!==null&&(mt.envMapIntensity.value=A.environmentIntensity),mt.dfgLUT!==void 0&&(mt.dfgLUT.value=wd()),Et&&(rt.setValue(g,"toneMappingExposure",E.toneMappingExposure),Ee.needsLights&&ar(mt,sn),J&&I.fog===!0&&xe.refreshFogUniforms(mt,J),xe.refreshMaterialUniforms(mt,I,pe,fe,_.state.transmissionRenderTarget[c.id]),Un.upload(g,gi(Ee),mt,we)),I.isShaderMaterial&&I.uniformsNeedUpdate===!0&&(Un.upload(g,gi(Ee),mt,we),I.uniformsNeedUpdate=!1),I.isSpriteMaterial&&rt.setValue(g,"center",C.center),rt.setValue(g,"modelViewMatrix",C.modelViewMatrix),rt.setValue(g,"normalMatrix",C.normalMatrix),rt.setValue(g,"modelMatrix",C.matrixWorld),I.isShaderMaterial||I.isRawShaderMaterial){const pt=I.uniformsGroups;for(let xt=0,Hn=pt.length;xt<Hn;xt++){const Xt=pt[xt];ae.update(Xt,St),ae.bind(Xt,St)}}return St}function ar(c,A){c.ambientLightColor.needsUpdate=A,c.lightProbe.needsUpdate=A,c.directionalLights.needsUpdate=A,c.directionalLightShadows.needsUpdate=A,c.pointLights.needsUpdate=A,c.pointLightShadows.needsUpdate=A,c.spotLights.needsUpdate=A,c.spotLightShadows.needsUpdate=A,c.rectAreaLights.needsUpdate=A,c.hemisphereLights.needsUpdate=A}function rr(c){return c.isMeshLambertMaterial||c.isMeshToonMaterial||c.isMeshPhongMaterial||c.isMeshStandardMaterial||c.isShadowMaterial||c.isShaderMaterial&&c.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return h},this.getRenderTarget=function(){return u},this.setRenderTargetTextures=function(c,A,y){const I=ve.get(c);I.__autoAllocateDepthBuffer=c.resolveDepthBuffer===!1,I.__autoAllocateDepthBuffer===!1&&(I.__useRenderToTexture=!1),ve.get(c.texture).__webglTexture=A,ve.get(c.depthTexture).__webglTexture=I.__autoAllocateDepthBuffer?void 0:y,I.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(c,A){const y=ve.get(c);y.__webglFramebuffer=A,y.__useDefaultFramebuffer=A===void 0};const or=g.createFramebuffer();this.setRenderTarget=function(c,A=0,y=0){u=c,$=A,h=y;let I=!0,C=null,J=!1,oe=!1;if(c){const ce=ve.get(c);if(ce.__useDefaultFramebuffer!==void 0)he.bindFramebuffer(g.FRAMEBUFFER,null),I=!1;else if(ce.__webglFramebuffer===void 0)we.setupRenderTarget(c);else if(ce.__hasExternalTextures)we.rebindTextures(c,ve.get(c.texture).__webglTexture,ve.get(c.depthTexture).__webglTexture);else if(c.depthBuffer){const ge=c.depthTexture;if(ce.__boundDepthTexture!==ge){if(ge!==null&&ve.has(ge)&&(c.width!==ge.image.width||c.height!==ge.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");we.setupDepthRenderbuffer(c)}}const be=c.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(oe=!0);const Ae=ve.get(c).__webglFramebuffer;c.isWebGLCubeRenderTarget?(Array.isArray(Ae[A])?C=Ae[A][y]:C=Ae[A],J=!0):c.samples>0&&we.useMultisampledRTT(c)===!1?C=ve.get(c).__webglMultisampledFramebuffer:Array.isArray(Ae)?C=Ae[y]:C=Ae,z.copy(c.viewport),W.copy(c.scissor),Z=c.scissorTest}else z.copy(tt).multiplyScalar(pe).floor(),W.copy(je).multiplyScalar(pe).floor(),Z=nt;if(y!==0&&(C=or),he.bindFramebuffer(g.FRAMEBUFFER,C)&&I&&he.drawBuffers(c,C),he.viewport(z),he.scissor(W),he.setScissorTest(Z),J){const ce=ve.get(c.texture);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_CUBE_MAP_POSITIVE_X+A,ce.__webglTexture,y)}else if(oe){const ce=A;for(let be=0;be<c.textures.length;be++){const Ae=ve.get(c.textures[be]);g.framebufferTextureLayer(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0+be,Ae.__webglTexture,y,ce)}}else if(c!==null&&y!==0){const ce=ve.get(c.texture);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,ce.__webglTexture,y)}w=-1},this.readRenderTargetPixels=function(c,A,y,I,C,J,oe,ue=0){if(!(c&&c.isWebGLRenderTarget)){vt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ce=ve.get(c).__webglFramebuffer;if(c.isWebGLCubeRenderTarget&&oe!==void 0&&(ce=ce[oe]),ce){he.bindFramebuffer(g.FRAMEBUFFER,ce);try{const be=c.textures[ue],Ae=be.format,ge=be.type;if(!Ze.textureFormatReadable(Ae)){vt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ze.textureTypeReadable(ge)){vt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}A>=0&&A<=c.width-I&&y>=0&&y<=c.height-C&&(c.textures.length>1&&g.readBuffer(g.COLOR_ATTACHMENT0+ue),g.readPixels(A,y,I,C,Re.convert(Ae),Re.convert(ge),J))}finally{const be=u!==null?ve.get(u).__webglFramebuffer:null;he.bindFramebuffer(g.FRAMEBUFFER,be)}}},this.readRenderTargetPixelsAsync=async function(c,A,y,I,C,J,oe,ue=0){if(!(c&&c.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ce=ve.get(c).__webglFramebuffer;if(c.isWebGLCubeRenderTarget&&oe!==void 0&&(ce=ce[oe]),ce)if(A>=0&&A<=c.width-I&&y>=0&&y<=c.height-C){he.bindFramebuffer(g.FRAMEBUFFER,ce);const be=c.textures[ue],Ae=be.format,ge=be.type;if(!Ze.textureFormatReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ze.textureTypeReadable(ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Oe=g.createBuffer();g.bindBuffer(g.PIXEL_PACK_BUFFER,Oe),g.bufferData(g.PIXEL_PACK_BUFFER,J.byteLength,g.STREAM_READ),c.textures.length>1&&g.readBuffer(g.COLOR_ATTACHMENT0+ue),g.readPixels(A,y,I,C,Re.convert(Ae),Re.convert(ge),0);const Xe=u!==null?ve.get(u).__webglFramebuffer:null;he.bindFramebuffer(g.FRAMEBUFFER,Xe);const ot=g.fenceSync(g.SYNC_GPU_COMMANDS_COMPLETE,0);return g.flush(),await ur(g,ot,4),g.bindBuffer(g.PIXEL_PACK_BUFFER,Oe),g.getBufferSubData(g.PIXEL_PACK_BUFFER,0,J),g.deleteBuffer(Oe),g.deleteSync(ot),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(c,A=null,y=0){const I=Math.pow(2,-y),C=Math.floor(c.image.width*I),J=Math.floor(c.image.height*I),oe=A!==null?A.x:0,ue=A!==null?A.y:0;we.setTexture2D(c,0),g.copyTexSubImage2D(g.TEXTURE_2D,y,0,0,oe,ue,C,J),he.unbindTexture()};const sr=g.createFramebuffer(),cr=g.createFramebuffer();this.copyTextureToTexture=function(c,A,y=null,I=null,C=0,J=null){J===null&&(C!==0?(ei("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),J=C,C=0):J=0);let oe,ue,ce,be,Ae,ge,Oe,Xe,ot;const st=c.isCompressedTexture?c.mipmaps[J]:c.image;if(y!==null)oe=y.max.x-y.min.x,ue=y.max.y-y.min.y,ce=y.isBox3?y.max.z-y.min.z:1,be=y.min.x,Ae=y.min.y,ge=y.isBox3?y.min.z:0;else{const Mt=Math.pow(2,-C);oe=Math.floor(st.width*Mt),ue=Math.floor(st.height*Mt),c.isDataArrayTexture?ce=st.depth:c.isData3DTexture?ce=Math.floor(st.depth*Mt):ce=1,be=0,Ae=0,ge=0}I!==null?(Oe=I.x,Xe=I.y,ot=I.z):(Oe=0,Xe=0,ot=0);const qe=Re.convert(A.format),Ee=Re.convert(A.type);let at;A.isData3DTexture?(we.setTexture3D(A,0),at=g.TEXTURE_3D):A.isDataArrayTexture||A.isCompressedArrayTexture?(we.setTexture2DArray(A,0),at=g.TEXTURE_2D_ARRAY):(we.setTexture2D(A,0),at=g.TEXTURE_2D),g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,A.flipY),g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),g.pixelStorei(g.UNPACK_ALIGNMENT,A.unpackAlignment);const Ge=g.getParameter(g.UNPACK_ROW_LENGTH),St=g.getParameter(g.UNPACK_IMAGE_HEIGHT),Jt=g.getParameter(g.UNPACK_SKIP_PIXELS),Et=g.getParameter(g.UNPACK_SKIP_ROWS),sn=g.getParameter(g.UNPACK_SKIP_IMAGES);g.pixelStorei(g.UNPACK_ROW_LENGTH,st.width),g.pixelStorei(g.UNPACK_IMAGE_HEIGHT,st.height),g.pixelStorei(g.UNPACK_SKIP_PIXELS,be),g.pixelStorei(g.UNPACK_SKIP_ROWS,Ae),g.pixelStorei(g.UNPACK_SKIP_IMAGES,ge);const rt=c.isDataArrayTexture||c.isData3DTexture,mt=A.isDataArrayTexture||A.isData3DTexture;if(c.isDepthTexture){const Mt=ve.get(c),pt=ve.get(A),xt=ve.get(Mt.__renderTarget),Hn=ve.get(pt.__renderTarget);he.bindFramebuffer(g.READ_FRAMEBUFFER,xt.__webglFramebuffer),he.bindFramebuffer(g.DRAW_FRAMEBUFFER,Hn.__webglFramebuffer);for(let Xt=0;Xt<ce;Xt++)rt&&(g.framebufferTextureLayer(g.READ_FRAMEBUFFER,g.COLOR_ATTACHMENT0,ve.get(c).__webglTexture,C,ge+Xt),g.framebufferTextureLayer(g.DRAW_FRAMEBUFFER,g.COLOR_ATTACHMENT0,ve.get(A).__webglTexture,J,ot+Xt)),g.blitFramebuffer(be,Ae,oe,ue,Oe,Xe,oe,ue,g.DEPTH_BUFFER_BIT,g.NEAREST);he.bindFramebuffer(g.READ_FRAMEBUFFER,null),he.bindFramebuffer(g.DRAW_FRAMEBUFFER,null)}else if(C!==0||c.isRenderTargetTexture||ve.has(c)){const Mt=ve.get(c),pt=ve.get(A);he.bindFramebuffer(g.READ_FRAMEBUFFER,sr),he.bindFramebuffer(g.DRAW_FRAMEBUFFER,cr);for(let xt=0;xt<ce;xt++)rt?g.framebufferTextureLayer(g.READ_FRAMEBUFFER,g.COLOR_ATTACHMENT0,Mt.__webglTexture,C,ge+xt):g.framebufferTexture2D(g.READ_FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,Mt.__webglTexture,C),mt?g.framebufferTextureLayer(g.DRAW_FRAMEBUFFER,g.COLOR_ATTACHMENT0,pt.__webglTexture,J,ot+xt):g.framebufferTexture2D(g.DRAW_FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,pt.__webglTexture,J),C!==0?g.blitFramebuffer(be,Ae,oe,ue,Oe,Xe,oe,ue,g.COLOR_BUFFER_BIT,g.NEAREST):mt?g.copyTexSubImage3D(at,J,Oe,Xe,ot+xt,be,Ae,oe,ue):g.copyTexSubImage2D(at,J,Oe,Xe,be,Ae,oe,ue);he.bindFramebuffer(g.READ_FRAMEBUFFER,null),he.bindFramebuffer(g.DRAW_FRAMEBUFFER,null)}else mt?c.isDataTexture||c.isData3DTexture?g.texSubImage3D(at,J,Oe,Xe,ot,oe,ue,ce,qe,Ee,st.data):A.isCompressedArrayTexture?g.compressedTexSubImage3D(at,J,Oe,Xe,ot,oe,ue,ce,qe,st.data):g.texSubImage3D(at,J,Oe,Xe,ot,oe,ue,ce,qe,Ee,st):c.isDataTexture?g.texSubImage2D(g.TEXTURE_2D,J,Oe,Xe,oe,ue,qe,Ee,st.data):c.isCompressedTexture?g.compressedTexSubImage2D(g.TEXTURE_2D,J,Oe,Xe,st.width,st.height,qe,st.data):g.texSubImage2D(g.TEXTURE_2D,J,Oe,Xe,oe,ue,qe,Ee,st);g.pixelStorei(g.UNPACK_ROW_LENGTH,Ge),g.pixelStorei(g.UNPACK_IMAGE_HEIGHT,St),g.pixelStorei(g.UNPACK_SKIP_PIXELS,Jt),g.pixelStorei(g.UNPACK_SKIP_ROWS,Et),g.pixelStorei(g.UNPACK_SKIP_IMAGES,sn),J===0&&A.generateMipmaps&&g.generateMipmap(at),he.unbindTexture()},this.initRenderTarget=function(c){ve.get(c).__webglFramebuffer===void 0&&we.setupRenderTarget(c)},this.initTexture=function(c){c.isCubeTexture?we.setTextureCube(c,0):c.isData3DTexture?we.setTexture3D(c,0):c.isDataArrayTexture||c.isCompressedArrayTexture?we.setTexture2DArray(c,0):we.setTexture2D(c,0),he.unbindTexture()},this.resetState=function(){$=0,h=0,u=null,he.reset(),S.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ei}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;const t=this.getContext();t.drawingBufferColorSpace=lt._getDrawingBufferColorSpace(n),t.unpackColorSpace=lt._getUnpackColorSpace()}}const Bt=new ze(0,1,0),La=Kt.clamp,Ue=(e,n={})=>new $a({color:e,roughness:.85,...n}),Be={green:Ue("#6b9f47"),dark:Ue("#387b52"),light:Ue("#9bb65a"),trunk:Ue("#92694c"),sand:Ue("#f0c97f"),orange:Ue("#f2944c"),cream:Ue("#fff2d0"),brown:Ue("#654d3c"),black:Ue("#263b35"),pink:Ue("#f4b1a3"),white:Ue("#fffcef")};function He(e,n,t=0,i=0,o=0){const a=new It(e,n);return a.position.set(t,i,o),a.castShadow=!0,a.receiveShadow=!0,a}function Ve(e,n,t,i,o,a=o,d=o,f=12){const b=He(new Ln(1,f,8),e,n,t,i);return b.scale.set(o,a,d),b}function Cn(e,n,t){e.position.copy(n).multiplyScalar(t),e.quaternion.setFromUnitVectors(Bt,n)}function Ld(e){e.traverse(n=>{(n instanceof It||n instanceof ko)&&(n.geometry.dispose(),(Array.isArray(n.material)?n.material:[n.material]).forEach(i=>i.dispose()))})}class Dd{constructor(n,t,i=[],o=()=>new Pd({antialias:!0,alpha:!0,powerPreference:"high-performance"})){this.host=n,this.cb=t,this.scene=new Po,this.camera=new hn(42,1,.1,180),this.normal=Nt(-.37,.27),this.forward=new ze,this.cameraNorth=new ze,this.heading=new ze,this.zoom=0,this.targetZoom=0,this.yaw=0,this.pitch=0,this.keys=new Set,this.joystick={x:0,y:0},this.target=null,this.player=new ct,this.body=new ct,this.leftLeg=new ct,this.rightLeg=new ct,this.leftArm=new ct,this.rightArm=new ct,this.tail=new ct,this.ripple=new ct,this.ray=new Lo,this.cursor=new ht,this.marker=new ct,this.collected=new Set,this.treasures=[],this.animals=[],this.clouds=[],this.particles=[],this.destroyed=!1,this.paused=!1,this.swimming=!1,this.moving=!1,this.elapsed=0,this.jumpHeight=0,this.jumpVelocity=0,this.raf=0,this.lastTime=0,this.lastReport=0,this.frames=0,this.fps=60,this.fpsTime=0,this.travel=null,this.sound=!0,this.audio=null,this.pointerMap=new Map,this.pinch=0,this.dragged=!1,this.listeners=[],this.tick=v=>{if(this.destroyed)return;this.raf=requestAnimationFrame(this.tick);const R=Math.min((v-this.lastTime)/1e3,.045);if(this.lastTime=v,this.frames++,v-this.fpsTime>1e3&&(this.fps=this.frames,this.frames=0,this.fpsTime=v),this.paused||(this.elapsed+=R,this.step(R)),this.updateCamera(R),this.renderer.render(this.scene,this.camera),v-this.lastReport>100){const m=this.player.position.clone().addScaledVector(this.normal,1.7).project(this.camera),x=Ct(this.normal);this.cb.status({region:x.region,swimming:this.swimming,zoom:this.targetZoom,moving:this.moving,screen:{x:(m.x+1)*this.host.clientWidth/2,y:(1-m.y)*this.host.clientHeight/2},ready:!0}),this.lastReport=v}},this.collected=new Set(i),this.cameraNorth.copy(Bt).addScaledVector(this.normal,-Bt.dot(this.normal)).normalize(),this.heading.copy(this.cameraNorth).negate(),this.renderer=o(),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),this.renderer.setClearColor(0,0),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Ka,this.renderer.toneMapping=Za,this.renderer.toneMappingExposure=1.12,this.renderer.domElement.setAttribute("aria-label","Mini World. Tap the planet to walk, drag to look around, and scroll to zoom."),this.renderer.domElement.setAttribute("role","application"),n.appendChild(this.renderer.domElement),this.scene.add(new Uo("#fff8e2","#7dabad",2.1)),this.sun=new ia("#fff1d1",3.1),this.sun.castShadow=!0;const a=n.clientWidth<650?1024:2048;this.sun.shadow.mapSize.set(a,a),this.sun.shadow.camera.left=-19,this.sun.shadow.camera.right=19,this.sun.shadow.camera.top=19,this.sun.shadow.camera.bottom=-19,this.sun.shadow.normalBias=.05,this.sun.shadow.bias=-1e-4,this.sun.shadow.camera.far=100,this.scene.add(this.sun,this.sun.target);const d=new ia("#b9e9ed",1.4);d.position.set(25,-5,20),this.scene.add(d),this.ground=this.createTerrain(),this.sea=He(new Ln(Ft,128,80),new Do({color:"#48beca",roughness:.38,metalness:.06,clearcoat:.35,clearcoatRoughness:.4})),this.sea.receiveShadow=!0,this.sea.castShadow=!1,this.scene.add(this.sea),this.populate(),this.createLandmarks(),this.createClouds(),this.makePlayer(),this.floatRing=He(new Tn(.49,.13,8,28),Ue("#ffdb71")),this.floatRing.rotation.x=Math.PI/2,this.floatRing.position.y=.35,this.player.add(this.floatRing),this.floatRing.visible=!1;for(let v=0;v<3;v++){const R=He(new Tn(.65+v*.2,.016,4,40),new un({color:"#effffd",transparent:!0,opacity:.6-v*.13}));R.rotation.x=Math.PI/2,R.position.y=.025,this.ripple.add(R)}this.scene.add(this.ripple),this.ripple.visible=!1;const f=new un({color:"#fff5c2",transparent:!0,opacity:.9}),b=He(new Tn(.29,.038,5,32),f);b.rotation.x=Math.PI/2,this.marker.add(b),this.scene.add(this.marker),this.marker.visible=!1,this.makeTreasures(),this.scene.add(this.player),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(n),this.resize(),this.bind(),this.onContextLost=v=>{v.preventDefault(),this.paused=!0,this.cb.error("The little world needs a fresh start. Tap Reload to hop back in.")},this.renderer.domElement.addEventListener("webglcontextlost",this.onContextLost),this.updateCamera(1,!0),this.lastTime=performance.now(),this.raf=requestAnimationFrame(this.tick),t.ready()}createTerrain(){const n=new Ln(jt,180,120),t=n.attributes.position,i=[],o=new ze,a=new Ke("#a6c96a"),d=new Ke("#f3d28d"),f=new Ke("#f7e4ad");for(let v=0;v<t.count;v++){o.fromBufferAttribute(t,v).normalize();const R=Ct(o);t.setXYZ(v,o.x*R.radius,o.y*R.radius,o.z*R.radius);const m=(R.landRegion==="forest"?a:d).clone();R.depth<.09?m.lerp(f,1-Kt.smoothstep(R.depth,.015,.09)):m.multiplyScalar(.96+.055*Math.sin(o.x*41+o.y*24)*Math.cos(o.z*31)),i.push(m.r,m.g,m.b)}n.setAttribute("color",new aa(i,3)),n.computeVertexNormals();const b=He(n,new $a({vertexColors:!0,roughness:1}));return this.scene.add(b),b}populate(){const n=oa(),t=[],i=[[],[],[]],o=[],a=[],d=[],f=[[],[],[]],b=new yo,v=new ln,R=new ze,m=(l,r,T,_,P,N,E,F,$=0)=>(v.setFromUnitVectors(Bt,l),b.position.copy(l).multiplyScalar(r).add(R.set(T,_,P).applyQuaternion(v)),b.quaternion.copy(v).multiply(new ln().setFromAxisAngle(Bt,$)),b.scale.set(N,E,F),b.updateMatrix(),b.matrix.clone()),x=l=>l.angleTo(this.normal)<.12||ra.some(r=>l.angleTo(Nt(r.lon,r.lat))<.075);for(let l=0;l<1550;l++){const r=Nt(n()*Math.PI*2-Math.PI,Math.asin(n()*2-1)),T=Ct(r);if(!(T.swimming||T.depth<.09||x(r)))if(T.region==="forest")if(n()<.68){const _=.5+n()*.65;t.push(m(r,T.radius,0,_*.4,0,.1*_,.85*_,.1*_));const P=Math.floor(n()*3);i[P].push(m(r,T.radius,0,1.03*_,0,.54*_,1*_,.54*_)),i[P].push(m(r,T.radius,0,1.6*_,0,.4*_,.95*_,.4*_))}else{o.push(m(r,T.radius,0,.18,0,.3,.26,.3));for(let _=0;_<3;_++)f[_].push(m(r,T.radius,(n()-.5)*.8,.16,(n()-.5)*.8,.075,.075,.075))}else if(n()<.35){const _=.55+n()*.6;d.push(m(r,T.radius,0,_*.5,0,.13,_*.5,.13)),d.push(m(r,T.radius,-.27,_*.48,0,.23,.105,.105)),d.push(m(r,T.radius,-.45,_*.67,0,.105,_*.25,.105)),d.push(m(r,T.radius,.23,_*.35,0,.2,.105,.105)),d.push(m(r,T.radius,.38,_*.49,0,.105,_*.2,.105))}else n()<.25&&a.push(m(r,T.radius,0,.1,0,.22+n()*.2,.2,.18+n()*.25,n()*6))}const M=(l,r,T)=>{if(!T.length)return;const _=new Ho(l,r,T.length);T.forEach((P,N)=>_.setMatrixAt(N,P)),_.castShadow=!0,_.receiveShadow=!0,_.instanceMatrix.needsUpdate=!0,this.scene.add(_)};M(new wt(1,1,1,6),Be.trunk,t),["#3f8b5d","#69a361","#91b568"].forEach((l,r)=>M(new Ot(1,1,7),Ue(l),i[r])),M(new Kn(1,1),Be.green,o),M(new Io(1),Ue("#c8b394"),a),M(new Ln(1,8,6),Ue("#73a76b"),d),["#fff2b0","#f3b6b7","#d8def6"].forEach((l,r)=>M(new Kn(1,0),Ue(l),f[r]));const D=new Fn,U=[];for(let l=0;l<450;l++){const r=Nt(n()*6.28-3.14,Math.asin(n()*2-1));if(!Ct(r).swimming)continue;const T=new ze().crossVectors(r,Bt).normalize(),_=r.clone().multiplyScalar(Ft+.022),P=.08+n()*.12;U.push(..._.clone().addScaledVector(T,-P).toArray(),..._.clone().addScaledVector(T,P).toArray())}D.setAttribute("position",new aa(U,3)),this.scene.add(new No(D,new Fo({color:"#d5fbef",transparent:!0,opacity:.42})))}place(n,t,i,o=0){const a=Nt(t,i);return Cn(n,a,Math.max(Ct(a).radius,Ft)+o),this.scene.add(n),n}createLandmarks(){const n=new ct;n.add(He(new Ut(1.25,.8,1),Ue("#eac395"),0,.4,0));const t=He(new Ot(1.03,.7,4),Ue("#ca7252"),0,1.05,0);t.rotation.y=Math.PI/4,t.scale.z=.9,n.add(t),n.add(He(new Ut(.29,.5,.05),Ue("#63877b"),0,.25,.53)),n.add(He(new Ut(.21,.22,.05),Ue("#fff5ba"),-.39,.48,.53)),n.add(He(new Ut(.21,.22,.05),Ue("#fff5ba"),.39,.48,.53)),n.add(He(new wt(.035,.035,1.6,6),Be.trunk,.95,.8,.05));const i=He(new Ut(.5,.29,.03),Ue("#e9a855"),1.18,1.41,.05);n.add(i),this.place(n,-.56,.62);const o=new ct,a=Ue("#cf9d68");o.add(He(new wt(.3,.43,1.7,6),a,-.65,.85,0),He(new wt(.36,.45,1.7,6),a,.65,.85,0),He(new Ut(1.8,.48,.65),a,0,1.72,0)),this.place(o,.95,.44);for(let x=0;x<5;x++){const M=new ct,D=1.7+Math.sin(x*2)*.5;M.add(He(new Ot(1.15,D,5),Ue("#91a89a"),0,D/2,0)),M.add(He(new Ot(.47,D*.42,5),Ue("#f3f4dc"),0,D*.8,0)),this.place(M,-.8+x*.12,.79+Math.sin(x)*.04)}const d=new ct;for(let x=0;x<3;x++){const M=(x-1)*.3,D=x===1?1:.65;d.add(He(new wt(.07*D,.09*D,.32*D,8),Be.cream,M,.16*D,0)),d.add(Ve(Ue("#df7964"),M,.34*D,0,.23*D,.14*D,.23*D)),d.add(Ve(Be.cream,M+.08*D,.43*D,.02,.035))}this.place(d,-.55,.14);const f=new ct;f.add(Ve(Be.cream,0,.24,0,.24,.28,.3),Ve(Be.cream,0,.5,.15,.22),Ve(Be.cream,-.1,.78,.13,.065,.25,.08),Ve(Be.cream,.1,.78,.13,.065,.25,.08),Ve(Be.pink,-.1,.79,.19,.028,.16,.02),Ve(Be.pink,.1,.79,.19,.028,.16,.02),Ve(Be.black,-.08,.54,.34,.024),Ve(Be.black,.08,.54,.34,.024));const b=this.place(new ct,-.65,.43);b.add(f),this.animals.push({root:b,mesh:f,phase:0});const v=new ct;v.add(Ve(Ue("#76a662"),0,.17,0,.34,.23,.42),Ve(Ue("#b5cd83"),0,.13,.46,.15));for(const x of[-1,1])for(const M of[-1,1])v.add(Ve(Ue("#a4c581"),x*.31,.07,M*.23,.18,.06,.12));v.add(Ve(Be.black,-.065,.19,.58,.018),Ve(Be.black,.065,.19,.58,.018));const R=this.place(new ct,-.14,-.49,.03);R.add(v),this.animals.push({root:R,mesh:v,phase:2});for(let x=0;x<7;x++){const M=new ct;M.add(Ve(Ue(x%2?"#f3c469":"#f08e6e"),0,.1,0,.2,.15,.35),Ve(Be.black,.12,.16,.23,.025));const D=He(new Ot(.18,.27,3),Be.orange,0,.1,-.4);D.rotation.x=-Math.PI/2,M.add(D);const U=this.place(new ct,.18+(x-3)*.045,-.63+Math.sin(x)*.03,.07);U.add(M),this.animals.push({root:U,mesh:M,phase:x+.5})}const m=new ct;m.add(He(new wt(.035,.035,1.3,6),Be.trunk,0,.65,0)),m.add(He(new Ot(.65,.35,10),Ue("#f0a191"),0,1.3,0)),this.place(m,.43,-.23)}createClouds(){const n=oa(36);for(let t=0;t<9;t++){const i=new ct,o=Ue("#ffffff",{transparent:!0,opacity:.86,depthWrite:!1});for(let d=0;d<4;d++)i.add(Ve(o,(d-1.5)*.48,Math.sin(d)*.14,0,.48+Math.sin(d)*.12,.29,.37));const a=t/9*Math.PI*2;i.position.set(Math.cos(a)*17,Math.sin(a)*13,-1.5-n()*6),i.rotation.z=a*.3,this.scene.add(i),this.clouds.push(i)}}makePlayer(){this.player.add(this.body),this.body.add(Ve(Be.orange,0,.53,0,.29,.36,.23)),this.body.add(Ve(Be.cream,0,.51,.18,.18,.23,.08)),this.body.add(Ve(Be.orange,0,1.04,.04,.39,.34,.3));for(const a of[-1,1]){const d=He(new Ot(.14,.33,3),Be.orange,a*.25,1.37,.02);d.rotation.z=-a*.17,this.body.add(d);const f=He(new Ot(.075,.21,3),Be.brown,a*.25,1.38,.08);f.rotation.z=-a*.17,this.body.add(f),this.body.add(Ve(Be.cream,a*.17,.93,.265,.2,.14,.11),Ve(Be.black,a*.14,1.09,.31,.039,.05,.028),Ve(Be.white,a*.13,1.105,.333,.011))}this.body.add(Ve(Be.black,0,.98,.385,.052,.039,.035));const n=He(new wt(.39,.41,.065,18),Ue("#eac475"),0,1.31,.09),t=He(new wt(.23,.31,.2,16),Ue("#f2d28b"),0,1.43,.04);this.body.add(n,t,He(new wt(.302,.31,.065,16),Ue("#829c68"),0,1.35,.04)),this.body.add(Ve(Ue("#617e5b"),0,.59,-.23,.25,.27,.13)),this.body.add(He(new Ut(.14,.08,.06),Ue("#ead4a0"),0,.65,-.37));for(const[a,d]of[[this.leftLeg,-.15],[this.rightLeg,.15]])a.position.set(d,.32,0),a.add(Ve(Be.orange,0,-.12,0,.105,.16,.1),Ve(Be.brown,0,-.25,.065,.12,.075,.16)),this.body.add(a);for(const[a,d]of[[this.leftArm,-.31],[this.rightArm,.31]])a.position.set(d,.7,0),a.add(Ve(Be.orange,0,-.12,0,.095,.21,.095),Ve(Be.brown,0,-.27,.015,.09)),this.body.add(a);this.tail.position.set(0,.42,-.2);const i=Ve(Be.orange,0,.09,-.29,.17,.19,.37);i.rotation.x=.45,this.tail.add(i,Ve(Be.cream,0,.22,-.53,.13,.14,.18)),this.body.add(this.tail);const o=He(new Oo(.42,32),new un({color:"#526146",transparent:!0,opacity:.19,depthWrite:!1}));o.rotation.x=-Math.PI/2,o.position.y=.018,this.player.add(o)}makeTreasures(){const n=new Bo;for(let i=0;i<10;i++){const o=i*Math.PI/5+Math.PI/2,a=i%2?.17:.35,d=Math.cos(o)*a,f=Math.sin(o)*a;i===0?n.moveTo(d,f):n.lineTo(d,f)}n.closePath();const t=new Go(n,{depth:.09,bevelEnabled:!0,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025});ra.forEach((i,o)=>{const a=new ct,d=Nt(i.lon,i.lat);Cn(a,d,Math.max(Ft,Ct(d).radius));const f=He(t,Ue("#ffce56",{emissive:"#e4a328",emissiveIntensity:.12}),0,1.04,0);a.add(f);const b=He(new Tn(.48,.018,4,32),new un({color:"#fff4bd",transparent:!0,opacity:.7}));b.rotation.x=Math.PI/2,b.position.y=.08,a.add(b),a.visible=!this.collected.has(i.id),this.scene.add(a),this.treasures.push({id:i.id,normal:d,group:a,star:f,index:o})})}resize(){const n=this.host.clientWidth,t=this.host.clientHeight;!n||!t||(this.renderer.setSize(n,t),this.camera.aspect=n/t,this.camera.updateProjectionMatrix())}listen(n,t,i,o){n.addEventListener(t,i,o),this.listeners.push(()=>n.removeEventListener(t,i,o))}bind(){const n=this.renderer.domElement;this.listen(window,"keydown",(t=>{if(this.paused||t.target instanceof HTMLInputElement)return;const i=t.key.toLowerCase();["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," ","+","=","-","m"].includes(i)&&(t.preventDefault(),this.unlockAudio(),i===" "&&!t.repeat?this.jump():i==="+"||i==="="?this.setZoom(this.targetZoom+.13):i==="-"?this.setZoom(this.targetZoom-.13):i==="m"?this.overview():this.keys.add(i))})),this.listen(window,"keyup",(t=>{this.keys.delete(t.key.toLowerCase())})),this.listen(window,"blur",(()=>this.clearInput())),this.listen(document,"visibilitychange",(()=>{document.hidden&&this.clearInput(),this.lastTime=performance.now()})),this.listen(n,"wheel",(t=>{t.preventDefault(),this.paused||this.setZoom(this.targetZoom-t.deltaY*.0012)}),{passive:!1}),this.listen(n,"pointerdown",(t=>{if(!this.paused&&(this.unlockAudio(),n.setPointerCapture(t.pointerId),this.pointerMap.set(t.pointerId,{x:t.clientX,y:t.clientY,startX:t.clientX,startY:t.clientY}),this.pointerMap.size===1&&(this.dragged=!1),this.pointerMap.size===2)){const[i,o]=[...this.pointerMap.values()];this.pinch=Math.hypot(i.x-o.x,i.y-o.y),this.dragged=!0}})),this.listen(n,"pointermove",(t=>{const i=this.pointerMap.get(t.pointerId);if(!i||this.paused)return;const o=t.clientX-i.x,a=t.clientY-i.y;if(i.x=t.clientX,i.y=t.clientY,this.pointerMap.size===2){const[d,f]=[...this.pointerMap.values()],b=Math.hypot(d.x-f.x,d.y-f.y);this.setZoom(this.targetZoom+(b-this.pinch)*.003),this.pinch=b;return}Math.hypot(i.x-i.startX,i.y-i.startY)>6&&(this.dragged=!0),this.dragged&&(this.yaw-=o*.006,this.pitch=La(this.pitch+a*.003,-.35,.45))})),this.listen(n,"pointerup",(t=>{this.pointerMap.get(t.pointerId)&&!this.dragged&&!this.paused&&this.walkAt(t.clientX,t.clientY),this.pointerMap.delete(t.pointerId)})),this.listen(n,"pointercancel",(t=>{this.pointerMap.delete(t.pointerId),this.dragged=!0}))}clearInput(){this.keys.clear(),this.joystick={x:0,y:0},this.pointerMap.clear()}setPaused(n){this.paused=n,this.clearInput(),this.target=null,this.marker.visible=!1}setZoom(n){this.targetZoom=La(n,0,1)}overview(){this.targetZoom=0,this.pitch=0,this.yaw=0,this.target=null,this.marker.visible=!1}go(n){this.unlockAudio();const t=Vo[n];this.travel={from:this.normal.clone(),to:Nt(t.lon,t.lat),t:0},this.target=null,this.marker.visible=!1,this.targetZoom=.92,this.yaw=0,this.pitch=0,this.chime([392,523],.14)}walkAt(n,t){const i=this.host.getBoundingClientRect();this.cursor.set((n-i.left)/i.width*2-1,-(t-i.top)/i.height*2+1),this.ray.setFromCamera(this.cursor,this.camera);const o=this.ray.intersectObjects([this.ground,this.sea],!1)[0];o&&(this.target=o.point.clone().normalize(),Cn(this.marker,this.target,Math.max(Ft,Ct(this.target).radius)+.045),this.marker.visible=!0,this.targetZoom<.45&&(this.targetZoom=.83))}jump(){this.paused||this.travel||(this.unlockAudio(),this.jumpHeight<.04&&(this.jumpVelocity=this.swimming?3.4:5,this.chime(this.swimming?[440,660]:[330,440],.07),this.swimming&&this.burst(this.normal.clone().multiplyScalar(Ft+.2),"#e4fff7",10)))}unlockAudio(){if(this.sound)try{this.audio??=new AudioContext,this.audio.state==="suspended"&&this.audio.resume()}catch{}}chime(n,t=.15){if(!this.sound||!this.audio)return;const i=this.audio.currentTime;n.forEach((o,a)=>{const d=this.audio.createOscillator(),f=this.audio.createGain();d.type="sine",d.frequency.value=o,f.gain.setValueAtTime(0,i+a*t),f.gain.linearRampToValueAtTime(.055,i+a*t+.02),f.gain.exponentialRampToValueAtTime(.001,i+(a+1)*t+.15),d.connect(f),f.connect(this.audio.destination),d.start(i+a*t),d.stop(i+(a+1)*t+.17)})}burst(n,t,i=20){const o=Ue(t,{emissive:t,emissiveIntensity:.15});for(let a=0;a<i;a++){const d=He(new Kn(.05+Math.random()*.035,0),o);d.position.copy(n),this.scene.add(d);const f=new ze((Math.random()-.5)*2,Math.random()*2,(Math.random()-.5)*2).addScaledVector(n.clone().normalize(),1.2);this.particles.push({mesh:d,v:f,life:1+Math.random()*.5})}}transport(n){const t=new ln().setFromUnitVectors(this.normal,n);this.cameraNorth.applyQuaternion(t).normalize(),this.heading.applyQuaternion(t).normalize(),this.normal.copy(n)}step(n){let t=new ze;const i=this.moving;if(this.moving=!1,this.travel){this.travel.t=Math.min(1,this.travel.t+n*.65);const m=this.travel.t,x=m*m*(3-2*m),M=new ln().setFromUnitVectors(this.travel.from,this.travel.to),D=new ln().identity().slerp(M,x);this.transport(this.travel.from.clone().applyQuaternion(D)),this.jumpHeight=Math.sin(m*Math.PI)*2,this.jumpVelocity=0,m>=1&&(this.travel=null,this.jumpHeight=0)}else{const m=(this.keys.has("arrowright")||this.keys.has("d")?1:0)-(this.keys.has("arrowleft")||this.keys.has("a")?1:0)+this.joystick.x,x=(this.keys.has("arrowup")||this.keys.has("w")?1:0)-(this.keys.has("arrowdown")||this.keys.has("s")?1:0)-this.joystick.y,M=this.cameraNorth.clone().applyAxisAngle(this.normal,this.yaw).normalize(),D=new ze().crossVectors(M,this.normal).normalize();if(Math.abs(m)+Math.abs(x)>.08)!i&&this.targetZoom<.35&&(this.targetZoom=.85),t.copy(M).multiplyScalar(x).addScaledVector(D,m),t.length()>1&&t.normalize(),this.target=null,this.marker.visible=!1;else if(this.target){const l=this.normal.angleTo(this.target);l<.025?(this.target=null,this.marker.visible=!1):t.copy(this.target).addScaledVector(this.normal,-this.target.dot(this.normal)).normalize().multiplyScalar(Math.min(1,l*jt/.8))}const U=this.swimming?3.45:3.7;if(t.lengthSq()>.004){this.moving=!0;const l=this.normal.clone().addScaledVector(t,n*U/jt).normalize();this.heading.lerp(t.clone().normalize(),Math.min(1,n*12)).normalize(),this.transport(l)}this.jumpVelocity-=n*13,this.jumpHeight=Math.max(0,this.jumpHeight+this.jumpVelocity*n),this.jumpHeight===0&&(this.jumpVelocity=0)}const o=Ct(this.normal);this.swimming=o.swimming;const a=Math.max(o.radius,Ft),d=this.heading.clone().addScaledVector(this.normal,-this.heading.dot(this.normal)).normalize(),f=new ze().crossVectors(this.normal,d).normalize(),b=new nn().makeBasis(f,this.normal,d);this.player.quaternion.setFromRotationMatrix(b);const v=this.swimming?Math.sin(this.elapsed*3)*.035:0;this.player.position.copy(this.normal).multiplyScalar(a+this.jumpHeight+(this.swimming?-.24:.025)+v);const R=this.elapsed*(this.swimming?9:12);this.body.position.y=this.moving&&!this.swimming?Math.abs(Math.sin(R))*.045:Math.sin(this.elapsed*2.5)*.012,this.leftLeg.rotation.x=this.moving?Math.sin(R)*.65:0,this.rightLeg.rotation.x=-this.leftLeg.rotation.x,this.leftArm.rotation.x=this.moving?-Math.sin(R)*.65:Math.sin(this.elapsed*2)*.04,this.rightArm.rotation.x=-this.leftArm.rotation.x,this.leftArm.rotation.z=this.swimming?-.95:-.12,this.rightArm.rotation.z=this.swimming?.95:.12,this.tail.rotation.y=Math.sin(this.elapsed*5)*.17,this.floatRing.visible=this.swimming,this.ripple.visible=this.swimming,Cn(this.ripple,this.normal,Ft+.035),this.ripple.scale.setScalar(1+(Math.sin(this.elapsed*5)+1)*.13);for(const m of this.treasures)m.group.visible&&(m.star.position.y=1.05+Math.sin(this.elapsed*2+m.index)*.12,m.star.rotation.y=this.elapsed*.8+m.index,!this.travel&&this.normal.angleTo(m.normal)*jt<1.15&&(m.group.visible=!1,this.collected.add(m.id),this.cb.discover(m.id),this.burst(m.group.position.clone().addScaledVector(m.normal,.8),"#ffdf70",22),this.chime([523,659,784,1047])));this.animals.forEach(m=>{m.mesh.rotation.y=Math.sin(this.elapsed*.6+m.phase)*.8,m.mesh.position.y=Math.max(0,Math.sin(this.elapsed*2+m.phase))*.06}),this.clouds.forEach((m,x)=>{m.position.x+=Math.sin(this.elapsed*.2+x)*n*.025});for(let m=this.particles.length-1;m>=0;m--){const x=this.particles[m];if(x.life-=n,x.life<=0){this.scene.remove(x.mesh),x.mesh.geometry.dispose(),this.particles.splice(m,1),this.particles.some(M=>M.mesh.material===x.mesh.material)||x.mesh.material.dispose();continue}x.mesh.position.addScaledVector(x.v,n),x.mesh.scale.setScalar(Math.min(1,x.life*2))}this.marker.scale.setScalar(1+Math.sin(this.elapsed*7)*.08)}updateCamera(n,t=!1){this.zoom=Kt.damp(this.zoom,this.targetZoom,4.2,n);const i=this.zoom,o=this.cameraNorth.clone().applyAxisAngle(this.normal,this.yaw),a=o.clone().negate(),d=this.camera.aspect,f=Math.max(48,13/(.86*d*Math.tan(Kt.degToRad(21)))),b=this.host.clientWidth,v=this.host.clientHeight;this.camera.setViewOffset(b,v,b>1e3?-b*.085*(1-i):0,v*.02*(1-i),b,v);const R=Kt.lerp(f,jt+5.1+this.pitch*8,i),m=Kt.lerp(5.5,7.5-this.pitch*4,i),x=this.normal.clone().multiplyScalar(R).addScaledVector(a,m),M=this.normal.clone().multiplyScalar(Kt.lerp(.8,jt+1.15,i));t?this.camera.position.copy(x):this.camera.position.lerp(x,1-Math.exp(-n*6)),this.camera.up.copy(o).multiplyScalar(1-i).addScaledVector(this.normal,i).normalize(),this.camera.lookAt(M),this.sun.position.copy(this.normal).multiplyScalar(28).addScaledVector(o,25).add(new ze(-18,12,0));for(const D of this.clouds)D.visible=i<.65}reset(n=[]){this.clearInput(),this.collected=new Set(n),this.treasures.forEach(t=>t.group.visible=!this.collected.has(t.id)),this.transport(Nt(-.37,.27)),this.cameraNorth.copy(Bt).addScaledVector(this.normal,-Bt.dot(this.normal)).normalize(),this.heading.copy(this.cameraNorth).negate(),this.jumpHeight=0,this.jumpVelocity=0,this.travel=null,this.overview()}snapshot(){return{position:this.normal.toArray(),radius:this.player.position.length(),surface:Ct(this.normal),swimming:this.swimming,zoom:this.zoom,targetZoom:this.targetZoom,moving:this.moving,paused:this.paused,found:[...this.collected],target:this.target?.toArray()??null,fps:this.fps,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,finite:this.camera.position.toArray().every(Number.isFinite)&&this.player.position.toArray().every(Number.isFinite),jump:this.jumpHeight,travel:!!this.travel}}dispose(){this.destroyed=!0,cancelAnimationFrame(this.raf),this.resizeObserver.disconnect(),this.listeners.forEach(n=>n()),this.renderer.domElement.removeEventListener("webglcontextlost",this.onContextLost),Ld(this.scene),this.renderer.dispose(),this.renderer.domElement.remove(),this.audio?.close()}}export{Dd as MiniWorld};
