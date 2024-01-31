class RendererWebGL {
    cameraPos = new V2(0, 0);
    cameraVel = new V2(0, 0);
    resolution = new V2(0, 0);
    unitsPerPixel = 1.0;

    vertexAttribs = {
        "meshPosition": 0,
        "circleCenter": 1,
        "circleRadius": 2,
        "circleColor": 3,
        "letterSlot": 4,
    };

    constructor(gl, ext) {
        this.gl = gl;
        this.ext = ext;
        this.circlesCount = 0;
        this.messages = [];

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Bitmap Font
        {
            const bitmapFontImage = document.getElementById('bitmap-font');
            let bitmapFontTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, bitmapFontTexture);
            gl.texImage2D(
                gl.TEXTURE_2D,    // target
                0,                // level
                gl.RGBA,          // internalFormat
                gl.RGBA,          // srcFormat
                gl.UNSIGNED_BYTE, // srcType
                bitmapFontImage   // image
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        // Mesh Position
        {
            this.meshPositionBufferData = new Float32Array(TRIANGLE_PAIR * TRIANGLE_VERTICIES * VEC2_COUNT);
            for (let triangle = 0; triangle < TRIANGLE_PAIR; ++triangle) {
                for (let vertex = 0; vertex < TRIANGLE_VERTICIES; ++vertex) {
                    const quad = triangle + vertex;
                    const index =
                          triangle * TRIANGLE_VERTICIES * VEC2_COUNT +
                          vertex * VEC2_COUNT;
                    this.meshPositionBufferData[index + VEC2_X] = (2 * (quad & 1) - 1);
                    this.meshPositionBufferData[index + VEC2_Y] = (2 * ((quad >> 1) & 1) - 1);
                }
            }

            this.meshPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.meshPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.meshPositionBufferData, gl.STATIC_DRAW);

            const meshPositionAttrib = this.vertexAttribs['meshPosition'];
            gl.vertexAttribPointer(
                meshPositionAttrib,
                VEC2_COUNT,
                gl.FLOAT,
                false,
                0,
                0);
            gl.enableVertexAttribArray(meshPositionAttrib);
        }

        // Circle Center
        {
            this.circleCenterBufferData = new Float32Array(VEC2_COUNT * CIRCLE_BATCH_CAPACITY);
            this.circleCenterBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.circleCenterBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.circleCenterBufferData, gl.DYNAMIC_DRAW);

            const circleCenterAttrib = this.vertexAttribs['circleCenter'];
            gl.vertexAttribPointer(
                circleCenterAttrib,
                VEC2_COUNT,
                gl.FLOAT,
                false,
                0,
                0);
            gl.enableVertexAttribArray(circleCenterAttrib);
            ext.vertexAttribDivisorANGLE(circleCenterAttrib, 1);
        }

        // Circle Radius
        {
            this.circleRadiusBufferData = new Float32Array(CIRCLE_BATCH_CAPACITY);
            this.circleRadiusBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.circleRadiusBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.circleRadiusBufferData, gl.DYNAMIC_DRAW);

            const circleRadiusAttrib = this.vertexAttribs['circleRadius'];
            gl.vertexAttribPointer(
                circleRadiusAttrib,
                1,
                gl.FLOAT,
                false,
                0,
                0);
            gl.enableVertexAttribArray(circleRadiusAttrib);
            ext.vertexAttribDivisorANGLE(circleRadiusAttrib, 1);
        }

        // Circle Color
        {
            this.circleColorBufferData = new Float32Array(RGBA_COUNT * CIRCLE_BATCH_CAPACITY);
            this.circleColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.circleColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.circleColorBufferData, gl.DYNAMIC_DRAW);

            const circleColorAttrib = this.vertexAttribs['circleColor'];
            gl.vertexAttribPointer(
                circleColorAttrib,
                RGBA_COUNT,
                gl.FLOAT,
                false,
                0,
                0);
            gl.enableVertexAttribArray(circleColorAttrib);
            ext.vertexAttribDivisorANGLE(circleColorAttrib, 1);
        }


        // Letter Slot
        {
            this.letterSlotBufferData = new Float32Array(LETTER_SLOTS_CAPACITY * VEC2_COUNT);

            this.letterSlotBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.letterSlotBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.letterSlotBufferData, gl.DYNAMIC_DRAW);
            
            const letterSlotAttrib = this.vertexAttribs['letterSlot'];
            gl.vertexAttribPointer(
                letterSlotAttrib,
                LETTER_SLOT_COUNT,
                gl.FLOAT,
                false,
                0,
                0);
            gl.enableVertexAttribArray(letterSlotAttrib);
            ext.vertexAttribDivisorANGLE(letterSlotAttrib, 1);
        }

        this.backgroundProgram = new BackgroundProgram(gl, this.vertexAttribs);
        this.circlesProgram = new CirclesProgram(gl, ext, this.vertexAttribs);
        this.bitmapFontProgram = new BitmapFontProgram(gl, ext, this.vertexAttribs);
    }

    // RENDERER INTERFACE //////////////////////////////
    setTimestamp(timestamp) {
        this.timestamp = timestamp;
    }

    setViewport(width, height) {
        this.gl.viewport(0, 0, width, height);
        this.resolution.x = width;
        this.resolution.y = height;

        const scale = Math.min(
            width / DEFAULT_RESOLUTION.w,
            height / DEFAULT_RESOLUTION.h,
        );

        this.unitsPerPixel = 1 / scale;
    }

    setTarget(target) {
        this.cameraVel = target.sub(this.cameraPos);
    }

    update(dt) {
        this.cameraPos = this.cameraPos.add(this.cameraVel.scale(dt));
    }

    present() {
        // Update All dynamic buffers
        {
            // TODO: bufferSubData should probably use subview of this Float32Array if that's even possible
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.circleCenterBuffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.circleCenterBufferData);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.circleRadiusBuffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.circleRadiusBufferData);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.circleColorBuffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.circleColorBufferData);
        }

        // Call the Background Program
        {
            this.backgroundProgram.use();
            this.backgroundProgram.setCameraPosition(this.cameraPos);
            this.backgroundProgram.setViewport(this.resolution.x, this.resolution.y);
            this.backgroundProgram.setTimestamp(this.timestamp);
            this.backgroundProgram.draw(this.circlesCount);
        }

        // Call the Circles Program
        {
            this.circlesProgram.use();
            this.circlesProgram.setCameraPosition(this.cameraPos);
            this.circlesProgram.setViewport(this.resolution.x, this.resolution.y);
            this.circlesProgram.setGrayness(this.grayness);
            this.circlesProgram.draw(this.circlesCount);
        }

        // Call the Bitmap Font Program
        {
            this.bitmapFontProgram.use();
            this.bitmapFontProgram.setViewport(this.resolution.x, this.resolution.y);
            this.bitmapFontProgram.setTimestamp(this.timestamp);

            const scale = FONT_MESSAGE_SCALE * (1.0 / this.unitsPerPixel);
            this.bitmapFontProgram.setMessageScale(scale);
            for (let [text, color] of this.messages) {
                this.bitmapFontProgram.setColor(color);

                const lines = text.split('\n');
                const message_height = lines.length * FONT_CHAR_HEIGHT * scale;
                for (let row = 0; row < lines.length; ++row) {
                    const line = lines[row];

                    this.bitmapFontProgram.setMessagePosition(
                        line.length * FONT_CHAR_WIDTH * scale * -0.5,
                        message_height * 0.5 - (row + 1) * FONT_CHAR_HEIGHT * scale);

                    for (let i = 0; i < line.length && i < this.letterSlotBufferData.length; ++i) {
                        this.letterSlotBufferData[i * LETTER_SLOT_COUNT + LETTER_SLOT_CODE] = line.charCodeAt(i);
                        this.letterSlotBufferData[i * LETTER_SLOT_COUNT + LETTER_SLOT_COL] = i;
                    }
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.letterSlotBuffer);
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.letterSlotBufferData);

                    this.bitmapFontProgram.draw(line.length);
                }
            }
        }
    }

    clear() {
        this.circlesCount = 0;
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.messages.length = 0;
    }

    background() {
        // TODO: RendererWebGL.background() is not implemented
    }

    fillCircle(center, radius, color) {
        if (this.circlesCount < CIRCLE_BATCH_CAPACITY) {
            this.circleCenterBufferData[this.circlesCount * VEC2_COUNT + VEC2_X] = center.x;
            this.circleCenterBufferData[this.circlesCount * VEC2_COUNT + VEC2_Y] = center.y;

            this.circleRadiusBufferData[this.circlesCount] = radius;

            this.circleColorBufferData[this.circlesCount * RGBA_COUNT + RGBA_R] = color.r;
            this.circleColorBufferData[this.circlesCount * RGBA_COUNT + RGBA_G] = color.g;
            this.circleColorBufferData[this.circlesCount * RGBA_COUNT + RGBA_B] = color.b;
            this.circleColorBufferData[this.circlesCount * RGBA_COUNT + RGBA_A] = color.a;

            this.circlesCount += 1;
        }
    }

    fillMessage(text, color) {
        this.messages.push([text, color]);
    }

    screenToWorld(point) {
        return point
            .sub(this.resolution.scale(0.5))
            .scale(this.unitsPerPixel)
            .add(this.cameraPos);
    }

    ////////////////////////////////////////////////////////////
}