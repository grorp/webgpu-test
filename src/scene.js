import { mat4, vec3, vec4 } from "gl-matrix";

const cameraBuffer = new ArrayBuffer(64);

const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const cameraMatrix = new Float32Array(cameraBuffer, 0, 16);

const updateCameraBuffer = (size) => {
    mat4.identity(viewMatrix);
    mat4.rotateY(viewMatrix, viewMatrix, performance.now() / 1000);
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, 120));
    mat4.invert(viewMatrix, viewMatrix);

    mat4.perspective(
        projectionMatrix,
        Math.PI * 0.4,
        size[0] / size[1],
        1,
        300
    );

    mat4.identity(cameraMatrix);
    mat4.multiply(cameraMatrix, viewMatrix, cameraMatrix);
    mat4.multiply(cameraMatrix, projectionMatrix, cameraMatrix);
};

const instances = 10000;
const instanceBuffer = new ArrayBuffer(instances * 80);

for (let i = 0; i < instances; i++) {
    const instanceMatrix = new Float32Array(instanceBuffer, i * 80, 16);
    mat4.identity(instanceMatrix);
    mat4.translate(
        instanceMatrix,
        instanceMatrix,
        vec3.fromValues(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        )
    );
    mat4.scale(instanceMatrix, instanceMatrix, vec3.fromValues(10, 10, 10));

    const instanceColor = new Float32Array(instanceBuffer, i * 80 + 64, 3);
    vec3.set(instanceColor, Math.random(), Math.random(), Math.random());
}

const lights = 2;
const lightBuffer = new ArrayBuffer(lights * 32);

const lightPos1 = new Float32Array(lightBuffer, 0 * 32, 4);
vec4.set(lightPos1, -30, -30, -30, 1);

const lightColor1 = new Float32Array(lightBuffer, 0 * 32 + 16, 3);
vec3.set(lightColor1, 200, 200, 200);

const lightPos2 = new Float32Array(lightBuffer, 1 * 32, 4);
vec4.set(lightPos2, 30, 30, 30, 1);

const lightColor2 = new Float32Array(lightBuffer, 1 * 32 + 16, 3);
vec3.set(lightColor2, 200, 200, 200);

const scene = {
    cameraBuffer,
    updateCameraBuffer,
    instances,
    instanceBuffer,
    lights,
    lightBuffer,
};

export default scene;
