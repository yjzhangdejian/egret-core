/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="../utils/HashObject.ts"/>
/// <reference path="../utils/Logger.ts"/>

module ns_egret {
    /**
	 * @class ns_egret.StageDelegate
	 * @classdesc
     * StageDelegate负责处理屏幕适配策略
     * 有关屏幕适配策略，更多信息请了解 GitHub:理解egret的GameLauncher
     * @stable B 目前StageDelegate和HTML5有一定的耦合关系，之后会对其解耦，保证NativeApp的正确运行
	 * @extends ns_egret.HashObject
     */
    export class StageDelegate extends HashObject{
        private static instance:StageDelegate;

		/**
		 * @method ns_egret.StageDelegate.getInstance
		 * @returns {StageDelegate}
		 */
        public static getInstance():StageDelegate {
            if (StageDelegate.instance == null) {
                ContainerStrategy.initialize();
                ContentStrategy.initialize();
                StageDelegate.instance = new StageDelegate();
            }
            return StageDelegate.instance;
        }

		/**
		 * @member ns_egret.StageDelegate.canvas_name
		 */
        public static canvas_name:string = "gameCanvas";
		/**
		 * @member ns_egret.StageDelegate.canvas_div_name
		 */
        public static canvas_div_name:string = "gameDiv";

        private _designWidth:number = 0;
        private _designHeight:number = 0;
        private _originalDesignWidth:number = 0;
        private _originalDesignHeight:number = 0;
        public _scaleX = 1;
        public _scaleY = 1;

        private _resolutionPolicy;

		/**
		 * @method ns_egret.StageDelegate#constructor
		 */
        public constructor() {
            super();
            var canvas:any = document.getElementById(StageDelegate.canvas_name);
            var w = canvas.width, h = canvas.height;
            this._designWidth = w;
            this._designHeight = h;
            this._originalDesignWidth = w;
            this._originalDesignHeight = h;

        }

		/**
		 * @method ns_egret.StageDelegate#setDesignSize
		 * @param width {number}
		 * @param height {{number}}
		 * @param resolutionPolicy {any}
		 */
        public setDesignSize(width:number, height:number, resolutionPolicy):void {
            // Defensive code
            if (isNaN(width) || width == 0 || isNaN(height) || height == 0) {
                ns_egret.Logger.info("Resolution Error");
                return;
            }
            this.setResolutionPolicy(resolutionPolicy);


            this._designWidth = width;
            this._designHeight = height;
            this._originalDesignWidth = width;
            this._originalDesignHeight = height;

            this._resolutionPolicy._apply(this, this._designWidth, this._designHeight);
        }

		/**
		 * @method ns_egret.StageDelegate#setResolutionPolicy
		 * @param resolutionPolic {any} 
		 */
        public setResolutionPolicy(resolutionPolicy):void {
            if (resolutionPolicy instanceof ResolutionPolicy) {
                this._resolutionPolicy = resolutionPolicy;
            }
            else {
                switch (resolutionPolicy) {
                    case ResolutionPolicy.FIXED_HEIGHT:
                        this._resolutionPolicy = new ResolutionPolicy(ContainerStrategy.EQUAL_TO_FRAME, ContentStrategy.FIXED_HEIGHT);
                        break;
                    case ResolutionPolicy.FIXED_WIDTH:
                        this._resolutionPolicy = new ResolutionPolicy(ContainerStrategy.EQUAL_TO_FRAME, ContentStrategy.FIXED_WIDTH);
                        break;
                }
            }
            if (this._resolutionPolicy != null)
                this._resolutionPolicy.init(this);
            else {
                ns_egret.Logger.fatal("需要先设置resolutionPolicy");
            }
        }

		/**
		 * @method ns_egret.StageDelegate#getScaleX
		 */
        public getScaleX():number {
            return this._scaleX;
        }

		/**
		 * @method ns_egret.StageDelegate#getScaleY
		 */
        public getScaleY():number {
            return this._scaleY;
        }
    }

	/**
	 * @class ns_egret.ResolutionPolicy
	 * @classdesc
	 */
    export class ResolutionPolicy {
		/**
		 * @constant ns_egret.ResolutionPolicy.FIXED_HEIGHT
		 */
        public static FIXED_HEIGHT = 1;
		/**
		 * @constant ns_egret.ResolutionPolicy.FIXED_WIDTH
		 */
        public static FIXED_WIDTH = 2;

