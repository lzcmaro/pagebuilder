/**
 * layout
 */
Layout = Backbone.View.extend({
	initialize: function(a) {
		this._control = a
	},
	render: function() {}
}),
BoxLayout = Layout.extend({
	initialize: function(a) {
		Layout.prototype.initialize.call(this, a)
	},
	render: function(a) {
		var c = this._control.children,
		d = a.createElement("div");
		for (var e = 0; e < c.length; e++) {
			var f = c[e];
			f.render(a);
			var g = f.getDeviceRenderedEl();
			$(d).append(g)
		}
		this.el = d
	},
	renderTo: function(a) {
		var b = this._control.children;
		for (var c = 0; c < b.length; c++) {
			var d = b[c],
			e = document.createElement("div");
			d.renderTo(e),
			$(a).append($(e).contents())
		}
	},
	quickRenderTo: function() {
		var a = document.createElement("div"),
		b = this._control.children;
		for (var c = 0; c < b.length; c++) {
			var d = b[c],
			e = document.createElement("div");
			d.renderTo(e),
			$(a).append($(e).contents())
		}
		return a
	}
}),
GridLayout = Layout.extend({
	initialize: function(a) {
		Layout.prototype.initialize.call(this, a),
		this._gridColMap = {
			0 : "a",
			1 : "b",
			2 : "c",
			3 : "d",
			4 : "e"
		}
	},
	render: function(a) {
		var c = this._control.children,
		d = a.createElement("div"),
		e = parseInt(this._control.rows.getValue()),
		f = parseInt(this._control.columns.getValue());
		for (var g = 0; g < c.length; g++) {
			var h = Math.floor(g / e),
			i = Math.floor(g % f),
			j = c[g];
			j.render(a);
			var k = this._gridColMap[i],
			l = j.getDeviceRenderedEl();
			l.removeClass("ui-block-a"),
			l.removeClass("ui-block-b"),
			l.removeClass("ui-block-c"),
			l.removeClass("ui-block-d"),
			l.removeClass("ui-block-e"),
			l.addClass("ui-block-" + k),
			$(d).append(l)
		}
		this.el = d
	},
	renderTo: function(a) {
		var b = this._control.children,
		c = parseInt(this._control.rows.getValue()),
		d = parseInt(this._control.columns.getValue());
		for (var e = 0; e < b.length; e++) {
			var f = Math.floor(e / c),
			g = Math.floor(e % d),
			h = b[e],
			i = document.createElement("div"),
			j = this._gridColMap[g];
			h.renderTo(i),
			$(":first", i).addClass("ui-block-" + j),
			$(a).append($(i).contents())
		}
	}
});
