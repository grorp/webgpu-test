import { vec2, vec4 } from "gl-matrix";
import { positions, indices } from "./cube.js";
import {
    cameraMatrix,
    instanceMatrices,
    instanceColors,
    lightMatrices,
    lightColors,
} from "./scene.js";

import vertexWGSL from "./vertex.wgsl";
import fragmentWGSL from "./fragment.wgsl";

(async () => {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("webgpu");
    const contextFormat = context.getPreferredFormat(adapter);
    const contextSize = vec2.create();

    let depthTexture;

    const cameraBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    let contextNeedsConfigure = true;

    const configureContext = () => {
        if (contextNeedsConfigure) {
            contextNeedsConfigure = false;

            contextSize[0] = canvas.clientWidth * window.devicePixelRatio;
            contextSize[1] = canvas.clientHeight * window.devicePixelRatio;

            context.configure({
                device,
                format: contextFormat,
                size: contextSize,
            });

            if (depthTexture) {
                depthTexture.destroy();
            }
            depthTexture = device.createTexture({
                format: "depth32float",
                size: contextSize,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });

            device.queue.writeBuffer(
                cameraBuffer,
                0,
                cameraMatrix(contextSize),
            );
        }
    };

    window.addEventListener("resize", () => {
        contextNeedsConfigure = true;
    });
    const onDevicePixelRatioChange = () => {
        contextNeedsConfigure = true;

        window
            .matchMedia("(resolution: " + window.devicePixelRatio + "dppx)")
            .addEventListener("change", onDevicePixelRatioChange, {
                once: true,
            });
    };
    onDevicePixelRatioChange();

    const positionsBuffer = device.createBuffer({
        size: positions.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(positionsBuffer, 0, positions);

    const indicesBuffer = device.createBuffer({
        size: indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(indicesBuffer, 0, indices);

    const instances = instanceMatrices.length;

    const instancesBuffer = device.createBuffer({
        size: 80 * instances,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    for (const [index, matrix] of instanceMatrices.entries()) {
        device.queue.writeBuffer(instancesBuffer, 80 * index, matrix);
    }
    for (const [index, color] of instanceColors.entries()) {
        device.queue.writeBuffer(instancesBuffer, 80 * index + 64, color);
    }

    const lights = lightMatrices.length;

    const lightsBuffer = device.createBuffer({
        size: 80 * lights,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        // STORAGE instead of UNIFORM because STORAGE allows us to use dynamically sized arrays.
    });
    for (const [index, matrix] of lightMatrices.entries()) {
        device.queue.writeBuffer(lightsBuffer, 80 * index, matrix);
    }
    for (const [index, color] of lightColors.entries()) {
        device.queue.writeBuffer(lightsBuffer, 80 * index + 64, color);
    }

    const pipeline = device.createRenderPipeline({
        primitive: {
            topology: "triangle-list",
        },

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
                            shaderLocation: 0,
                            format: "float32x4",
                            offset: 0,
                        },
                    ],
                },
                {
                    arrayStride: 80,
                    stepMode: "instance",
                    attributes: [
                        {
                            shaderLocation: 1,
                            format: "float32x4",
                            offset: 0,
                        },
                        {
                            shaderLocation: 2,
                            format: "float32x4",
                            offset: 16,
                        },
                        {
                            shaderLocation: 3,
                            format: "float32x4",
                            offset: 32,
                        },
                        {
                            shaderLocation: 4,
                            format: "float32x4",
                            offset: 48,
                        },
                        {
                            shaderLocation: 5,
                            format: "float32x4",
                            offset: 64,
                        },
                    ],
                },
            ],
        },

        fragment: {
            module: device.createShaderModule({
                code: fragmentWGSL,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: contextFormat,
                },
            ],
        },

        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: "less",
            format: "depth32float",
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
                    buffer: lightsBuffer,
                },
            },
        ],
    });

    const renderPass = {
        colorAttachments: [
            {
                loadValue: vec4.fromValues(0.0, 0.0, 0.0, 1.0),
                storeOp: "store",
            },
        ],
        depthStencilAttachment: {
            depthLoadValue: 1.0,
            depthStoreOp: "store",

            stencilLoadValue: 1.0,
            stencilStoreOp: "store",
        },
    };

    const render = () => {
        configureContext();

        renderPass.colorAttachments[0].view = context
            .getCurrentTexture()
            .createView();
        renderPass.depthStencilAttachment.view = depthTexture.createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPass);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setIndexBuffer(indicesBuffer, "uint32");
        passEncoder.setVertexBuffer(0, positionsBuffer);
        passEncoder.setVertexBuffer(1, instancesBuffer);
        passEncoder.drawIndexed(indices.length, instances);
        passEncoder.endPass();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
})();
