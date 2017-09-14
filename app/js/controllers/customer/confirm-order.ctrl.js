define([
  'utils',
  'services/customer/confirm-order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId;
  var restaurantId = window.restaurantId;
  var deskId;
  var orderInCache;

  var Module = {
    init: function (query) {
    	console.log("openId is: " + openId);
    	Utils.bindEvents(this.methods());

    	getCustomerInfo();
    	loadOrderFromCache();
    },

    methods: function () {
      return [{
      	element: '#btn-confirm-my-order',
      	event: 'click',
      	handler: onConfirmOrder
      }];
    }
  };

  function onConfirmOrder() {
  	console.log("onConfirmOrder");

  	var name = $$('#ipt-patient-name').val();
  	var mobile = $$('#ipt-patient-mobile').val();

    if (mobile) {
      var validator = {
        tel: /^(13|14|15|18)[0-9]{9}$/
      };
      if (!validator.tel.test(mobile)) {
        f7.alert('请输入正确的手机号码');
        return;
      }      
    }

    var addr = $$('#ipt-customer-addr').val();
    var data = {
      'openId': openId,
      'restaurantId': restaurantId,
      'deskId': deskId,
      'totalFee': orderInCache.totalFee,
      'dishes': orderInCache.dishes
    };

    if (name) {
      data.customerName = name;
    }
    if (mobile) {
      data.customerMobile = mobile;
    }
    if (addr) {
      data.customerAddr = addr;
    }

    Service.submitOrder(data).then(function(res){
      if (res.success) {
      	console.log("Order submitted successfully.");
      	mainView.router.load({
          url: 'customer/order-done.html',
          query: {
            'openId': openId,
            'restaurantId': restaurantId,
            'originPath': originPath
          },
          animatePages: false
        });
      }
  	});	
  }

  function getCustomerInfo() {

  	Service.getCustomerInfo({
      'openId': openId,
      'restaurantId': restaurantId
    }).then(function(res){
      if (res.success) {

      	f7.formFromJSON('#form-customer-detail', res.data);
        deskId = res.data.deskId;
        //console.log("deskName: " + JSON.stringify(res.data));
        $$('#ipt-desk-name').val(res.data.deskName);
      }
  	});
  }

  function loadOrderFromCache() {

  	orderInCache = Utils.getCache('ORDER_IN_CACHE');

  	$$('#my-total-fee').html(orderInCache.totalFee);

  	Template.render('#orderDishesTpl', orderInCache.dishes);
  }

  return Module;
});