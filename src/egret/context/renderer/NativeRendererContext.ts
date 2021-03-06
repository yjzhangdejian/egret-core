/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/// <reference path="../NativeContext.d.ts"/>
/// <reference path="RendererContext.ts"/>
/// <reference path="../../display/Graphics.ts"/>
/// <reference path="../../display/Texture.ts"/>
/// <reference path="../../geom/Matrix.ts"/>
/// <reference path="../../text/TextField.ts"/>
/// <reference path="../../utils/HashObject.ts"/>
/// <reference path="../../utils/Profiler.ts"/>
/// <reference path="../../context/NativeContext.d.ts"/>

module egret {
    /**
     * @class egret.NativeRendererContext
     * @classdesc
     * NativeRendererContext 是引擎在Native上的渲染上下文。
     * @extends egret.HashObject
     */
    export class NativeRendererContext extends HashObject {


        /**
         * 渲染全部纹理的时间开销
         * @readonly
         * @member egret.NativeRendererContext#renderCost
         */
        public renderCost:number = 0;

        /**
         * 绘制纹理的缩放比率，默认值为1
         * @member egret.NativeRendererContext#texture_scale_factor
         */
        public texture_scale_factor:number = 1;

        /**
         * @method egret.NativeRendererContext#constructor
         */
        public constructor() {
            super();
        }

        /**
         * @method egret.NativeRendererContext#clearScreen
         * @private
         */
        public clearScreen() {
            egret_native.Graphics.clearScreen(255, 255, 255);
        }


        /**
         * 清除Context的渲染区域
         * @method egret.NativeRendererContext#clearRect
         * @param x {number}
         * @param y {number}
         * @param w {number}
         * @param h {numbe}
         */
        public clearRect(x:number, y:number, w:number, h:number) {
        }

        /**
         * 绘制图片
         * @method egret.NativeRendererContext#drawImage
         * @param texture {Texture}
         * @param sourceX {any}
         * @param sourceY {any}
         * @param sourceWidth {any}
         * @param sourceHeight {any}
         * @param destX {any}
         * @param destY {any}
         * @param destWidth {any}
         * @param destHeigh {any}
         */
        public drawImage(texture:Texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight) {

            egret_native.Graphics.drawImage(texture._bitmapData, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

            Profiler.getInstance().onDrawImage();
        }

        /**
         * 变换Context的当前渲染矩阵
         * @method egret.NativeRendererContext#setTransform
         * @param matrix {egret.Matrix}
         * @stable A
         */
        public setTransform(matrix:egret.Matrix) {
            egret_native.Graphics.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        }

        /**
         * @method egret.NativeRendererContext#save
         * @stable C 这个方法以后会和restore一起删除，移动到HTML5CanvasContext的具体实现中，而不是作为一个接口
         */
        public save() {

        }

        /**
         * @method egret.NativeRendererContext#restore
         * @stable C 这个方法以后会和save一起删除，移动到HTML5CanvasContext的具体实现中，而不是作为一个接口
         */
        public restore() {

        }

        /**
         * 设置渲染alpha
         * @method egret.NativeRendererContext#setAlpha
         * @param value {number}
         * @stable A
         * @param blendMode {egret.BlendMode}
         */
        public setAlpha(value:number, blendMode:egret.BlendMode) {
            egret_native.Graphics.setGlobalAlpha(value);
        }


        /**
         * 设置渲染文本参数
         * @method egret.NativeRendererContext#setupFont
         * @param textField {TextField}
         */
        public setupFont(textField:TextField):void {
            egret_native.Label.createLabel("/system/fonts/DroidSansFallback.ttf", textField.size, "");
            egret_native.Label.setTextAlignment(textField.textAlign);
            this.__hackTextFieldSize = textField.size;
        }

        private __hackTextFieldSize:number = 0;


        /**
         * 测量文本
         * @method egret.NativeRendererContext#measureText
         * @param text {string}
         * @returns {number}
         */
        public measureText(text:string):number {
            return text.length * this.__hackTextFieldSize;
        }

        /**
         * 绘制文本
         * @method egret.NativeRendererContext#drawText
         * @param textField {egret.TextField}
         * @param text {string}
         * @param x {number}
         * @param y {number}
         * @param maxWidth {numbe}
         */
        public drawText(textField:egret.TextField, text:string, x:number, y:number, maxWidth:number) {
            Profiler.getInstance().onDrawImage();
            egret_native.Label.setTextColor(textField.textColor);
            egret_native.Label.drawText(text, x, y);
        }

        /**
         * 矩形遮罩
         * @method egret.NativeRendererContext#clip
         * @param x {any}
         * @param y {any}
         * @param w {any}
         */
        public clip(x, y, w, h) {
        }
    }
}

egret.Graphics.prototype._draw = function(){};