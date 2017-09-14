define(['services/base'], function (Service) {
  var TransferManager = {

    getHospitalManagers: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/restaurant/managers?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    authSupperManager: function (data) {
      return Service.getData({
        method: 'put',
        url: '/api/restaurant/authManager/' + data.restaurantId,
        data: data
      });      
    }
  };

  return TransferManager;
});