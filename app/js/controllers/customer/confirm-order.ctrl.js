define([
  'utils',
  'services/customer/confirm-order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId;
  var restaurantId = window.restaurantId;
  var deskId;
  var orderInCache;
  var customerInfo;

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
      }, {
        element: '[name="order-type"]',
        event: 'change',
        handler: onChangeOrderType
      }];
    }
  };

  function onChangeOrderType() {
    console.log("onChangeOrderType");

    var isInroomChecked = $$('#ipt-inroom').prop('checked');
    var isOutroomChecked = $$('#ipt-outroom').prop('checked');
    console.log("isInroomChecked: " + isInroomChecked + " isOutroomChecked: " + isOutroomChecked);

    if (isInroomChecked) {
      f7.showTab('#tab-inroom');
    }

    if (isOutroomChecked) {
      f7.showTab('#tab-outroom');
    }
  }

  function onConfirmOrder() {
  	console.log("onConfirmOrder");

    var isInroomChecked = $$('#ipt-inroom').prop('checked');
    var orderType = isInroomChecked ? 0 : 1;

    var name = $$('#ipt-patient-name').val();
    var mobile = $$('#ipt-patient-mobile').val();
    var addr = $$('#ipt-customer-addr').val();

    if (orderType == 1) {
      if (mobile) {
        var validator = {
          tel: /^(13|14|15|18)[0-9]{9}$/
        };
        if (!validator.tel.test(mobile)) {
          f7.alert('请输入正确的手机号码');
          return;
        }      
      }
      else {
        f7.alert('请输入手机号码');
        return;        
      }

      if (!addr) {
        f7.alert('请输入送餐地址');
        return;
      }
    }

    var data = {
      'openId': openId,
      'restaurantId': restaurantId,
      'deskId': deskId,
      'totalFee': orderInCache.totalFee,
      'orderType': orderType,
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

      	f7.formFromJSON('#form-desk-detail', res.data);
        f7.formFromJSON('#form-customer-detail', res.data);
        customerInfo = res.data;
        deskId = res.data.deskId;
        console.log("deskName: " + JSON.stringify(res.data));
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