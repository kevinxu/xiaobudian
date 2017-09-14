define(['services/base'], function (Service) {
  var MenuManage = {
    getMenuList: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/menu/getList?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    addDishType: function (data) {
      return Service.getData({
        method: 'post',
        url: '/api/menu/addDishType/' + data.restaurantId,
        data: data
      });
    },

    getDishTypes: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/menu/getDishTypes?restaurantId=' + data.restaurantId,
        data: ''
      });
    },

    deleteDishType: function (data) {
      return Service.getData({
        method: 'delete',
        url: '/api/menu/deleteDishType/' + data.dishTypeId,
        data: data
      });      
    },

    editDishType: function (data) {
      return Service.getData({
        method: 'put',
        url: '/api/menu/editDishType/' + data.dishTypeId,
        data: data
      });
    },

    addDish: function (data) {
      return Service.getData({
        method: 'post',
        url: '/api/menu/addDish/' + data.restaurantId,
        data: data
      });
    },

    deleteDish: function (data) {
      return Service.getData({
        method: 'delete',
        url: '/api/menu/deleteDish/' + data.dishId,
        data: data
      });
    },

    editDish: function (data) {
      return Service.getData({
        method: 'put',
        url: '/api/menu/editDish/' + data.dishId,
        data: data
      });
    },

    getQiniuToken: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/qiniu/getToken',
        data: ''
      });      
    },

    uploadFile: function (data) {
      return Service.getData({
        method: 'post',
        url: 'http://upload.qiniu.com/',
        data: data
      });        
    }
  };

  return MenuManage;
});