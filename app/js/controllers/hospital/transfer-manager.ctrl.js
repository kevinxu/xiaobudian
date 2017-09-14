define([
  'utils',
  'services/transfer-manager',
  'template'
], function (Utils, Service, Template) {


  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId;

  var Module = {
    init: function (query) {
      hospitalId = query.hospitalId;
      Utils.bindEvents(this.methods());

      loadManagers();
    },

    methods: function () {
      return [{
        element: '#btn-confirm-transfer',
        event: 'click',
        handler: onConfirmTransfer
      }];
    }
  };

  function loadManagers() {

    Service.getHospitalManagers({
      'hospitalId': hospitalId
    }).then(function(res){
      if (res.success) {
        var mgrs = [];
        for(var i = 0, len = res.data.length; i<len; i++) {
          if(openId != res.data[i].openId) {
            mgrs.push({
              'openId': res.data[i].openId,
              'nickName': res.data[i].nickName
            });
          }
        }

        if (mgrs.length == 0) {
          $$('#form-manager-list').html(
            '<div id="tip-no-manager" class="content-block">' +
              '<div class="card">' +
                '<div class="card-content">' +
                  '<div class="card-content-inner big-font">' +
                    '没有其他管理员可以授权！' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
          return;
        }

        Template.render('#managersTpl', mgrs);
      }
    });
  }

  function onConfirmTransfer() {
    var formData = f7.formToJSON('#form-manager-list');

    if (!formData.manager) {
      f7.alert("请选择一个管理员授权！");
      return;
    }

    Service.authSupperManager({
      'hospitalId': hospitalId,
      'fromOpenId': openId,
      'toOpenId': formData.manager
    }).then(function(res){
      if (res.success) {
        console.log("Auth manager success.");
        //window.history.back();

        mainView.router.load({
          url: 'hospital/setting.html',
          query: {
            'openId': openId,
            'hospitalId': hospitalId,
            'originPath': originPath
          },
          animatePages: false
        });
      }
    });
  }

  return Module;
});