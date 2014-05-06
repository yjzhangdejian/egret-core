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

/// <reference path="../../../egret/display/DisplayObject.ts"/>
/// <reference path="../../../egret/events/Event.ts"/>
/// <reference path="../../../egret/events/TouchEvent.ts"/>
/// <reference path="supportClasses/ItemRenderer.ts"/>
/// <reference path="supportClasses/ListBase.ts"/>
/// <reference path="../core/UIGlobals.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="../events/IndexChangeEvent.ts"/>
/// <reference path="../events/ListEvent.ts"/>
/// <reference path="../events/RendererExistenceEvent.ts"/>
/// <reference path="../events/UIEvent.ts"/>

module ns_egret {

	export class List extends ListBase{
		public constructor(){
			super();
			this.useVirtualLayout = true;
		}
		
		/**
		 * @inheritDoc
		 */
		public createChildren():void{
			if(!this.itemRenderer)
				this.itemRenderer = ItemRenderer;
			super.createChildren();
		}
		
		/**
		 * 是否使用虚拟布局,默认true
		 */		
		public get useVirtualLayout():boolean{
			return super.useVirtualLayout;
		}
		
		/**
		 * @inheritDoc
		 */
		public set useVirtualLayout(value:boolean){
			super.useVirtualLayout = value;
		}
		
		
		private _allowMultipleSelection:boolean = false;
		/**
		 * 是否允许同时选中多项
		 */
		public get allowMultipleSelection():boolean{
			return this._allowMultipleSelection;
		}

		public set allowMultipleSelection(value:boolean){
			this._allowMultipleSelection = value;
		}

		private _selectedIndices:Vector.<number> = new Vector.<number>();
		
		private _proposedSelectedIndices:Vector.<number>; 
		/**
		 * 当前选中的一个或多个项目的索引列表
		 */		
		public get selectedIndices():Vector.<number>{
			if(this._proposedSelectedIndices)
				return this._proposedSelectedIndices;
			return this._selectedIndices;
		}

		public set selectedIndices(value:Vector.<number>){
			this.setSelectedIndices(value, false);
		}
		/**
		 * @inheritDoc
		 */
		public get selectedIndex():number{
			if(this._proposedSelectedIndices){
				if(this._proposedSelectedIndices.length>0)
					return this._proposedSelectedIndices[0];
				return -1;
			}
			return super.selectedIndex;
		}
		
		/**
		 * 当前选中的一个或多个项目的数据源列表
		 */		
		public get selectedItems():Vector.<Object>{
			var result:Vector.<Object> = new Vector.<Object>();
			var list:Vector.<number> = this.selectedIndices;
			if (list){
				var count:number = list.length;
				
				for (var i:number = 0; i < count; i++)
					result[i] = this.dataProvider.getItemAt(list[i]);  
			}
			
			return result;
		}
		
		public set selectedItems(value:Vector.<Object>){
			var indices:Vector.<number> = new Vector.<number>();
			
			if (value){
				var count:number = value.length;
				
				for (var i:number = 0; i < count; i++){
					var index:number = this.dataProvider.getItemIndex(value[i]);
					if (index != -1){ 
						indices.splice(0, 0, index);   
					}
					if (index == -1){
						indices = new Vector.<number>();
						break;  
					}
				}
			}
			this.setSelectedIndices(indices,false);
		}
		/**
		 * 设置多个选中项
		 */
		public setSelectedIndices(value:Vector.<number>, dispatchChangeEvent:boolean = false):void{
			if (dispatchChangeEvent)
				this.dispatchChangeAfterSelection = (this.dispatchChangeAfterSelection || dispatchChangeEvent);
			
			if (value)
				this._proposedSelectedIndices = value;
			else
				this._proposedSelectedIndices = new Vector.<number>();
			this.invalidateProperties();
		}
		
