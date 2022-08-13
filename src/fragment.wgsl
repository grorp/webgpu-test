struct Light {
    position: vec4<f32>,
    color: vec3<f32>,
};
struct Lights {
    lights: array<Light>,
};
@group(0) @binding(1) var<storage> lights: Lights;

struct Input {
    @location(0) worldPosition: vec4<f32>,
    @location(1) color: vec3<f32>,
};

@fragment

fn main(input: Input) -> @location(0) vec4<f32> {
    let materialColor = clamp(
        input.color,
        vec3<f32>(0.0, 0.0, 0.0),
        vec3<f32>(1.0, 1.0, 1.0),
    );

    var lightColor = vec3<f32>(0.0, 0.0, 0.0);
    for (
        var i: u32 = 0;
        i < arrayLength(&lights.lights);
        i++
    ) {
        lightColor = lightColor +
            lights.lights[i].color *
            (1.0 / pow(distance(lights.lights[i].position, input.worldPosition), 2.0));
    };

    let finalColor = clamp(
        materialColor * lightColor,
        vec3<f32>(0.0, 0.0, 0.0),
        vec3<f32>(1.0, 1.0, 1.0),
    );

    return vec4<f32>(finalColor, 1.0);
};
