define([
  'utils',
  'services/readme',
  'template'
], function (Utils, Service, Template) {


  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;
  var departmentId = window.departmentId;

  var Module = {
    init: function (query) {

      Service.getHospitalInfo({
        'hospitalId': hospitalId,
        'departmentId': departmentId
      }).then(function(res){
        if (res.success) {
          var hospitalName = res.data.hospitalName;
          Template.render('#hospInfoTpl', {'hospitalName': hospitalName});
        }
      });
    },

    methods: function () {

    }
  };

  return Module;
});