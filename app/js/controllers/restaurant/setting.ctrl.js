define([
  'utils',
  'services/restaurant/setting',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var isSuperManager = 0;
  var restaurantId = window.restaurantId;
  var restaurantName = "";
  var deskList = [];
  var selectedDept = "";
  var selectedDeptIndex = 0;
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
      restaurantId = window.restaurantId || query.restaurantId;
      Utils.bindEvents(this.methods());

      getRestaurantInfo(restaurantId);
    },

    methods: function () {
      return [{
        element: '#select-dept-list',
        event: 'change',
        handler: changeDept
      }, {
          element: '#btn-hosp-edit',
          event: 'click',
          handler: enterEditRestaurantNameMode
      }, {
        element: '#btn-hosp-edit-confirm',
        event: 'click',
        handler: confirmEditRestaurant
      }, {
        element: '#btn-hosp-edit-cancel',
        event: 'click',
        handler: cancelEditRestaurant
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
    showOrderNormalMode(0, isSuperManager);
    var initReminder = setInitValueForReminder(0);
    if (initReminder) {
      pickerBreakfastReminder.setValue(initReminder, 100);
    }
    else {
      console.log("onEditBreakfastCancel, no init reminder.");
      $$('#picker-breakfast-reminder').val('');
    }
    var initShipping = setInitValueForShipping(0);
    if (initShipping) {
      pickerBreakfastShipping.setValue(initShipping, 100); 
    }
    else {
      console.log("onEditBreakfastCancel, no init shipping.");
      $$('#picker-breakfast-shipping').val('');
    }
  }

  function onEditLunchCancel() {
    showOrderNormalMode(1, isSuperManager);
    var initReminder = setInitValueForReminder(1);
    if (initReminder) {
      pickerLunchReminder.setValue(initReminder, 100);
    }
    else {
      $$('#picker-lunch-reminder').val('');
    }
    var initShipping = setInitValueForShipping(1);
    if (initShipping) {
      pickerLunchShipping.setValue(initShipping, 100);
    }
    else {
      $$('#picker-lunch-shipping').val('');
    }
  }

  function onEditDinnerCancel() {
    showOrderNormalMode(2, isSuperManager);
    var initReminder = setInitValueForReminder(2);
    if (initReminder) {
      pickerDinnerReminder.setValue(initReminder, 100);
    }
    else {
      $$('#picker-dinner-reminder').val('');
    }
    var initShipping = setInitValueForShipping(2);
    if (initShipping) {
      pickerDinnerShipping.setValue(initShipping, 100); 
    }
    else {
      $$('#picker-dinner-shipping').val('');
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

  function showOrderNormalMode(mealType, isSuperManager) {
    if (mealType == 0) {
      isSuperManager ? $$('#btn-edit-breakfast').show() : $$('#btn-edit-breakfast').hide();
      $$('#btn-edit-breakfast-cancel').hide();
      $$('#btn-edit-breakfast-confirm').hide();
      $$('#picker-breakfast-reminder').attr('disabled', true);
      $$('#picker-breakfast-shipping').attr('disabled', true); 
    }
    else if (mealType == 1) {
      isSuperManager ? $$('#btn-edit-lunch').show() : $$('#btn-edit-lunch').hide();
      $$('#btn-edit-lunch-cancel').hide();
      $$('#btn-edit-lunch-confirm').hide();
      $$('#picker-lunch-reminder').attr('disabled', true);
      $$('#picker-lunch-shipping').attr('disabled', true);     
    }
    else if (mealType == 2) {
      isSuperManager ? $$('#btn-edit-dinner').show() : $$('#btn-edit-dinner').hide();
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

  function cancelEditRestaurant() {
    showRestaurantName();
  }

  function confirmEditRestaurant() {
    confirmRestaurantName();
  }

  function showRestaurantName() {
    $$('#ipt-hosp-name').val(restaurantName);
    $$('#ipt-hosp-name').attr('disabled', true);

    isSuperManager ? $$('#btn-hosp-edit').show() : $$('#btn-hosp-edit').hide();
    $$('#btn-hosp-edit-cancel').hide();
    $$('#btn-hosp-edit-confirm').hide();
  }

  function cancelDept() {
    if (currentDeptMode == 1) {
      console.log("cancel dept add");
      if (deskList && deskList.length > 0) {
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

  function getRestaurantInfo(restaurantId) {
     Service.getRestaurantInfo({
      'restaurantId': restaurantId,
      'openId': openId
    }).then(function(res){
      if (res.success) {
        console.log(res.page);
        console.log(res.data);
        restaurantName = res.data.restaurantName;
        deskList = res.data.desks;
        isSuperManager = res.data.isSuperManager;
        console.log("Is supper manager: " + isSuperManager);
        showRestaurantName();
        showDeskList(res.data.desks);
        showManagerList(res.data.managers, isSuperManager);
      }
    });

    Service.getRestaurantQrCode({
      'restaurantId': restaurantId,
      'openId': openId
    }).then(function(res){
      if (res.success) {
        renderRestaurantQrCode(res.data);
      }
    });   
  }

  function renderRestaurantQrCode(data) {
    Template.render('#hospQrCodeTpl', data);
  }

  function showManagerList(managerList, isSuperManager) {
    var mgrs = [];

    // Put self in the first.
    mgrs.push({
      'openId': openId,
      'allowEdit': 1
    });
    for (var i = 0, len = managerList.length; i < len; i++) {
      if (openId == managerList[i].openId) {
        mgrs[0].nickName = managerList[i].nickName + '(本人)';
        mgrs[0].remarkName = managerList[i].remarkName;
      }
      else {
        // 超管可以对所有人编辑
        managerList[i].allowEdit = isSuperManager ? 1 : 0;
        mgrs.push(managerList[i]);
      }
    }
    var data = {
      'isSuperManager': isSuperManager,
      'managers': mgrs
    };
    Template.render('#managerListTpl', data);

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
    Service.remarkManagerName(restaurantId, {
      'restaurantId': restaurantId,
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
    if (openIdManager == openId) {
      if (isSuperManager) {
        f7.confirm('您是餐馆超级管理员，在解绑您自己之前，请将超管权限授权给其中一位管理员！', '解绑', function() {
          mainView.router.load({
            url: 'restaurant/transfer-manager.html',
            query: {
              'openId': openId,
              'restaurantId': restaurantId,
              'originPath': originPath
            },
            animatePages: false
          });          
        });
      }
      else {
        f7.confirm('确认解绑您自己吗？', '解绑', function() {
          Service.unbingManager(restaurantId, {
            'restaurantId': restaurantId,
            'openIdManager': openIdManager
          }).then(function(res){
            if (res.success) {
              //window.location.reload(true);
              mainView.router.load({
                url: 'restaurant/no-setting.html',
                query: {
                  'openId': openId,
                  'restaurantId': restaurantId,
                  'originPath': originPath
                },
                animatePages: false
              });
            }
          });
        });        
      }

      return;
    }

    f7.confirm('确认需要解绑管理员' + nickName + '吗？', '解绑', function() {
        Service.unbingManager(restaurantId, {
          'restaurantId': restaurantId,
          'openIdManager': openIdManager
        }).then(function(res){
          if (res.success) {
            getRestaurantInfo(restaurantId);
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

  function showDeskList(deskList) {

    if (deskList && deskList.length > 0) {
      var idx = deskList.length - 1;
      Template.render('#deptInfoTpl', deskList);

      Template.render('#deptQrCodeTpl', deskList[idx]);
      Template.render('#deptQrCodeHospTpl', deskList[idx]);

      $$('#opt-' + idx).attr("selected", "selected");
      selectedDept = deskList[idx].name;
      selectedDeptIndex = idx;
      enterShowDeptMode();
    }
    else {
      enterNoDeptMode();
    }
  }

  function enterNoDeptMode() {
      $$('#select-dept-list').hide();
      $$('#btn-dept-edit').hide();
      $$('#ipt-dept-name').val("您还没有设置任何餐桌");
      $$('#ipt-dept-name').attr("disabled", true);
      $$('#ipt-dept-name').show();
      $$('#btn-dept-cancel').hide();
      $$('#btn-dept-confirm').hide(); 
      isSuperManager ? $$('#btn-dept-add').show() : $$('#btn-dept-add').hide();
  }

  function changeDept() {
    selectedDept = $$(this).val();
    console.log("selected department: " + selectedDept);

    var i;
    var len;
    for (i = 0, len = deptList.length; i < len; i++) {
      if (selectedDept == deptList[i].name) {
        selectedDeptIndex = i;
        Template.render('#deptQrCodeTpl', deptList[i]);
        Template.render('#deptQrCodeHospTpl', deptList[i]);
        break;
      }
    }
  }

  function enterEditRestaurantNameMode() {

    $$('#ipt-hosp-name').removeAttr('disabled');
    $$('#ipt-hosp-name').focus();

    $$('#btn-hosp-edit-cancel').show();
    $$('#btn-hosp-edit-confirm').show();
    $$('#btn-hosp-edit').hide();
  }

  function confirmRestaurantName() {
    var newName = $$('#ipt-hosp-name').val().trim();

    console.log("new restaurant name: " + newName);
    if (newName != restaurantName) {
        Service.updateRestaurantName(restaurantId, {
          'openId': openId,
          'restaurantName': newName
        }).then(function(res){
          if (res.success) {
            console.log("The restaurant name was updated successfully.");
            restaurantName = newName;
          }

          showRestaurantName();
        });
    }
  }

  function enterEditDeptMode() {
    currentDeptMode = 2;
    console.log("selected option: " + selectedDept);

    $$('#select-dept-list').hide();
    $$('#ipt-dept-name').show();
    $$('#ipt-dept-name').removeAttr('disabled');
    $$('#ipt-dept-name').attr('placeholder', "请输入餐桌名");
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
       Service.editDesk(restaurantId, {
          'deskId': deskList[selectedDeptIndex]._id,
          'oldDeskName': selectedDept,
          'newDeskName': newDeptName
        }).then(function(res){
          if (res.success) {
            console.log("The department was added successfully.");
            getRestaurantInfo(restaurantId);
        }
      });     
    }

  }

  function enterShowDeptMode() {
    $$('#select-dept-list').show();
    $$('#ipt-dept-name').hide();

    if (isSuperManager) {
      $$('#btn-dept-edit').show();
      $$('#btn-dept-add').show();
    }
    else {
      $$('#btn-dept-edit').hide();
      $$('#btn-dept-add').hide();      
    }

    $$('#btn-dept-cancel').hide();
    $$('#btn-dept-confirm').hide();
  }

  function enterAddDeptMode() {
    currentDeptMode = 1;
    $$('#select-dept-list').hide();
    $$('#ipt-dept-name').show();
    $$('#ipt-dept-name').removeAttr('disabled');
    $$('#ipt-dept-name').attr('placeholder', "请输入餐桌名");
    $$('#ipt-dept-name').val("");
    $$('#ipt-dept-name').focus();

    $$('#btn-dept-add').hide();
    $$('#btn-dept-edit').hide();
    $$('#btn-dept-cancel').show();
    $$('#btn-dept-confirm').show();
  }

  function confirmAdd() {
    var deskName = $$('#ipt-dept-name').val();

    Service.addDesk(restaurantId, {
        'deskName': deskName
      }).then(function(res){
        if (res.success) {
          console.log("The desk was added successfully.");
          getRestaurantInfo(restaurantId);
        }
        else {
          console.log("add desk failed. " + res.errMsg);
        }

        enterShowDeptMode();
    });

  }

  return Module;
});
