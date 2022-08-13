struct Camera {
    matrix: mat4x4<f32>,
};
@group(0) @binding(0) var<uniform> camera: Camera;

struct Input {
    @location(0) vertexPosition: vec4<f32>,

    @location(1) instanceMat0: vec4<f32>, // We split the mat4x4 up because vec4 is the maximum allowed size.
    @location(2) instanceMat1: vec4<f32>,
    @location(3) instanceMat2: vec4<f32>,
    @location(4) instanceMat3: vec4<f32>,
    @location(5) instanceColor: vec3<f32>,
};

struct Output {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPosition: vec4<f32>,
    @location(1) color: vec3<f32>,
};

@vertex

fn main(input: Input) -> Output {
    let instanceMat = mat4x4<f32>(
        input.instanceMat0,
        input.instanceMat1,
        input.instanceMat2,
        input.instanceMat3,
    );

    var output: Output;

    output.position = camera.matrix * instanceMat * input.vertexPosition;
    output.worldPosition = instanceMat * input.vertexPosition;
    output.color = input.instanceColor;

    return output;
};
