import { mat4, vec3 } from "gl-matrix";

const cameraMatrix = (size) => {
    const viewMatrix = mat4.create();
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 8);
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 2.5, 10));
    mat4.invert(viewMatrix, viewMatrix);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 3, size[0] / size[1], 1, 100);

    const cameraMatrix = mat4.create();
    mat4.multiply(cameraMatrix, viewMatrix, cameraMatrix);
    mat4.multiply(cameraMatrix, projectionMatrix, cameraMatrix);

    return cameraMatrix;
};

const instance1Matrix = mat4.create();
const instance1Color = vec3.fromValues(0.51, 0.09, 0.13);

const instance2Matrix = mat4.create();
mat4.translate(instance2Matrix, instance2Matrix, vec3.fromValues(0, 1.375, 0));
mat4.scale(instance2Matrix, instance2Matrix, vec3.fromValues(0.25, 0.25, 0.25));
const instance2Color = vec3.fromValues(1, 0, 1);

const instance3Matrix = mat4.create();
mat4.translate(instance3Matrix, instance3Matrix, vec3.fromValues(-2, 2, -2));
mat4.scale(instance3Matrix, instance3Matrix, vec3.fromValues(0.25, 0.25, 0.25));
const instance3Color = vec3.fromValues(1, 1, 1);

const instanceMatrices = [instance1Matrix, instance2Matrix, instance3Matrix];
const instanceColors = [instance1Color, instance2Color, instance3Color];

const light1Matrix = mat4.clone(instance3Matrix);
const light1Color = vec3.clone(instance3Color);
vec3.scale(light1Color, light1Color, 8);

const light2Matrix = mat4.clone(instance1Matrix);
const light2Color = vec3.clone(instance1Color);
vec3.scale(light2Color, light2Color, 0.5);

const lightMatrices = [light1Matrix, light2Matrix];
const lightColors = [light1Color, light2Color];

export {
    cameraMatrix,
    instanceMatrices,
    instanceColors,
    lightMatrices,
    lightColors,
};
