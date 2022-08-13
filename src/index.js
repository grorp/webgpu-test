import { vec2, vec4 } from "gl-matrix";
import cube from "./cube.js";
import scene from "./scene.js";
import vertexWGSL from "./vertex.wgsl";
import fragmentWGSL from "./fragment.wgsl";

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const canvas = document.getElementById("canvas");
const context = canvas.getContext("webgpu");
const canvasSize = vec2.fromValues(canvas.width, canvas.height);
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
    device,
    format: canvasFormat,
});

const texture = device.createTexture({
    size: canvasSize,
    sampleCount: 4,
    format: canvasFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
});
const textureView = texture.createView();

const depthTexture = device.createTexture({
    size: canvasSize,
    sampleCount: 4,
    format: "depth32float",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
});
const depthTextureView = depthTexture.createView();

const vertexBuffer = device.createBuffer({
    size: cube.vertices.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
});
new Float32Array(vertexBuffer.getMappedRange()).set(cube.vertices);
vertexBuffer.unmap();

const indexBuffer = device.createBuffer({
    size: cube.indices.byteLength,
    usage: GPUBufferUsage.INDEX,
    mappedAtCreation: true,
});
new Uint32Array(indexBuffer.getMappedRange()).set(cube.indices);
indexBuffer.unmap();

const instanceBuffer = device.createBuffer({
    size: scene.instanceBuffer.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
});
new Float32Array(instanceBuffer.getMappedRange()).set(
    new Float32Array(scene.instanceBuffer)
);
instanceBuffer.unmap();

const cameraBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const lightBuffer = device.createBuffer({
    size: scene.lightBuffer.byteLength,
    // STORAGE instead of UNIFORM because STORAGE allows us to use dynamically sized arrays.
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
});
new Float32Array(lightBuffer.getMappedRange()).set(
    new Float32Array(scene.lightBuffer)
);
lightBuffer.unmap();

const pipeline = device.createRenderPipeline({
    layout: "auto",

    vertex: {
        module: device.createShaderModule({
            code: vertexWGSL,
        }),
        entryPoint: "main",
        buffers: [
            {
                arrayStride: 16,
                stepMode: "vertex",
                attributes: [
                    {
                        format: "float32x4",
                        offset: 0,
                        shaderLocation: 0,
                    },
                ],
            },
            {
                arrayStride: 80,
                stepMode: "instance",
                attributes: [
                    {
                        format: "float32x4",
                        offset: 0,
                        shaderLocation: 1,
                    },
                    {
                        format: "float32x4",
                        offset: 16,
                        shaderLocation: 2,
                    },
                    {
                        format: "float32x4",
                        offset: 32,
                        shaderLocation: 3,
                    },
                    {
                        format: "float32x4",
                        offset: 48,
                        shaderLocation: 4,
                    },
                    {
                        format: "float32x3",
                        offset: 64,
                        shaderLocation: 5,
                    },
                ],
            },
        ],
    },

    primitive: {
        topology: "triangle-list",
        cullMode: "back",
    },

    depthStencil: {
        format: "depth32float",
        depthWriteEnabled: true,
        depthCompare: "less",
    },

    multisample: {
        count: 4,
    },

    fragment: {
        module: device.createShaderModule({
            code: fragmentWGSL,
        }),
        entryPoint: "main",
        targets: [
            {
                format: canvasFormat,
            },
        ],
    },
});

const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        {
            binding: 0,
            resource: {
                buffer: cameraBuffer,
            },
        },
        {
            binding: 1,
            resource: {
                buffer: lightBuffer,
            },
        },
    ],
});

const render = () => {
    scene.updateCameraBuffer(canvasSize);
    device.queue.writeBuffer(cameraBuffer, 0, scene.cameraBuffer);

    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
            {
                view: textureView,
                resolveTarget: context.getCurrentTexture().createView(),

                loadOp: "clear",
                clearValue: vec4.fromValues(0, 0, 0, 1),
                storeOp: "store",
            },
        ],

        depthStencilAttachment: {
            view: depthTextureView,

            depthLoadOp: "clear",
            depthClearValue: 1.0,
            depthStoreOp: "store",
        },
    });
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setIndexBuffer(indexBuffer, "uint32");
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setVertexBuffer(1, instanceBuffer);
    passEncoder.drawIndexed(cube.indices.length, scene.instances);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
};

requestAnimationFrame(render);
