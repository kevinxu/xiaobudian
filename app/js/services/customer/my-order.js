define(['services/base'], function (Service) {
  var Order = {

    getOrderListByUserID: function (data) {
       return Service.getData({
        method: 'get',
        url: '/api/orders/getOrders?openId=' + data.openId + '&pageSize=' + data.pageSize + '&pageNum=' + data.pageNum,
        data: ''
      });
    },

    onRevokeOrder: function (data) {
      return Service.getData({
        method: 'put',
        url: '/api/orders/revoke/' + data.orderId,
        data: data
      });      
    },

    onViewCancelReason: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/orders/cancel/' + data.orderId,
        data: ''
      });       
    }
  };

  return Order;
});