		/**
		 * @inheritDoc
		 */
		public commitProperties():void{
			super.commitProperties();
			if (this._proposedSelectedIndices){
				this.commitSelection();
			}
		}
		/**
		 * @inheritDoc
		 */
		public commitSelection(dispatchChangedEvents:boolean = true):boolean{
			var oldSelectedIndex:number = this._selectedIndex;
			if(this._proposedSelectedIndices){
				this._proposedSelectedIndices = this._proposedSelectedIndices.filter(this.isValidIndex);
				
				if (!this.allowMultipleSelection && this._proposedSelectedIndices.length>0){
					var temp:Vector.<number> = new Vector.<number>(); 
					temp.push(this._proposedSelectedIndices[0]); 
					this._proposedSelectedIndices = temp;  
				}
				if (this._proposedSelectedIndices.length>0){
					this._proposedSelectedIndex = this._proposedSelectedIndices[0];
				}
				else{
					this._proposedSelectedIndex = -1;
				}
			}
			
			var retVal:boolean = super.commitSelection(false); 
			
			if (!retVal){
				this._proposedSelectedIndices = null;
				return false; 
			}
			
			if (this.selectedIndex > this.NO_SELECTION){
				if (this._proposedSelectedIndices){
					if(this._proposedSelectedIndices.indexOf(this.selectedIndex) == -1)
						this._proposedSelectedIndices.push(this.selectedIndex);
				}
				else{
					this._proposedSelectedIndices = new <number>[this.selectedIndex];
				}
			}
			
			if(this._proposedSelectedIndices){
				if(this._proposedSelectedIndices.indexOf(oldSelectedIndex)!=-1)
					this.itemSelected(oldSelectedIndex,true);
				this.commitMultipleSelection(); 
			}
			
			if (dispatchChangedEvents && retVal){
				var e:IndexChangeEvent; 
				
				if (this.dispatchChangeAfterSelection){
					e = new IndexChangeEvent(IndexChangeEvent.CHANGE);
					e.oldIndex = oldSelectedIndex;
					e.newIndex = this._selectedIndex;
					this.dispatchEvent(e);
					this.dispatchChangeAfterSelection = false;
				}
				
				this.dispatchEvent(new UIEvent(UIEvent.VALUE_COMMIT));
			}
			
			return retVal; 
		}
		/**
		 * 是否是有效的索引
		 */		
		private isValidIndex(item:number, index:number, v:Vector.<number>):boolean{
			return this.dataProvider && (item >= 0) && (item < this.dataProvider.length); 
		}
		/**
		 * 提交多项选中项属性
		 */			
		public commitMultipleSelection():void{
			var removedItems:Vector.<number> = new Vector.<number>();
			var addedItems:Vector.<number> = new Vector.<number>();
			var i:number;
			var count:number;
			
			if (this._selectedIndices.length>0&& this._proposedSelectedIndices.length>0){
				count = this._proposedSelectedIndices.length;
				for (i = 0; i < count; i++){
					if (this._selectedIndices.indexOf(this._proposedSelectedIndices[i]) == -1)
						addedItems.push(this._proposedSelectedIndices[i]);
				}
				count = this._selectedIndices.length; 
				for (i = 0; i < count; i++){
					if (this._proposedSelectedIndices.indexOf(this._selectedIndices[i]) == -1)
						removedItems.push(this._selectedIndices[i]);
				}
			}
			else if (this._selectedIndices.length>0){
				removedItems = this._selectedIndices;
			}
			else if (this._proposedSelectedIndices.length>0){
				addedItems = this._proposedSelectedIndices;
			}
			
			this._selectedIndices = this._proposedSelectedIndices;
			
			if (removedItems.length > 0){
				count = removedItems.length;
				for (i = 0; i < count; i++){
					this.itemSelected(removedItems[i], false);
				}
			}
			
			if (addedItems.length>0){
				count = addedItems.length;
				for (i = 0; i < count; i++){
					this.itemSelected(addedItems[i], true);
				}
			}
			
			this._proposedSelectedIndices = null;
		}
		
		/**
		 * @inheritDoc
		 */
		public isItemIndexSelected(index:number):boolean{
			if (this._allowMultipleSelection)
				return this._selectedIndices.indexOf(index) != -1;
			
			return super.isItemIndexSelected(index);
		}

		/**
		 * @inheritDoc
		 */
		public dataGroup_rendererAddHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererAddHandler(event);
			
			var renderer:DisplayObject = <DisplayObject> (event.renderer);
			if (renderer == null)
				return;
			
			renderer.addEventListener(TouchEvent.TOUCH_BEGAN, this.item_mouseDownHandler, this);
			//由于ItemRenderer.mouseChildren有可能不为false，在鼠标按下时会出现切换素材的情况，
			//导致target变化而无法抛出原生的click事件,所以此处监听MouseUp来抛出ItemClick事件。
			renderer.addEventListener(TouchEvent.TOUCH_END, this.item_mouseUpHandler, this);
		}
		
