uniform float time;
uniform float length;
uniform float progress;

varying vec2 vUv;
varying float vOffset;

void main()	{

  float o = fract(time);
  float offset = vUv.x + vOffset;

	if( abs(offset - o)>length && abs(offset - o - 1.)>length && abs(offset - o + 1.)>length )  {
		discard;
	}
	vec3 color = vec3(0.317, 0., 0.);
	float m = 1. - abs(2. * (vUv.x - 0.5));

	vec3 c = mix(color, vec3(1., 1., 1.), m * m * m * m);

	gl_FragColor = vec4(c,1.);
}
