define(['services/base'], function (Service) {
  var Order = {

    getOrderListByRestaurantID: function (data) {
       return Service.getData({
        method: 'get',
        url: '/api/orders/getOrders?restaurantId=' + data.restaurantId + '&pageSize=' + data.pageSize + '&pageNum=' + data.pageNum,
        data: ''
      });     
    },

    getOrderDetail: function (orderId) {
       return Service.getData({
        method: 'get',
        url: '/api/orders/getOrderDetail?orderId=' + orderId,
        data: ''
      });     
    },

    confirmOrder: function (orderId) {
      var data = {
        op: 2
      };
      return Service.getData({
        method: 'put',
        url: '/api/orders/confirm/' + orderId,
        data: data
      });
    },

    unsubscribeOrder: function (orderId, comments) {
      var data = {
        op: 3,
        comment: comments
      };
      return Service.getData({
        method: 'put',
        url: '/api/orders/cancel/' + orderId,
        data: data
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
