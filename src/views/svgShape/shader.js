export const vertexShader = `
  varying vec2 vUv;
	varying vec3 fNormal;
	varying vec3 vPosition;
	void main()
	{
		vUv = uv;
		fNormal=normal;
		vPosition=position;

		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_Position = projectionMatrix * mvPosition;
	}
`;

export const fragmentShader = `
  uniform float time;
	varying vec2 vUv;
	uniform sampler2D colorTexture;
	uniform vec2 repeat;
	uniform sampler2D colorTexture1;
	varying vec3 fNormal;
	varying vec3 vPosition;
	uniform vec3 color;
	void main( void ) {
		vec2 position = vUv;
		vec3 tempNomal= normalize(fNormal);
		float power=step(0.95,abs(tempNomal.y));
		//vec4 colorb=texture2D(colorTexture1,position.xy);
		vec4 colorb= vec4(color,1.0);
		vec4 colora = texture2D(colorTexture,vec2((vUv*repeat).x,fract((vUv*repeat).y-time)));
		if(power>0.95){
			gl_FragColor =vec4(0);
		}else{
		gl_FragColor =colorb*colora;
			//gl_FragColor =vec4( (colorb).r*colora.r, (colorb).g*colora.g, (colorb).b*colora.b, (colora+colorb).a );
		}
	}
`;
