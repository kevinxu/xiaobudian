define(['services/base'], function (Service) {
  var OnlineOrder = {
    getMenuList: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/menu?hospitalId=' + data.hospitalId + '&day=' + data.day + '&mealType=' + data.mealType,
        data: ''
      });
    },

    getHospitalInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital/dept?hospitalId=' + data.hospitalId + '&departmentId=' + data.departmentId,
        data: ''
      });
    }
  };

  return OnlineOrder;
});
