define(['services/base'], function (Service) {
  var TransferManager = {

    getHospitalManagers: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital/managers?hospitalId=' + data.hospitalId,
        data: ''
      });
    },

    authSupperManager: function (data) {
      return Service.getData({
        method: 'put',
        url: '/api/hospital/authManager/' + data.hospitalId,
        data: data
      });      
    }
  };

  return TransferManager;
});