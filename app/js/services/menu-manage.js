define(['services/base'], function (Service) {
  var MenuManage = {
    getMenuList: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/menu?hospitalId=' + data.hospitalId + '&day=' + data.day + '&mealType=' + data.mealType,
        data: ''
      });
    },

    addDish: function (data) {
      return Service.getData({
        method: 'post',
        url: '/api/menu/' + data.hospitalId,
        data: data
      });
    },

    deleteDish: function (data) {
      return Service.getData({
        method: 'delete',
        url: '/api/menu/' + data.dishId,
        data: data
      });
    },

    editDish: function (data) {
      return Service.getData({
        method: 'put',
        url: '/api/menu/' + data.dishId,
        data: data
      });
    }
  };

  return MenuManage;
});