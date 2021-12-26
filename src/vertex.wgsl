struct Camera {
    matrix: mat4x4<f32>;
};
[[group(0), binding(0)]] var<uniform> camera: Camera;

struct Input {
    [[location(0)]] vertexPosition: vec4<f32>;

    [[location(1)]] matrixPart0: vec4<f32>; // The mat4x4 is split up because a vec4 is the maximum allowed size.
    [[location(2)]] matrixPart1: vec4<f32>;
    [[location(3)]] matrixPart2: vec4<f32>;
    [[location(4)]] matrixPart3: vec4<f32>;
    [[location(5)]] color: vec3<f32>;
};

struct Output {
    [[location(0)]] vertexPosition: vec4<f32>;
    [[builtin(position)]] vertexPositionScreen: vec4<f32>;

    [[location(1)]] color: vec3<f32>;
};

[[stage(vertex)]]
fn main(input: Input) -> Output {
    var output: Output;

    let inputMatrixAssembled = mat4x4<f32>(
        input.matrixPart0,
        input.matrixPart1,
        input.matrixPart2,
        input.matrixPart3,
    );
    output.vertexPosition = inputMatrixAssembled * input.vertexPosition;
    output.vertexPositionScreen = camera.matrix * inputMatrixAssembled * input.vertexPosition;

    output.color = input.color;

    return output;
};
