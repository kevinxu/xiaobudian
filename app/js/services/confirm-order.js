define(['services/base'], function (Service) {
  var ConfirmOrder = {
    getPatientInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/patient?openId=' + data.openId,
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