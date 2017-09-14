define([
  'utils',
  'services/order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;
  var departments;
  var deptSel;
  var now = new Date();
  var dateSel = now.format("yyyy-MM-dd");
  var daySel = now.getDay();
  var mealType = 'breakfast';
  var Module = {
    init: function (query) {
      Utils.bindEvents(this.methods());

      getDeptListAndOrderList(hospitalId);

      Template.render('#dateInfoTpl', {'dateCenter': dateSel});
      if (daySel == 0) {
        // It's Sunday
        var obj = document.getElementById('id-pre-day'); 
        obj.setAttribute('disabled', true);
      }
    },

    methods: function () {
      return [{
        element: '.btn-meal',
        event: 'click',
        handler: tabMealChange
      },{
        element: '.btn-date',
        event: 'click',
        handler: tabDateChange
      }, {
        element: '#select-dept-list',
        event: 'change',
        handler: onChangeDept
      }];
    }
  };

  function onChangeDept() {
    var deptName = $$(this).val();
    console.log("selected department: " + deptName);

    var i;
    var len;
    for (i = 0, len = departments.length; i < len; i++) {
      if (deptName == departments[i].name) {
        deptSel = i;
        break;
      }
    }

    if (i < len) {
      getOrderList(hospitalId, departments[deptSel]._id, dateSel, mealType);
    } 
  }

  function tabDateChange() {
    var dayCenter = $$(this).data('date-sel');
    var obj;
    console.log(dayCenter);
    if (dayCenter == "day-pre") {
      console.log("previous day is selected.");
      now.setDate(now.getDate() - 1);
    }
    else if (dayCenter == "day-next") {
      now.setDate(now.getDate() + 1);
    }

    dateSel = now.format("yyyy-MM-dd");
    daySel = now.getDay();
    console.log(dateSel);
    console.log(daySel);

    obj = document.getElementById('id-pre-day'); 
    if (daySel == 0) {
      // It's Sunday
      obj.setAttribute('disabled', true);
    }
    else {
      if (obj.hasAttribute('disabled')) {
        obj.removeAttribute('disabled');
      }
    }

    obj = document.getElementById('id-next-day'); 
    if (daySel == 6) { 
      obj.setAttribute('disabled', true);
    }
    else {
      if (obj.hasAttribute('disabled')) {
        obj.removeAttribute('disabled');
      }
    }

    Template.render('#dateInfoTpl', {'dateCenter': dateSel});
    getOrderList(hospitalId, departments[deptSel]._id, dateSel, mealType);
  }

  function tabMealChange() {
    mealType = $$(this).data('meal');
    console.log(mealType);

    $$('.meal-highlight-line').remove();
    $$(this).append('<hr class="meal-highlight-line" /></td>');
    getOrderList(hospitalId, departments[deptSel]._id, dateSel, mealType);
  }

  function getDeptListAndOrderList(hospitalId) {

    Service.getHospDeptList({
      'hospitalId': hospitalId
    }).then(function(res){
      if (res.success) {
        departments = res.data.departments;
         if (departments.length == 0) {
          $$('#dept-wrapper-title').html("您还没有设置病区！");
        }
        else {
          Template.render('#deptInfoTpl', departments);
          deptSel = 0;
          getOrderList(hospitalId, departments[deptSel]._id, dateSel, mealType);
        }
      }
    });
  }

  function getOrderList(hospitalId, departmentId, dateSel, mealType) {
    console.log("In getOrderList, hospitalId: " + hospitalId + " departmentId: " + departmentId + " dateSel: " + dateSel + " mealType: " + mealType);

    Service.getOrderList({
      'hospitalId': hospitalId,
      'departmentId': departmentId,
      'orderDate': dateSel,
      'mealType': mealType
    }).then(function(res){
      if (res.success) {
        console.log(res.page);
        console.log(res.data);
        Template.render('#orderInfoTpl', res.data);
        Utils.bindEvents(
          [{
                  element: '.confirm',
                  event: 'click',
                  handler: goConfirm
                },{
                  element: '.unsubscribe',
                  event: 'click',
                  handler: goUnsubscribe
                }
            ]
          );
      }
    });
  }

  function goConfirm() {
    var orderId = $$(this).data('id');
    //f7.alert(id);
    Service.confirmOrder(orderId).then(function(res){
      if (res.success) {
        console.log("It's confirmed. ID: " + orderId);
        $$('#'+orderId).html('<span>已确定</span>');
      }
    });
  }

  function goUnsubscribe() {
    var orderId = $$(this).data('id');

    var modal = f7.modal({
      title: '确认需要退订吗？',
      //text: '好的?',
      afterText:  '<div class="list-block">'+
                    '<ul>'+
                      '<li class="align-top">'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<textarea id="txtreason" placeholder="请输入退订理由"></textarea>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                      '<li>'+
                        '<p class="buttons-row">'+
                          '<a id="btn-not-allowed" href="#" class="button">与医嘱不符</a>'+
                          '<a id="btn-soldout" href="#" class="button">已售完</a>'+
                        '</p>'+
                      '</li>'+
                    '</ul>'+
                  '</div>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认退订',
          bold: true,
          onClick: function () {
            var txt = $$('#txtreason').val();
            console.log("退订理由： " + txt);
            Service.unsubscribeOrder(orderId, txt).then(function(res){
              if (res.success) {
                console.log("It's confirmed. ID: " + orderId);
                $$('#'+orderId).html('<span>已退订</span>');
              }
            }); 
            f7.alert('谢谢!已退订！');
          }
        },
      ]
    });
    console.log('---------------------------goUnsubscribe');

    Utils.bindEvents(
      [{
            element: '#btn-not-allowed',
            event: 'click',
            handler: goNotConform
          },{
            element: '#btn-soldout',
            event: 'click',
            handler: goSoldOut
          }
      ]
    );
  }

  function goNotConform() {
    //console.log("It's not conformed with yizhu.");
    var txt = $$('#txtreason').val();
    //console.log("txt: " + txt);
    txt = txt + "与医嘱不符";
    $$('#txtreason').val(txt);
  }

  function goSoldOut() {
    //console.log("It's sold out.");
    var txt = $$('#txtreason').val();
    //console.log("txt: " + txt);
    txt = txt + "已售完";
    $$('#txtreason').val(txt);
  }

  return Module;
});