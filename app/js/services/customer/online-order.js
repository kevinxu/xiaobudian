define(['services/base'], function (Service) {
  var OnlineOrder = {
    getMenuList: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/menu/getList?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    getRestaurantInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/restaurant/getName?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    getDishTypes: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/menu/getDishTypes?restaurantId=' + data.restaurantId,
        data: ''
      });
    }
  };

  return OnlineOrder;
});