        private _containerStrategy;
        private _contentStrategy;

        constructor(containerStg, contentStg) {
            this.setContainerStrategy(containerStg);
            this.setContentStrategy(contentStg);
        }

		/**
		 * @method ns_egret.ResolutionPolicy#init
		 * @param view {any}
		 */
        public init(view):void {
            this._containerStrategy.init(view);
            this._contentStrategy.init(view);
        }

		/**
		 * @method ns_egret.ResolutionPolicy#_apply
		 * @param view {any} 
		 * @param designedResolutionWidth {any} 
		 * @param designedResolutionHeigh {any} 
		 */
        public _apply(view, designedResolutionWidth, designedResolutionHeight) {
            this._containerStrategy._apply(view, designedResolutionWidth, designedResolutionHeight);
            this._contentStrategy._apply(view, designedResolutionWidth, designedResolutionHeight);
        }

		/**
		 * @method ns_egret.ResolutionPolicy#setContainerStrategy
		 * @param containerStg {any}
		 */
        public setContainerStrategy(containerStg):void {
            if (containerStg instanceof ContainerStrategy)
                this._containerStrategy = containerStg;
        }

		/**
		 * @method ns_egret.ResolutionPolicy#setContentStrategy
		 * @param contentStg {any}
		 */
        public setContentStrategy(contentStg):void {
            if (contentStg instanceof ContentStrategy)
                this._contentStrategy = contentStg;
        }
    }

	/**
	 * @class ns_egret.ContainerStrategy
	 * @classdesc
	 */
    export class ContainerStrategy {
		/**
		 * @constant ns_egret.ContainerStrategy.EQUAL_TO_FRAME
		 */
        public static EQUAL_TO_FRAME;

		/**
		 * @method ns_egret.ContainerStrategy.initialize
		 */
        public static initialize():void {
            ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
        }

		/**
		 * @method ns_egret.ContainerStrategy#init
		 * @param vie {any} 
		 */
        public init(view):void {

        }

		/**
		 * @method ns_egret.ContainerStrategy#_apply
		 * @param view {any} 
		 * @param designedWidth {any} 
		 * @param designedHeigh {any} 
		 */
        public _apply(view, designedWidth, designedHeight):void {
        }

        public _setupContainer():void {
            var body = document.body, style;
            if (body && (style = body.style)) {
                style.paddingTop = style.paddingTop || "0px";
                style.paddingRight = style.paddingRight || "0px";
                style.paddingBottom = style.paddingBottom || "0px";
                style.paddingLeft = style.paddingLeft || "0px";
                style.borderTop = style.borderTop || "0px";
                style.borderRight = style.borderRight || "0px";
                style.borderBottom = style.borderBottom || "0px";
                style.borderLeft = style.borderLeft || "0px";
                style.marginTop = style.marginTop || "0px";
                style.marginRight = style.marginRight || "0px";
                style.marginBottom = style.marginBottom || "0px";
                style.marginLeft = style.marginLeft || "0px";
            }
//            var contStyle = document.getElementById(ns_egret.StageDelegate.canvas_div_name).style;
//            contStyle.position = "fixed";
//            contStyle.left = contStyle.top = "0px";
//            document.body.scrollTop = 0;
        }
    }

	/**
	 * @class ns_egret.EqualToFrame
	 * @classdesc
	 * @extends ns_egret.ContainerStrategy
	 */
    export class EqualToFrame extends ContainerStrategy {
        public _apply(view) {
            this._setupContainer();
        }
    }

	/**
	 * @class ns_egret.ContentStrategy
	 * @classdesc
	 */
    export class ContentStrategy {
		/**
		 * @constant ns_egret.ContentStrategy.FIXED_HEIGHT
		 */
        public static FIXED_HEIGHT:ContentStrategy = null;
		/**
		 * @constant ns_egret.ContentStrategy.FIXED_WIDTH
		 */
        public static FIXED_WIDTH:ContentStrategy = null;

		/**
		 * @method ns_egret.ContentStrategy.initialize
		 */
        public static initialize():void {
            ContentStrategy.FIXED_HEIGHT = new FixedHeight();
            ContentStrategy.FIXED_WIDTH = new FixedWidth();
        }

