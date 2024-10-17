#include ../includes/perlin3DNoise.glsl

uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;



void main()
{
    // Displace the UV
    vec2 displacedUv = vUv + cnoise(vec3(vUv *5.0, uTime));

    // Perlin noise
    float strength = cnoise(vec3(displacedUv * 5.0, uTime)); // uTime makes the perlin noise dance around

    // Outer glow
    float outerGlow = distance(vUv, vec2(0.5)) * 5.0 - 1.4; // the additional math at the end makes it so the glow is stronger on the edges

    strength += outerGlow;

    // apply a step (makes the edges less smooth)
    strength += step( -0.2, strength) * 0.8; // the 0.8 is to make the edges less sharp

    // Clamp the value of Strength
    strength = clamp(strength, 0.0, 1.0);

    // Final Color
    vec3 color = mix(uColorStart, uColorEnd, strength);

    gl_FragColor = vec4(color, 1.0);
}