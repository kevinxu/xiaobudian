define(['services/base'], function (Service) {
  var Setting = {

    getRestaurantInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/restaurant/getInfo?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    getRestaurantManagers: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/restaurant/managers?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    getRestaurantQrCode: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/restaurant/getQrcode?restaurantId=' + data.restaurantId + '&openId=' + data.openId,
        data: ''
      });
    },

    updateRestaurantName: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/restaurant/updateName/' + id,
        data: data
      });      
    },

    addDesk: function (id, data) {
      return Service.getData({
        method: 'post',
        url: '/api/restaurant/addDesk/' + id,
        data: data
      });
    },

    editDesk: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/restaurant/editDesk/' + id,
        data: data
      });
    },

    unbingManager: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/restaurant/unbindManager/' + id,
        data: data
      });
    },

    remarkManagerName: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/restaurant/remarkManagerName/' + id,
        data: data
      });
    }
  };

  return Setting;
});