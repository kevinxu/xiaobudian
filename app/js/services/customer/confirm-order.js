define(['services/base'], function (Service) {
  var ConfirmOrder = {
    getCustomerInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/customer/getInfo?openId=' + data.openId + '&restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    submitOrder: function (data) {
      return Service.getData({
        method: 'post',
        url: '/api/orders/create',
        data: data
      });      
    }
  };

  return ConfirmOrder;
});