		/**
		 * @method ns_egret.ContentStrategy#init
		 * @param vie {any} 
		 */
        public init(view):void {

        }

		/**
		 * @method ns_egret.ContentStrategy#_apply
		 * @param delegate {ns_egret.StageDelegate} 
		 * @param designedResolutionWidth {number} 
		 * @param designedResolutionHeight {number} 
		 */
        public _apply(delegate:ns_egret.StageDelegate, designedResolutionWidth:number, designedResolutionHeight:number):void{
        }
    }

	/**
	 * @class ns_egret.FixedHeight
	 * @classdesc
	 * @extends ns_egret.ContentStrategy
	 */
    export class FixedHeight extends ContentStrategy {
		/**
		 * @method ns_egret.FixedHeight#_apply
		 * @param delegate {any} 
		 * @param designedResolutionWidth {any} 
		 * @param designedResolutionHeight {any}
		 */
        public _apply(delegate, designedResolutionWidth, designedResolutionHeight):void {
            var canvas:any = document.getElementById(StageDelegate.canvas_name);
            var container:any = document.getElementById(StageDelegate.canvas_div_name);
            var containerW = canvas.width, containerH = canvas.height,
                designW = designedResolutionWidth, designH = designedResolutionHeight,
                scale = containerH / designH,
                contentW = designW * scale, contentH = containerH;

            var viewPortHeight = window.innerHeight;
            scale = viewPortHeight / designH;
            var viewPortWidth = designW * scale;
            canvas.width = designW;
            canvas.height = designH;
            canvas.style.width = viewPortWidth + "px";
            canvas.style.height = viewPortHeight + "px";
            container.style.width = viewPortWidth + "px";
            container.style.height = viewPortHeight + "px";
            delegate._scaleX = scale;
            delegate._scaleY = scale;
        }
    }

	/**
	 * @class ns_egret.FixedWidth
	 * @classdesc
	 * @extends ns_egret.ContentStrategy
	 */
    export class FixedWidth extends ContentStrategy {
		/**
		 * @method ns_egret.FixedWidth#_apply
		 * @param delegate {ns_egret.StageDelegate} 
		 * @param designedResolutionWidth {any} 
		 * @param designedResolutionHeight {any}
		 */
        public _apply(delegate:ns_egret.StageDelegate, designedResolutionWidth, designedResolutionHeight):void {
            var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(StageDelegate.canvas_name);
            var container:HTMLElement = document.getElementById(StageDelegate.canvas_div_name);
            var viewPortWidth = document.documentElement.clientWidth;
            var viewPortHeight = document.documentElement.clientHeight;
            var scale = viewPortWidth / designedResolutionWidth;
            canvas.width = designedResolutionWidth;
            canvas.height = viewPortHeight / scale;

            canvas.style.width = viewPortWidth + "px";
            canvas.style.height = viewPortHeight + "px";
            container.style.width = viewPortWidth + "px";
            container.style.height = viewPortHeight + "px";
            delegate._scaleX = scale;
            delegate._scaleY = scale;
        }
    }

	/**
	 * @class ns_egret.FixedSize
	 * @classdesc
	 * @extends ns_egret.ContentStrategy
	 */
    export class FixedSize extends ContentStrategy {

        private width;
        private height;

        constructor(width, height) {
            super();
            this.width = width;
            this.height = height;
        }

		/**
		 * @method ns_egret.FixedSize#_apply
		 * @param delegate {ns_egret.StageDelegate} 
		 * @param designedResolutionWidth {number} 
		 * @param designedResolutionHeight {number}
		 */
        public _apply(delegate:ns_egret.StageDelegate, designedResolutionWidth:number, designedResolutionHeight:number):void {
            var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(StageDelegate.canvas_name);
            var container:HTMLDivElement = <HTMLDivElement>document.getElementById(StageDelegate.canvas_div_name);
            var viewPortWidth = this.width;
            var viewPortHeight = this.height;
            var scale = viewPortWidth / designedResolutionWidth;
            canvas.width = designedResolutionWidth;
            canvas.height = viewPortHeight / scale;

            canvas.style.width = viewPortWidth + "px";
            canvas.style.height = viewPortHeight + "px";
            container.style.width = viewPortWidth + "px";
            container.style.height = viewPortHeight + "px";
            delegate._scaleX = scale;
            delegate._scaleY = scale;
        }


    }
}