		/**
		 * @inheritDoc
		 */
		public dataGroup_rendererRemoveHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererRemoveHandler(event);
			
			var renderer:DisplayObject = <DisplayObject> (event.renderer);
			if (renderer == null)
				return;
			
			renderer.removeEventListener(TouchEvent.TOUCH_BEGAN, this.item_mouseDownHandler, this);
			renderer.removeEventListener(TouchEvent.TOUCH_END, this.item_mouseUpHandler, this);
		}
		/**
		 * 是否捕获ItemRenderer以便在MouseUp时抛出ItemClick事件
		 */		
		public captureItemRenderer:boolean = true;
		
		private mouseDownItemRenderer:IItemRenderer;
		/**
		 * 鼠标在项呈示器上按下
		 */		
		public item_mouseDownHandler(event:TouchEvent):void{
			if (event.isDefaultPrevented())
				return;
			
			var itemRenderer:IItemRenderer = <IItemRenderer> (event.currentTarget);
			var newIndex:number
			if (itemRenderer)
				newIndex = itemRenderer.itemIndex;
			else
				newIndex = this.dataGroup.getElementIndex(<IVisualElement> (event.currentTarget));
			if(this._allowMultipleSelection){
				this.setSelectedIndices(this.calculateSelectedIndices(newIndex, event.shiftKey, event.ctrlKey), true);
			}
			else{
				this.setSelectedIndex(newIndex, true);
			}
			if(!this.captureItemRenderer)
				return;
			this.mouseDownItemRenderer = itemRenderer;
			UIGlobals.stage.addEventListener(TouchEvent.TOUCH_END,this.stage_mouseUpHandler,this,false,0,true);
			UIGlobals.stage.addEventListener(Event.LEAVE_STAGE,this.stage_mouseUpHandler,this,false,0,true);
		}
		/**
		 * 计算当前的选中项列表
		 */		
		private calculateSelectedIndices(index:number, shiftKey:boolean, ctrlKey:boolean):Vector.<number>{
			var i:number; 
			var interval:Vector.<number> = new Vector.<number>();  
			if (!shiftKey){
				if(ctrlKey){
					if (this._selectedIndices.length>0){
						if (this._selectedIndices.length == 1 && (this._selectedIndices[0] == index)){
							if (!this.requireSelection)
								return interval; 
							
							interval.splice(0, 0, this._selectedIndices[0]); 
							return interval; 
						}
						else{
							var found:boolean = false; 
							for (i = 0; i < this._selectedIndices.length; i++){
								if (this._selectedIndices[i] == index)
									found = true; 
								else if (this._selectedIndices[i] != index)
									interval.splice(0, 0, this._selectedIndices[i]);
							}
							if (!found){
								interval.splice(0, 0, index);   
							}
							return interval; 
						} 
					}
					else{ 
						interval.splice(0, 0, index); 
						return interval; 
					}
				}
				else { 
					interval.splice(0, 0, index); 
					return interval; 
				}
			}
			else {
				var start:number = this._selectedIndices.length>0 ? this._selectedIndices[this._selectedIndices.length - 1] : 0; 
				var end:number = index; 
				if (start < end){
					for (i = start; i <= end; i++){
						interval.splice(0, 0, i); 
					}
				}
				else {
					for (i = start; i >= end; i--){
						interval.splice(0, 0, i); 
					}
				}
				return interval; 
			}
		}

		/**
		 * 鼠标在项呈示器上弹起，抛出ItemClick事件。
		 */	
		private item_mouseUpHandler(event:TouchEvent):void{
			var itemRenderer:IItemRenderer = <IItemRenderer> (event.currentTarget);
			if(itemRenderer!=this.mouseDownItemRenderer)
				return;
			this.dispatchListEvent(event,ListEvent.ITEM_CLICK,itemRenderer);
		}
		
		/**
		 * 鼠标在舞台上弹起
		 */		
		private stage_mouseUpHandler(event:Event):void{
			UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_END,this.stage_mouseUpHandler,this);
			UIGlobals.stage.removeEventListener(Event.LEAVE_STAGE,this.stage_mouseUpHandler,this);
			this.mouseDownItemRenderer = null;
		}
	}
}