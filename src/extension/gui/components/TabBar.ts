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

/// <reference path="../../../egret/events/Event.ts"/>
/// <reference path="../../../egret/events/TouchEvent.ts"/>
/// <reference path="../collections/ICollection.ts"/>
/// <reference path="supportClasses/ListBase.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="../events/IndexChangeEvent.ts"/>
/// <reference path="../events/ListEvent.ts"/>
/// <reference path="../events/RendererExistenceEvent.ts"/>
/// <reference path="../layouts/HorizontalAlign.ts"/>
/// <reference path="../layouts/HorizontalLayout.ts"/>
/// <reference path="../layouts/VerticalAlign.ts"/>

module ns_egret {

	export class TabBar extends ListBase{
		/**
		 * 构造函数
		 */		
		public constructor(){
			super();
			
			this.tabChildren = false;
			this.tabEnabled = true;
			this.requireSelection = true;
		}
		
		/**
		 * requireSelection改变标志
		 */
		private requireSelectionChanged:boolean;
		
		/**
		 * @inheritDoc
		 */
		public set requireSelection(value:boolean){
			if (value == this.requireSelection)
				return;
			
			super.requireSelection = value;
			this.requireSelectionChanged = true;
			this.invalidateProperties();
		}
		
		/**
		 * @inheritDoc
		 */
		public set dataProvider(value:ICollection){
			if(this.dataProvider instanceof ViewStack){
				this.dataProvider.removeEventListener("IndexChanged",this.onViewStackIndexChange,this);
				this.removeEventListener(IndexChangeEvent.CHANGE,this.onIndexChanged,this);
			}
			
			if(value instanceof ViewStack){
				value.addEventListener("IndexChanged",this.onViewStackIndexChange,this);
				this.addEventListener(IndexChangeEvent.CHANGE,this.onIndexChanged,this);
			}
			super.dataProvider = value;
		}
		/**
		 * 鼠标点击的选中项改变
		 */		
		private onIndexChanged(event:IndexChangeEvent):void{
			(<ViewStack> (this.dataProvider)).setSelectedIndex(event.newIndex,false);
		}
		
		/**
		 * ViewStack选中项发生改变
		 */		
		private onViewStackIndexChange(event:Event):void{
			this.setSelectedIndex((<ViewStack> (this.dataProvider)).selectedIndex, false);
		}
		
		
		/**
		 * @inheritDoc
		 */
		public commitProperties():void{
			super.commitProperties();
			
			if (this.requireSelectionChanged && this.dataGroup){
				this.requireSelectionChanged = false;
				const n:number = this.dataGroup.numElements;
				for (var i:number = 0; i < n; i++){
					var renderer:TabBarButton = <TabBarButton> (this.dataGroup.getElementAt(i));
					if (renderer)
						renderer.allowDeselection = !this.requireSelection;
				}
			}
		}  
		
		/**
		 * @inheritDoc
		 */
		public dataGroup_rendererAddHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererAddHandler(event);
			
			const renderer:IItemRenderer = event.renderer; 
			if (renderer){
				renderer.addEventListener(TouchEvent.TOUCH_TAP, this.item_clickHandler, this);
				if (renderer instanceof TabBarButton)
					(<TabBarButton> renderer).allowDeselection = !this.requireSelection;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public dataGroup_rendererRemoveHandler(event:RendererExistenceEvent):void{   
			super.dataGroup_rendererRemoveHandler(event);
			
			const renderer:IItemRenderer = event.renderer;
			if (renderer)
				renderer.removeEventListener(TouchEvent.TOUCH_TAP, this.item_clickHandler, this);
		}
		/**
		 * 鼠标在条目上按下
		 */		
		private item_clickHandler(event:TouchEvent):void{
			var itemRenderer:IItemRenderer = <IItemRenderer> (event.currentTarget);
			var newIndex:number
			if (itemRenderer)
				newIndex = itemRenderer.itemIndex;
			else
				newIndex = this.dataGroup.getElementIndex(<IVisualElement> (event.currentTarget));
			
			if (newIndex == this.selectedIndex){
				if (!this.requireSelection)
					this.setSelectedIndex(this.NO_SELECTION, true);
			}
			else
				this.setSelectedIndex(newIndex, true);
			this.dispatchListEvent(event,ListEvent.ITEM_CLICK,itemRenderer);
		}
		
		/**
		 * @inheritDoc
		 */
		public createSkinParts():void{
			this.dataGroup = new DataGroup();
			this.dataGroup.percentHeight = this.dataGroup.percentWidth = 100;
			this.dataGroup.clipAndEnableScrolling = true;
			var layout:HorizontalLayout = new HorizontalLayout();
			layout.gap = -1;
			layout.horizontalAlign = HorizontalAlign.JUSTIFY;
			layout.verticalAlign = VerticalAlign.CONTENT_JUSTIFY;
			this.dataGroup.layout = layout;
			this.addToDisplayList(this.dataGroup);
			this.partAdded("dataGroup",this.dataGroup);
		}
	}
}