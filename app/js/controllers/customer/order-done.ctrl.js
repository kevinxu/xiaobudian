define([
  'utils',
  'template'
], function (Utils, Template) {

  var Module = {
    init: function (query) {

    	Utils.bindEvents(this.methods());
    },

    methods: function () {
      return [{
      	element: '#btn-view-orders',
      	event: 'click',
      	handler: onViewOrders
      }];
    }
  };

  function onViewOrders() {

	 mainView.router.load({
      url: 'customer/my-order.html',
      query: {
        'openId': openId,
        'originPath': originPath
      },
      animatePages: false
    });
  }

  return Module;
});