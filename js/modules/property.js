/**
 * property 控件属性父类
 *
 */
Property = Backbone.View.extend({
	/**
	 * a, title
	 * b, widget
	 * c, default value
	 */
	initialize: function(a, b, c) {
		this._title = a,
		this.value = c,
		this._widget = b,
		b.setValue(this.value),
		this._defaultData = {
			value: this.value,
			_property_title: a
		}
	},
	setValue: function(a, b) {
		//撤销、重做时，如果动作类型为改变属性值，那么这里将会被设值。
		//而对于某些控件来说，它的属性值可能是具体的子控件，如：CollapsibleSetControl等。
		//这里的处理是为了避免这些控件无法更新它的items
		if(b && $.isArray(this.value)){
			var ol = this.value.length, nl = a.length;
			ol > nl && this.trigger("itemDeleted", this.value[ol - 1]),
			nl > ol && this.trigger("itemAdded", a[nl - 1])	
		}
		this.value = a,
		this._widget.setValue(a)
	},
	updateValue: function(a) {
		this.value = a,
		this._widget.updateValue(a)
	},
	getDefaultValue: function() {
		return this._defaultData.value
	},
	getValue: function() {
		return this.value
	},
	serialize: function() {
		var a = this._serializeProperty(this.value);
		return a
	},
	_serializeProperty: function(a) {
		if (typeof a == "object") {
			var b = {};
			for (var c in a) {
				var d = a[c];
				b[c] = this._serializeProperty(d)
			}
			return b
		}
		return a
	},
	render: function() {
		this.renderWidget()
	},
	renderWidget: function() {
		this._widget.render(this._defaultData._property_title)
	},
	getRenderedWidget: function() {
		return this._widget.el
	},
	bindWidgetEvent: function(a, b) {
		this._widget.bind(a, b, this)
	},
	getName: function() {
		return this._title
	},
	setName: function(a) {
		this._title = a,
		this._defaultData._property_title = a
	},
	getWidget: function() {
		return this._widget
	},
	handle: function(a) {}
});
_.extend(Property, Backbone.Events);
/**
 * 单一形式的属性
 */
ScalarProperty = Property.extend({
	/**
	 * a, title
	 * b, widget
	 * c, default value
	 */
	initialize: function(a, b, c) {
		Property.prototype.initialize.call(this, a, b, c);
		var d = this;
		/**
		 * a, new value
		 */
		this.bindWidgetEvent("valueChanged", function(a) {
			console.log("PROPERTY: value changed ", d.getName(), d.getValue(), a);
			var b = d.getValue();
			if (b == a) return;
			d.updateValue(a),
			d.trigger("valueChanged", a),
			d.trigger("propertyChanged", d, b, a)
		})
	}
});
_.extend(ScalarProperty, Backbone.Events);
/**
 * 数组形式的属性
 */
ArrayProperty = Property.extend({
	/**
	 * a, title
	 * b, widget
	 * c, default value
	 */
	initialize: function(a, b, c) {
		Property.prototype.initialize.call(this, a, b, c);
		var d = this;
		this.bindWidgetEvent("itemAdded", function(a) {
			var b = d.getValue().slice(0);
			d.addItem(a);
			var c = d.getValue().slice(0);
			d.trigger("itemAdded", a),
			d.trigger("propertyChanged", d, b, c, !0)
		}),
		/**
		 * a, index
		 * b, item data
		 */
		this.bindWidgetEvent("itemChanged", function(a, b) {
			console.log("PROPERTY: itemChanged", a, b);
			var c = d.getValue().slice(0),
			e = d.replaceItem(a, b),
			f = d.getValue().slice(0);
			d.trigger("itemChanged", b, e),
			d.trigger("propertyChanged", d, c, f)
		}),
		/**
		 * a, index
		 */
		this.bindWidgetEvent("itemDeleted", function(a) {
			var b = d.getValue().slice(0),
			c = d.removeItem(a),
			e = d.getValue().slice(0);
			d.trigger("itemDeleted", c),
			d.trigger("propertyChanged", d, b, e, !0)
		}),
		/**
		 * a, old index
		 * b, new index
		 */
		this.bindWidgetEvent("itemMoved", function(a, b) {
			var c = d.getValue().slice(0);
			d.moveItem(a, b);
			var e = d.getValue().slice(0);
			d.trigger("itemMoved", a, b),
			d.trigger("propertyChanged", d, c, e)
		})
	},
	addItem: function(a) {
		$.isArray(this.value) && this.value.push(a)
	},
	removeItem: function(a) {
		if ($.isArray(this.value) && a < this.value.length) {
			var b = this.value[a];
			return this.value.splice(a, 1),
			b
		}
		return null
	},
	moveItem: function(a, b) {
		if ($.isArray(this.value) && a < this.value.length && b < this.value.length) {
			var c = this.value[a];
			this.value.splice(a, 1),
			this.value.splice(b, 0, c)
		}
	},
	replaceItem: function(a, b) {
		if ($.isArray(this.value) && a < this.value.length) {
			var c = this.value[a];
			return this.value[a] = b,
			c
		}
		return null
	},
	size: function() {
		return this.value.length
	}
});