// Stolen from https://docs.microsoft.com/en-us/windows/win32/direct3d9/defining-a-simple-cube :-)

const cube = {
    // prettier-ignore
    vertices: new Float32Array([
        0.5, 0.5, -0.5, 1,
        -0.5, 0.5, -0.5, 1,
        -0.5, 0.5, 0.5, 1,
        0.5, 0.5, 0.5, 1,
        0.5, -0.5, -0.5, 1,
        -0.5, -0.5, -0.5, 1,
        -0.5, -0.5, 0.5, 1,
        0.5, -0.5, 0.5, 1,
    ]),

    // prettier-ignore
    indices: new Uint32Array([
        0, 1, 2,
        0, 2, 3,
        0, 4, 5,
        0, 5, 1,
        1, 5, 6,
        1, 6, 2,
        2, 6, 7,
        2, 7, 3,
        3, 7, 4,
        3, 4, 0,
        4, 7, 6,
        4, 6, 5,
    ]),
};

export default cube;
