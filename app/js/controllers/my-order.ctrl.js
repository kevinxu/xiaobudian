define([
  'utils',
  'services/order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;
  var departmentId = window.departmentId;

  var Module = {
    init: function (query) {

      getMyOrders();
    },

    methods: function () {

    }
  };

  function getMyOrders() {

    Service.getOrderListByUserID({
      'openId': openId,
      'hospitalId': hospitalId
    }).then(function(res){
      if (res.success) {

        console.log("my orders: " + JSON.stringify(res.data));

        Template.render('#orderListTpl', res.data);
        Utils.bindEvents([{
          element: '.btn-edit-order',
          event: 'click',
          handler: onRevokeOrder
        }, {
          element: '.btn-view-reason',
          event: 'click',
          handler: onViewReason
        }]);
      }
    });
  }

  function onViewReason() {
    var orderId = $$(this).data('order-id');
     console.log("onViewReason id: " + orderId);

    Service.onViewCancelReason({
      'orderId': orderId
    }).then(function(res){
      if (res.success) {
        console.log("view reason successfully.");
        console.log("cancel reason: " + res.data);
        f7.alert(res.data, "退订理由");
      }
    });   
  }

  function onRevokeOrder() {
    var orderId = $$(this).data('order-id');
    console.log("onRevokeOrder id: " + orderId);

    Service.onRevokeOrder({
      'orderId': orderId
    }).then(function(res){
      if (res.success) {
        console.log("revoke successfully.");
        $$('#btn-' + orderId).parent('td').html('已撤销');
      }
    });
  }

  return Module;
});