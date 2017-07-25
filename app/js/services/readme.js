define(['services/base'], function (Service) {
  var Readme = {
    getHospitalInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital/dept?hospitalId=' + data.hospitalId + '&departmentId=' + data.departmentId,
        data: ''
      });
    }
  };

  return Readme;
});
