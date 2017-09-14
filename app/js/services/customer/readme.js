define(['services/base'], function (Service) {
  var Readme = {
    getRestaurantInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/restaurant/getName?restaurantId=' + data.restaurantId,
        data: ''
      });
    }
  };

  return Readme;
});
