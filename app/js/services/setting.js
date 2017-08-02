define(['services/base'], function (Service) {
  var Setting = {

    getHospitalInfo: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital?hospitalId=' + data.hospitalId + '&openId=' + data.openId,
        data: ''
      });
    },

    getHospitalManagers: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital/managers?hospitalId=' + data.hospitalId,
        data: ''
      });
    },

    getHospitalQrCode: function (data) {
      return Service.getData({
        method: 'get',
        url: '/api/hospital/getQrcode?hospitalId=' + data.hospitalId + '&openId=' + data.openId,
        data: ''
      });
    },

    updateHospitalName: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/hospital/' + id,
        data: data
      });      
    },

    addDepartment: function (id, data) {
      return Service.getData({
        method: 'post',
        url: '/api/hospital/addDept/' + id,
        data: data
      });
    },

    editDepartment: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/hospital/editDept/' + id,
        data: data
      });
    },

    unbingManager: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/hospital/unbindManager/' + id,
        data: data
      });
    },

    remarkManagerName: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/hospital/remarkManagerName/' + id,
        data: data
      });
    },

    updateOrderTime: function (id, data) {
      return Service.getData({
        method: 'put',
        url: '/api/hospital/updateOrderTime/' + id,
        data: data
      });
    }
  };

  return Setting;
});