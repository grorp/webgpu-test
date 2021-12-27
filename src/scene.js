import { mat4, vec3 } from "gl-matrix";

const cameraBuffer = new ArrayBuffer(64);

const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const cameraMatrix = new Float32Array(cameraBuffer, 0, 16);

const updateCameraBuffer = (size) => {
    mat4.identity(viewMatrix);
    mat4.rotateY(viewMatrix, viewMatrix, performance.now() / 1000);
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, 120));
    mat4.invert(viewMatrix, viewMatrix);

    mat4.perspective(projectionMatrix, Math.PI / 3, size[0] / size[1], 1, 300);

    mat4.identity(cameraMatrix);
    mat4.multiply(cameraMatrix, viewMatrix, cameraMatrix);
    mat4.multiply(cameraMatrix, projectionMatrix, cameraMatrix);
};

const instances = 1000000;
const instancesBuffer = new ArrayBuffer(80 * instances);

for (let index = 0; index < instances; index = index + 1) {
    const instanceMatrix = new Float32Array(instancesBuffer, 80 * index, 16);
    mat4.identity(instanceMatrix);
    mat4.translate(
        instanceMatrix,
        instanceMatrix,
        vec3.fromValues(
            Math.random() * 60 - 30,
            Math.random() * 60 - 30,
            Math.random() * 60 - 30,
        ),
    );

    const instanceColor = new Float32Array(instancesBuffer, 80 * index + 64, 3);
    instanceColor[0] = Math.random();
    instanceColor[1] = Math.random();
    instanceColor[2] = Math.random();
}

const lights = 1;
const lightsBuffer = new ArrayBuffer(80 * lights);

const lightMatrix1 = new Float32Array(lightsBuffer, 0, 16);
mat4.identity(lightMatrix1);

const lightColor1 = new Float32Array(lightsBuffer, 64, 3);
lightColor1[0] = 360;
lightColor1[1] = 360;
lightColor1[2] = 360;

const scene = {
    cameraBuffer,
    updateCameraBuffer,
    instances,
    instancesBuffer,
    lights,
    lightsBuffer,
};

export default scene;
