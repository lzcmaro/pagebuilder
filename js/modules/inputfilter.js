/**
 * filter
 *
 */
InputFilter = Backbone.Model.extend({
	accept: function() {}
}),
AcceptAllInputFilter = InputFilter.extend({
	accept: function() {
		return ! 0
	}
}),
AcceptPageIDInputFilter = InputFilter.extend({
	accept: function(a) {
		return a.indexOf(" ") >= 0 ? !1 : !0
	}
}),
AcceptUrlInputFilter = InputFilter.extend({
	accept: function(a) {
		return a.indexOf("http://") >= 0
	}
});