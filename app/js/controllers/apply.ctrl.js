define([
  'utils',
  'services/apply',
  'template'
], function (Utils, Service, Template) {


  var openId = window.openId ? window.openId : (function () {
              Utils.saveCache('USER_INFO', {openId: 'oTt421TWJGSGXPfGe01zMUR2aSUU'});
              return 'oTt421TWJGSGXPfGe01zMUR2aSUU'; })();

  var Module = {
    init: function (query) {
      console.log("applyctrl openId is: " + openId);
      Utils.bindEvents(this.methods());
    },

    methods: function () {
      return [{
        element: '.btn-hosp-apply',
        event: 'click',
        handler: goApply
      }];
    }
  };

  function goApply() {
    var formData = f7.formToJSON('#form-apply');
    var validator = {
      tel: /^(13|14|15|18)[0-9]{9}$/
    };

    if (!validator.tel.test(formData.phone)) {
      f7.alert('请输入正确的手机号码');
      return;
    }

    Service.apply({
      'openId': openId,
      'hospitalName': formData.hospname,
      'contactName': formData.contact,
      'contactPhone': formData.phone
    }).then(function(res){
      if (res.success) {
        console.log("New hospital is created.");
        mainView.router.load({
          url: 'hospital/setting.html',
          query: {
            'openId': openId,
            'hospitalId': res.data._id,
            'originPath': originPath
          },
          animatePages: false
        });
      }
      else {
        console.log("created hospital failed. " + res.message);
        f7.alert("您创建的医院已存在！");
        return;
      }
    });
  }

  return Module;
});