struct Light {
    matrix: mat4x4<f32>;
    color: vec3<f32>;
};
struct Lights {
    lights: array<Light>;
};
[[group(0), binding(1)]] var<storage> lights: Lights;

struct Input {
    [[location(0)]] fragmentPosition: vec4<f32>;

    [[location(1)]] color: vec3<f32>;
};

type Output = vec4<f32>;

[[stage(fragment)]]

fn main(input: Input) -> [[location(0)]] Output {
    let materialColor = clamp(
        input.color,
        vec3<f32>(0.0, 0.0, 0.0),
        vec3<f32>(1.0, 1.0, 1.0),
    );

    var lightColor = vec3<f32>(0.0, 0.0, 0.0);
    for (
        var index = u32(0);
        index < arrayLength(&lights.lights);
        index = index + u32(1)
    ) {
        lightColor = lightColor +
            lights.lights[index].color *
            (1.0 / pow(distance(input.fragmentPosition, lights.lights[index].matrix * vec4<f32>(0.0, 0.0, 0.0, 1.0)), 2.0));
    };

    let finalColor = clamp(
        materialColor * lightColor,
        vec3<f32>(0.0, 0.0, 0.0),
        vec3<f32>(1.0, 1.0, 1.0),
    );

    return vec4<f32>(finalColor, 1.0);
};
