define([
  'utils',
  'services/setting',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;
  var hospitalName = "";
  var deptList = [];
  var selectedDept = "";
  // 0 - show dept mode; 1 - add dept mode; 2 - edit dept mode
  var currentDeptMode = 0;
  var pickerBreakfastReminder;
  var pickerBreakfastShipping;
  var pickerLunchReminder;
  var pickerLunchShipping;
  var pickerDinnerReminder;
  var pickerDinnerShipping;
  var orderTime;
  var Module = {
    init: function (query) {
      console.log("window.openId: ", JSON.stringify(query));
      hospitalId = window.hospitalId || query.hospitalId;
      Utils.bindEvents(this.methods());

      getHospitalInfo(hospitalId);
    },

    methods: function () {
      return [{
        element: '#select-dept-list',
        event: 'change',
        handler: changeDept
      }, {
          element: '#btn-hosp-edit',
          event: 'click',
          handler: enterEditHospitalNameMode
      }, {
        element: '#btn-hosp-edit-confirm',
        event: 'click',
        handler: confirmEditHospital
      }, {
        element: '#btn-hosp-edit-cancel',
        event: 'click',
        handler: cancelEditHospital
      }, {
          element: '#btn-dept-edit',
          event: 'click',
          handler: enterEditDeptMode      
      }, {
          element: '#btn-dept-add',
          event: 'click',
          handler: enterAddDeptMode
      }, {
          element: '#btn-dept-cancel',
          event: 'click',
          handler: cancelDept
      }, {
          element: '#btn-dept-confirm',
          event: 'click',
          handler: confirmDept
      }, {
        element: '#btn-edit-breakfast',
        event: 'click',
        handler: onEditBreakfast
      }, {
        element: '#btn-edit-breakfast-cancel',
        event: 'click',
        handler: onEditBreakfastCancel
      }, {
        element: '#btn-edit-breakfast-confirm',
        event: 'click',
        handler: onEditBreakfastConfirm
      }, {
        element: '#btn-edit-lunch',
        event: 'click',
        handler: onEditLunch
      }, {
         element: '#btn-edit-lunch-cancel',
        event: 'click',
        handler: onEditLunchCancel       
      }, {
        element: '#btn-edit-lunch-confirm',
        event: 'click',
        handler: onEditLunchConfirm
      }, {
        element: '#btn-edit-dinner',
        event: 'click',
        handler: onEditDinner
      }, {
         element: '#btn-edit-dinner-cancel',
        event: 'click',
        handler: onEditDinnerCancel       
      }, {
        element: '#btn-edit-dinner-confirm',
        event: 'click',
        handler: onEditDinnerConfirm
      }, {
        element: '#btn-dept-qrcode',
        event: 'click',
        handler: onClickDeptQrcode
      }, {
        element: '#btn-hosp-qrcode',
        event: 'click',
        handler: onClideHospQrcode
      }, {
        element: '#btn-xiaobudian-qrcode',
        event: 'click',
        handler: onClideXiaobudianQrcode
      }];
    }

  };

  function onClickDeptQrcode() {
    var urlQrcode = $$('#img-dept-qrcode').data('url-qrcode');
    console.log("onClickDeptQrcode, url: " + urlQrcode);

    $$('#qrcode-overlay').toggleClass('qrcode-overlay');
    $$('#qrcode-overlay').html('<span></span><img id="img-dept-qrcode-big" src="' + urlQrcode + '">');
    $$('#img-dept-qrcode-big').css('vertical-align', 'middle');
    Utils.bindEvents([{
      element: '#img-dept-qrcode-big',
      event: 'click',
      handler: onClickDeptQrcodeBig
    }]);
  }

  function onClideHospQrcode() {
    var urlQrcode = $$('#img-hosp-qrcode').data('url-qrcode');
    console.log("onClideHospQrcode, url: " + urlQrcode);

    $$('#qrcode-overlay').toggleClass('qrcode-overlay');
    $$('#qrcode-overlay').html('<span></span><img id="img-hosp-qrcode-big" src="' + urlQrcode + '">');
    Utils.bindEvents([{
      element: '#img-hosp-qrcode-big',
      event: 'click',
      handler: onClickHospQrcodeBig
    }]);   
  }

  function onClideXiaobudianQrcode() {
    var urlQrcode = $$('#img-xiaobudian-qrcode').data('url-qrcode');
    console.log("onClideXiaobudianQrcode, url: " + urlQrcode);

    $$('#qrcode-overlay').toggleClass('qrcode-overlay');
    $$('#qrcode-overlay').html('<span></span><img id="img-xiaobudian-qrcode-big" src="' + urlQrcode + '">');
    Utils.bindEvents([{
      element: '#img-xiaobudian-qrcode-big',
      event: 'click',
      handler: onClickXiaobudianQrcodeBig
    }]);     
  }

  function onClickDeptQrcodeBig() {
    console.log("onClickDeptQrcodeBig");
    Utils.unbindEvents([{
      element: '#img-dept-qrcode-big',
      event: 'click',
      handler: onClickDeptQrcodeBig
    }]);
    $$('#qrcode-overlay').html('');
    $$('#qrcode-overlay').toggleClass('qrcode-overlay');
  }

  function onClickHospQrcodeBig() {
    console.log("onClickHospQrcodeBig");
    Utils.unbindEvents([{
      element: '#img-hosp-qrcode-big',
      event: 'click',
      handler: onClickHospQrcodeBig
    }]);
    $$('#qrcode-overlay').html('');
    $$('#qrcode-overlay').toggleClass('qrcode-overlay');    
  }

  function onClickXiaobudianQrcodeBig() {
    console.log("onClickXiaobudianQrcodeBig");
    Utils.unbindEvents([{
      element: '#img-xiaobudian-qrcode-big',
      event: 'click',
      handler: onClickXiaobudianQrcodeBig
    }]);
    $$('#qrcode-overlay').html('');
    $$('#qrcode-overlay').toggleClass('qrcode-overlay');      
  }

  function onEditBreakfast() {
    //console.log('onEditBreakfast is clicked.');
    $$('#btn-edit-breakfast').hide();
    $$('#btn-edit-breakfast-cancel').show();
    $$('#btn-edit-breakfast-confirm').show();
    $$('#picker-breakfast-reminder').removeAttr('disabled');
    $$('#picker-breakfast-shipping').removeAttr('disabled');
  }

  function onEditLunch() {
    $$('#btn-edit-lunch').hide();
    $$('#btn-edit-lunch-cancel').show();
    $$('#btn-edit-lunch-confirm').show();
    $$('#picker-lunch-reminder').removeAttr('disabled');
    $$('#picker-lunch-shipping').removeAttr('disabled');  
  }

  function onEditDinner() {
    $$('#btn-edit-dinner').hide();
    $$('#btn-edit-dinner-cancel').show();
    $$('#btn-edit-dinner-confirm').show();
    $$('#picker-dinner-reminder').removeAttr('disabled');
    $$('#picker-dinner-shipping').removeAttr('disabled');
  }

  function onEditBreakfastCancel() {
    showOrderNormalMode(0);
    var initReminder = setInitValueForReminder(0);
    if (initReminder) {
      pickerBreakfastReminder.setValue(initReminder, 100);
    }
    var initShipping = setInitValueForShipping(0);
    if (initShipping) {
      pickerBreakfastShipping.setValue(initShipping, 100); 
    } 
  }

  function onEditLunchCancel() {
    showOrderNormalMode(1);
    var initReminder = setInitValueForReminder(1);
    if (initReminder) {
      pickerLunchReminder.setValue(initReminder, 100);
    }
    var initShipping = setInitValueForShipping(1);
    if (initShipping) {
      pickerLunchShipping.setValue(initShipping, 100);
    }
  }

  function onEditDinnerCancel() {
    showOrderNormalMode(2);
    var initReminder = setInitValueForReminder(2);
    if (initReminder) {
      pickerDinnerReminder.setValue(initReminder, 100);
    }
    var initShipping = setInitValueForShipping(2);
    if (initShipping) {
      pickerDinnerShipping.setValue(initShipping, 100); 
    }
  }

  function onEditBreakfastConfirm() {
    onEditConfirm(0, pickerBreakfastReminder, pickerBreakfastShipping, orderTime ? orderTime.breakfast : orderTime);
  }

  function onEditLunchConfirm() {
    onEditConfirm(1, pickerLunchReminder, pickerLunchShipping, orderTime ? orderTime.lunch : orderTime);
  }

  function onEditDinnerConfirm() {
    onEditConfirm(2, pickerDinnerReminder, pickerDinnerShipping, orderTime ? orderTime.dinner : orderTime);
  }

  function onEditConfirm(mealType, pickerReminder, pickerShipping, orderT) {
    console.log(pickerReminder.value);
    console.log(pickerShipping.value);
    if (pickerReminder.value.length == 0) {
      f7.alert("订餐提醒时间没有设置");
      return;
    }
    if (pickerShipping.value.length == 0) {
      f7.alert("订餐配送时间没有设置");
      return;
    }
    var reminderDay = pickerReminder.value[0];
    var reminderTime = pickerReminder.value[1] + ":" + pickerReminder.value[2];
    var shippingStart = pickerShipping.value[0] + ":" + pickerShipping.value[1];
    var shippingEnd = pickerShipping.value[2] + ":" + pickerShipping.value[3];

    console.log("selected day: " + reminderDay + " time: " + reminderTime);
    console.log("shipping start: " + shippingStart + " end: " + shippingEnd);

    if ((orderT == undefined) || (reminderDay != orderT.reminderDay)
        || (reminderTime != orderT.reminderTime)
        || (shippingStart != orderT.shippingStart)
        || (shippingEnd != orderT.shippingEnd)) {
        Service.updateOrderTime(hospitalId, {
          'hospitalId': hospitalId,
          'mealType': mealType,
          'reminderDay': reminderDay,
          'reminderTime': reminderTime,
          'shippingTimeStart': shippingStart,
          'shippingTimeEnd': shippingEnd
        }).then(function(res){
          if (res.success) {
            showOrderNormalMode(mealType);
          }
        });
    }
  }

  function showOrderNormalMode(mealType) {
    if (mealType == 0) {
      $$('#btn-edit-breakfast').show();
      $$('#btn-edit-breakfast-cancel').hide();
      $$('#btn-edit-breakfast-confirm').hide();
      $$('#picker-breakfast-reminder').attr('disabled', true);
      $$('#picker-breakfast-shipping').attr('disabled', true); 
    }
    else if (mealType == 1) {
      $$('#btn-edit-lunch').show();
      $$('#btn-edit-lunch-cancel').hide();
      $$('#btn-edit-lunch-confirm').hide();
      $$('#picker-lunch-reminder').attr('disabled', true);
      $$('#picker-lunch-shipping').attr('disabled', true);     
    }
    else if (mealType == 2) {
      $$('#btn-edit-dinner').show();
      $$('#btn-edit-dinner-cancel').hide();
      $$('#btn-edit-dinner-confirm').hide();
      $$('#picker-dinner-reminder').attr('disabled', true);
      $$('#picker-dinner-shipping').attr('disabled', true); 
    }
  }

  function parseTime(str) {
    var arr = str.split(":");
    return arr;
  }

  function setInitValueForReminder(mealType) {
    var reminderDay;
    var reminderTime;
    if (mealType == 0) {
      if (orderTime && orderTime.breakfast) {
        reminderDay = orderTime.breakfast.reminderDay;
        reminderTime = orderTime.breakfast.reminderTime;            
      }
      else {
        return;
      }
    }
    else if (mealType == 1) {
      if (orderTime && orderTime.lunch) {
        reminderDay = orderTime.lunch.reminderDay;
        reminderTime = orderTime.lunch.reminderTime;
      }
      else {
        return;
      }
    }
    else if (mealType == 2) {
      if (orderTime && orderTime.dinner) {
        reminderDay = orderTime.dinner.reminderDay;
        reminderTime = orderTime.dinner.reminderTime;
      }
      else {
        return;
      }      
    }

    initValues = parseTime(reminderTime);
    console.log("reminderTime: " + reminderTime);
    console.log("reminderDay: " + reminderDay + " time hour: " + initValues[0] + " min: " + initValues[1]);

    return [reminderDay, initValues[0], initValues[1]];   
  }

  function setInitValueForShipping(mealType) {
    var shippingStart;
    var shippingEnd;
    if (mealType == 0) {
      if (orderTime && orderTime.breakfast) {
        shippingStart = orderTime.breakfast.shippingStart;
        shippingEnd = orderTime.breakfast.shippingEnd;            
      }
      else {
        return;
      }
    }
    else if (mealType == 1) {
      if (orderTime && orderTime.lunch) {
        shippingStart = orderTime.lunch.shippingStart;
        shippingEnd = orderTime.lunch.shippingEnd;
      }
      else {
        return;
      }
    }
    else if (mealType == 2) {
      if (orderTime && orderTime.dinner) {
        shippingStart = orderTime.dinner.shippingStart;
        shippingEnd = orderTime.dinner.shippingEnd;
      }
      else {
        return;
      }      
    }

    startValues = parseTime(shippingStart);
    endValues = parseTime(shippingEnd);

    return [startValues[0], startValues[1], endValues[0], endValues[1]];   
  }

  function addPickerReminder(mealType, iptId) {
    var picker = f7.picker({
      input: '#' + iptId,
      rotateEffect: true,
      formatValue: function (picker, values, displayV) {
        console.log("displayValues: " + displayV);
        console.log("values: " + values);
        return (values[0] == 0 ? '前一天' : '当天') + values[1] + ':' + values[2];
      },
      value: setInitValueForReminder(mealType),
      cols: [
      {
        values: ('0 1').split(' '),
        displayValues: ['前一天', '当天'],
      },
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 23; i++) {
            arr.push(i);
          }
          return arr;
        })(),
      },
      // Divder
      {
        divider: true,
        content: ':'
      },
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 59; i++) {
            arr.push(i < 10 ? '0' + i : i);
          }
          return arr;
        })(),
      }
      ]
    });

    return picker;
  }

  function addPickerShipping(mealType, iptId) {
    var picker = f7.picker({
      input: '#' + iptId,
      rotateEffect: true,
      formatValue: function (picker, values, displayValues) {
        return values[0] + ':' + values[1] + ' - ' + values[2] + ':' + values[3];
      },
      value: setInitValueForShipping(mealType),
      cols: [
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 23; i++) {
            arr.push(i);
          }
          return arr;
        })(),
      },
      // Divder
      {
        divider: true,
        content: ':'
      },
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 59; i++) {
            arr.push(i < 10 ? '0' + i : i);
          }
          return arr;
        })(),
      },
      {
        divider: true,
        content: '-'
      },
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 23; i++) {
            arr.push(i);
          }
          return arr;
        })(),
      },
      // Divder
      {
        divider: true,
        content: ':'
      },
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 59; i++) {
            arr.push(i < 10 ? '0' + i : i);
          }
          return arr;
        })(),
      }
      ]
    });
    return picker;
  }

  function cancelEditHospital() {
    showHospitalName();
  }

  function confirmEditHospital() {
    confirmHospitalName();
  }

  function showHospitalName() {
    $$('#ipt-hosp-name').val(hospitalName);
    $$('#ipt-hosp-name').attr('disabled', true);

    $$('#btn-hosp-edit').show();
    $$('#btn-hosp-edit-cancel').hide();
    $$('#btn-hosp-edit-confirm').hide();
  }

  function cancelDept() {
    if (currentDeptMode == 1) {
      console.log("cancel dept add");
      if (deptList.length > 0) {
        enterShowDeptMode();       
      } else {
        enterNoDeptMode();
      }
    }
    else if (currentDeptMode == 2) {
      console.log("cancel dept edit");
      enterShowDeptMode();
    }
  }

  function confirmDept() {
    if (currentDeptMode == 1) {
      confirmAdd();
    }
    else if (currentDeptMode == 2) {
      confirmEditDept();
    }
  }

  function getHospitalInfo(hospitalId) {

    Service.getHospitalInfo({
      'hospitalId': hospitalId
    }).then(function(res){
      if (res.success) {
        console.log(res.page);
        console.log(res.data);
        hospitalName = res.data.hospitalName;
        deptList = res.data.departments;
        orderTime = res.data.orderTime;
        showHospitalName();
        showDeptList(res.data.departments);
        showOrderTimeInfo();
      }
    });

    Service.getHospitalManagers({
      'hospitalId': hospitalId
    }).then(function(res){
      if (res.success) {
        showManagerList(res.data);     
      }
    });

    Service.getHospitalQrCode({
      'hospitalId': hospitalId,
      'openId': openId
    }).then(function(res){
      if (res.success) {
        renderHospitalQrCode(res.data);
      }
    });
  }

  function renderHospitalQrCode(data) {
    Template.render('#hospQrCodeTpl', data);
  }

  function showOrderTimeInfo() {
      pickerBreakfastReminder = addPickerReminder(0, 'picker-breakfast-reminder');
      pickerLunchReminder = addPickerReminder(1, 'picker-lunch-reminder');
      pickerDinnerReminder = addPickerReminder(2, 'picker-dinner-reminder');
      pickerBreakfastShipping = addPickerShipping(0, 'picker-breakfast-shipping');
      pickerLunchShipping = addPickerShipping(1, 'picker-lunch-shipping');
      pickerDinnerShipping = addPickerShipping(2, 'picker-dinner-shipping');
      showOrderNormalMode(0);
      showOrderNormalMode(1);
      showOrderNormalMode(2);
  }

  function showManagerList(managerList) {
    Template.render('#managerListTpl', managerList);
    Utils.bindEvents([
        {
          element: '.btn-unbind',
          event: 'click',
          handler: unbindManager
        },
        {
          element: '.btn-remark',
          event: 'click',
          handler: remarkManagerName
        },
        {
          element: '.btn-remark-cancel',
          event: 'click',
          handler: remarkCancel
        },
        {
          element: '.btn-remark-confirm',
          event: 'click',
          handler: remarkConfirm
        }
      ]);

    $$('.btn-remark-cancel').hide();
    $$('.btn-remark-confirm').hide();
  }

  function remarkCancel() {
    var openIdManager = $$(this).data('id');
    var remarkName = $$(this).data('remark-name');
    $$('#remark-cancel-' + openIdManager).hide();
    $$('#remark-confirm-' + openIdManager).hide();
    $$('#unbind-' + openIdManager).show();
    $$('#remark-' + openIdManager).show();
    $$('#ipt-remark-' + openIdManager).val(remarkName);
    $$('#ipt-remark-' + openIdManager).attr('disabled', true);
  }

  function remarkConfirm() {
    var openIdManager = $$(this).data('id');
    var newRemarkName = $$('#ipt-remark-' + openIdManager).val();

    console.log("new remark name is: " + newRemarkName);
    Service.remarkManagerName(hospitalId, {
      'hospitalId': hospitalId,
      'openIdManager': openIdManager,
      'newRemarkName': newRemarkName
    }).then(function(res){
        if (res.success) {
          $$('#remark-cancel-' + openIdManager).hide();
          $$('#remark-confirm-' + openIdManager).hide();
          $$('#unbind-' + openIdManager).show();
          $$('#remark-' + openIdManager).show();
          $$('#ipt-remark-' + openIdManager).val(newRemarkName);
          $$('#ipt-remark-' + openIdManager).attr('disabled', true);
        }
    });
  }

  function unbindManager() {
    var openIdManager = $$(this).data('id');
    var nickName = $$(this).data('nick-name');

    console.log("nickname: " + nickName);
    f7.confirm('确认需要解绑管理员' + nickName + '吗？', '解绑', function() {
        Service.unbingManager(hospitalId, {
          'hospitalId': hospitalId,
          'openIdManager': openIdManager
        }).then(function(res){
          if (res.success) {
            getHospitalInfo(hospitalId);
          }
    });  
    });
  }

  function remarkManagerName() {
    var openIdManager = $$(this).data('id');
    $$('#remark-cancel-' + openIdManager).show();
    $$('#remark-confirm-' + openIdManager).show();
    $$('#unbind-' + openIdManager).hide();
    $$('#remark-' + openIdManager).hide();
    $$('#ipt-remark-' + openIdManager).removeAttr('disabled');
    $$('#ipt-remark-' + openIdManager).focus();
  }

  function showDeptList(deptList) {

    if (deptList.length > 0) {
      var idx = deptList.length - 1;
      Template.render('#deptInfoTpl', deptList);

      Template.render('#deptQrCodeTpl', deptList[idx]);
      Template.render('#deptQrCodeHospTpl', deptList[idx]);

      $$('#opt-' + idx).attr("selected", "selected");
      selectedDept = deptList[idx].name;
      enterShowDeptMode();
    }
    else {
      enterNoDeptMode();
    }
  }

  function enterNoDeptMode() {
      $$('#select-dept-list').hide();
      $$('#btn-dept-edit').hide();
      $$('#ipt-dept-name').show();
      $$('#btn-dept-cancel').hide();
      $$('#btn-dept-confirm').hide(); 
      $$('#btn-dept-add').show();
  }

  function changeDept() {
    selectedDept = $$(this).val();
    console.log("selected department: " + selectedDept);

    var i;
    var len;
    for (i = 0, len = deptList.length; i < len; i++) {
      if (selectedDept == deptList[i].name) {
        Template.render('#deptQrCodeTpl', deptList[i]);
        Template.render('#deptQrCodeHospTpl', deptList[i]);
        break;
      }
    }
  }

  function enterEditHospitalNameMode() {

    $$('#ipt-hosp-name').removeAttr('disabled');
    $$('#ipt-hosp-name').focus();

    $$('#btn-hosp-edit-cancel').show();
    $$('#btn-hosp-edit-confirm').show();
    $$('#btn-hosp-edit').hide();
  }

  function confirmHospitalName() {
    var newName = $$('#ipt-hosp-name').val().trim();

    console.log("new hospital name: " + newName);
    if (newName != hospitalName) {
        hospitalName = newName;
        Service.updateHospitalName(hospitalId, {
          'openId': openId,
          'hospitalName': newName
        }).then(function(res){
          if (res.success) {
            console.log("The hospital name was updated successfully.");
          }
        });
    }

    showHospitalName();
  }

  function enterEditDeptMode() {
    currentDeptMode = 2;
    console.log("selected option: " + selectedDept);

    $$('#select-dept-list').hide();
    $$('#ipt-dept-name').show();
    $$('#ipt-dept-name').removeAttr('disabled');
    $$('#ipt-dept-name').attr('placeholder', "请输入病区名");
    $$('#ipt-dept-name').val(selectedDept);
    $$('#ipt-dept-name').focus();    

    $$('#btn-dept-edit').hide();
    $$('#btn-dept-add').hide();
    $$('#btn-dept-cancel').show();
    $$('#btn-dept-confirm').show();  
  }

  function confirmEditDept() {
    var newDeptName = $$('#ipt-dept-name').val();

    if (newDeptName != selectedDept) {
       console.log("New department name: " + newDeptName);
       Service.editDepartment(hospitalId, {
          'oldDeptName': selectedDept,
          'newDeptName': newDeptName
        }).then(function(res){
          if (res.success) {
            console.log("The department was added successfully.");
            getHospitalInfo(hospitalId);
        }
      });     
    }

  }

  function enterShowDeptMode() {
    $$('#select-dept-list').show();
    $$('#ipt-dept-name').hide();

    $$('#btn-dept-edit').show();
    $$('#btn-dept-add').show();
    $$('#btn-dept-cancel').hide();
    $$('#btn-dept-confirm').hide();
  }

  function enterAddDeptMode() {
    currentDeptMode = 1;
    $$('#select-dept-list').hide();
    $$('#ipt-dept-name').show();
    $$('#ipt-dept-name').removeAttr('disabled');
    $$('#ipt-dept-name').attr('placeholder', "请输入病区名");
    $$('#ipt-dept-name').val("");
    $$('#ipt-dept-name').focus();

    $$('#btn-dept-add').hide();
    $$('#btn-dept-edit').hide();
    $$('#btn-dept-cancel').show();
    $$('#btn-dept-confirm').show();
  }

  function confirmAdd() {
    var deptName = $$('#ipt-dept-name').val();

    Service.addDepartment(hospitalId, {
        'deptName': deptName
      }).then(function(res){
        if (res.success) {
          console.log("The department was added successfully.");
          getHospitalInfo(hospitalId);
        }
        else {
          console.log("add dept failed. " + res.errMsg);
        }
    });

    enterShowDeptMode();
  }

  return Module;
});
