define(['services/base'], function (Service) {
  var Order = {
    getHospDeptList: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital/deptList?hospitalId=' + data.hospitalId,
        data: ''
      });
    },

    getOrderListByUserID: function (data) {
       return Service.getData({
        method: 'get',
        url: '/api/orders/byUserId?openId=' + data.openId + '&hospitalId=' + data.hospitalId,
        data: ''
      });     
    },

    getOrderList: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/orders?hospitalId=' + data.hospitalId + '&deptId=' + data.departmentId + '&orderDate=' + data.orderDate + '&orderTime=' + data.mealType,
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
