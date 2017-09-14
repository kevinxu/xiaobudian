define([
  'utils',
  'services/confirm-order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;
  var departmentId = window.departmentId;
  var orderInCache;

  var Module = {
    init: function (query) {
    	console.log("openId is: " + openId);
    	Utils.bindEvents(this.methods());

    	getPatientInfo();
    	loadOrderFromCache();
    },

    methods: function () {
      return [{
        element: '#btn-remark-diabetes',
        event: 'click',
        handler: onToggleDiabetes
      }, {
      	element: '#btn-remark-lowsalt',
      	event: 'click',
      	handler: onToggleLowsalt
      }, {
      	element: '#btn-remark-lowfat',
      	event: 'click',
      	handler: onToggleLowfat
      }, {
      	element: '#btn-confirm-my-order',
      	event: 'click',
      	handler: onConfirmOrder
      }, {
      	element: '#btn-help-bed',
      	event: 'click',
      	handler: onPromptHelp
      }];
    }
  };

  function onPromptHelp() {
  	f7.modal({
  		title: '床头卡提示',
  		text: '<div class="bedinfo-image"><img src="img/bedinfo.png" style="display:block"></div>',
  		buttons: [
  			{
  				text: '确认'
  			}
  		]
  	});
  }

  function onToggleDiabetes() {
  	console.log("onToggleDiabetes");
  	$$(this).toggleClass('active');
  }

  function onToggleLowsalt() {
  	$$(this).toggleClass('active');
  }

  function onToggleLowfat() {
  	$$(this).toggleClass('active');
  }

  function onConfirmOrder() {
  	console.log("onConfirmOrder");

  	var name = $$('#ipt-patient-name').val();
  	if (!name) {
  		f7.alert("请输入患者姓名！");
  		return;
  	}
  	var inhospitalId = $$('#ipt-patient-inhospital-id').val();
  	if (!inhospitalId) {
  		f7.alert("请输入住院号！");
  		return;
  	}
  	var mobile = $$('#ipt-patient-mobile').val();
  	if (!mobile) {
  		f7.alert("请输入手机号！");
  		return;
  	}

  	var validator = {
      tel: /^(13|14|15|18)[0-9]{9}$/
    };
    if (!validator.tel.test(mobile)) {
      f7.alert('请输入正确的手机号码');
      return;
    }
    var bedNo = $$('#ipt-patient-bedno').val();
  	if (!bedNo) {
  		f7.alert("请输入床位号！");
  		return;
  	}

  	var remark = [];
  	if ($$('#btn-remark-diabetes').hasClass('active')) {
  		remark.push("diabetes");
  	}
  	if ($$('#btn-remark-lowsalt').hasClass('active')) {
  		remark.push("lowsalt");
  	}
  	if ($$('#btn-remark-lowfat').hasClass('active')) {
  		remark.push("lowfat");
  	}

    Service.submitOrder({
      'openId': openId,
      'hospitalId': hospitalId,
      'departmentId': departmentId,
      'orderDate': orderInCache.orderDate,
      'orderMealType': orderInCache.orderMealType,
      'orderTimeTips': orderInCache.orderTime,
      'remarks': remark,
      'patientName': name,
      'inHospitalId': inhospitalId,
      'patientMobile': mobile,
      'patientBedNo': bedNo,
      'totalFee': orderInCache.totalFee,
      'dishes': orderInCache.dishes
	}).then(function(res){
      if (res.success) {
      	console.log("Order submitted successfully.");
      	mainView.router.load({
          url: 'patient/my-order.html',
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

  function getPatientInfo() {

  	Service.getPatientInfo({
      'openId': openId
    }).then(function(res){
      if (res.success) {
      	if (res.data.mobile) {
      		console.log("user mobile exists: " + res.data.mobile);
      		$$('#txt-prompt').hide();
      	}
      	f7.formFromJSON('#form-patient-detail', res.data);
      }
  	});
  }

  function loadOrderFromCache() {

  	orderInCache = Utils.getCache('ORDER_IN_CACHE');

  	var orderDate = new Date(orderInCache.orderDate);
  	var month = orderDate.getMonth()+1+'月';
  	var date = orderDate.getDate() + '日';
  	var meal;
  	if (orderInCache.orderMealType == "breakfast") {
  		meal = "早餐";
  	}
  	else if (orderInCache.orderMealType == "lunch") {
  		meal = "午餐";
  	}
  	else if (orderInCache.orderMealType == "dinner") {
  		meal = "晚餐";
  	}

  	$$('#ipt-booking-date').val(month + date + "  " + meal);
  	$$('#my-total-fee').html(orderInCache.totalFee);

  	$$('#lbl-order-date').html(orderInCache.orderDate);
  	$$('#lbl-order-meal').html(meal);

  	$$('#ipt-shipping-time').val(orderInCache.orderTime.shippingStart + " - " + orderInCache.orderTime.shippingEnd);

  	Template.render('#orderDishesTpl', orderInCache.dishes);
  }

  return Module;
});