define([
  'utils',
  'services/online-order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;
  var departmentId = window.departmentId;

  var weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var dateToday = new Date();
  var d = new Date();
  var today = days[d.getDay()];
  var tomorrow;
  var afterTomorrow;
  var daySel = today;
  var dateSel = d.getDate();
  var mealSel = "breakfast";
  var dishTypeSel = "regular";
  var heightRegular;
  var heightSemiFluid;
  var heightFuild;
  var heightMedical;
  var totalOrderNumber = 0;
  var totalOrderFee = 0;
  var dishes = [];
  var deptInfo;

  var Module = {
    init: function (query) {
    	var orderId = query.orderId;
    	if (orderId) {
    		console.log("orderId is not null: " + orderId);
    	}
    	else {
    		console.log("orderId is null.");
    	}
    	Utils.bindEvents(this.methods());

    	getHospitalInfo();

    	var chnToday = weekDays[d.getDay()];
    	d.setDate(d.getDate() + 1);
    	tomorrow = days[d.getDay()];
    	var chnTomorrow = weekDays[d.getDay()];
    	d.setDate(d.getDate() + 1);
    	afterTomorrow = days[d.getDay()];
    	var chnAfterTomorrow = weekDays[d.getDay()];

    	Template.render('#dayInfoTpl1', {'today': chnToday});
    	Template.render('#dayInfoTpl2', {'tomorrow': chnTomorrow});
    	Template.render('#dayInfoTpl3', {'afterTomorrow': chnAfterTomorrow});

    	getMenuList(today, mealSel, dishTypeSel, orderId);
    },

    methods: function () {
    	return [{
    		element: '.btn-day',
    		event: 'click',
    		handler: tabDayChange
    	}, {
    		element: '.btn-meal-type',
    		event: 'click',
    		handler: tabMealTypeChange
    	}, {
    		element: '.btn-dish-type',
    		event: 'click',
    		handler: tabDishTypeChange,
    	}, {
    		element: '#wrapper-rightarea',
    		event: 'scroll',
    		handler: onContentScroll
    	}, {
    		element: '#btn-confirm',
    		event: 'click',
    		handler: onConfirmOrder
    	}, {
    		element: '#btn-help-regular',
    		event: 'click',
    		handler: onClickHelpRegular
    	}, {
    		element: '#btn-help-semifluid',
    		event: 'click',
    		handler: onClickHelpSemiFluid
    	}, {
    		element: '#btn-help-fluid',
    		event: 'click',
    		handler: onClickHelpFluid
    	}, {
    		element: '#btn-help-medical',
    		event: 'click',
    		handler: onClickHelpMedical
    	}];
    }
  };

  function onClickHelpRegular() {
  	var content = "适用范围是没有特殊要求的病人的基本膳食，饮食原则①平衡膳食； ②注意色香味俱全；③少用油炸食物以及辛辣刺激性食物。";
  	var title = "普食";
  	f7.alert(content, title);
  }

  function onClickHelpSemiFluid() {
  	var content = "适用范围是①发热、体弱病人 ；②消化道疾患、消化不良； ③口腔疾患，影响咀嚼的病人； ④手术后恢复期和刚分娩的产妇。饮食原则是①半流体食物，营养丰富；②少食多餐，主食定量，非平衡膳食 ；③无刺激性、易于吞咽和消化的食物；④忌用油炸食物、粗纤维蔬菜和刺激性调味品。";
  	var title = "半流质";
  	f7.alert(content, title);
  }

  function onClickHelpFluid() {
  	var content = "适用范围是①高热病人；②吞咽困难、口腔疾患和手术后病人；③各种大手术、胃肠道手术后恢复饮食者；④急性消化道疾患；⑤重危或全身衰竭等病人。饮食原则是①食物呈液体状； ②非平衡饮食，只能短期使用。";
  	var title = "流质";
  	f7.alert(content, title);
  }

  function onClickHelpMedical() {
  	var content = "指在基本饮食的基础上，根据病情的需要，适当调整总热能和某些营养素而达到治疗目的的一种饮食。详情请咨询医护人员。";
  	var title = "治疗饮食";
  	f7.alert(content, title);
  }

  function saveOrder() {
  	var dishes = formatDishes();
  	var orderDate = new Date();
  	orderDate.setDate(dateSel);
  	var order = {
  		'openId': openId,
  		'hospitalId': hospitalId,
  		'orderDate': orderDate.format("yyyy-MM-dd"),
  		'orderMealType': mealSel,
  		'dishes': dishes,
  		'totalNumber': totalOrderNumber,
  		'totalFee': totalOrderFee,
  		'orderTime': deptInfo.orderTime[mealSel]
  	};

  	console.log("saveOrder: " + JSON.stringify(order));
  	Utils.saveCache('ORDER_IN_CACHE', order);
  }

  function formatDishes() {
  	var result = {};
  	var formattedDishes = [];
  	for (var i = 0, len = dishes.length; i < len; i++) {
  		if (!result[dishes[i].dishId]) {
  			formattedDishes.push(dishes[i]);
  			result[dishes[i].dishId] = 1;
  		}
  		else {
  			result[dishes[i].dishId]++;
  		}
  	}

  	var newFormated = [];
  	for (var i = 0, len = formattedDishes.length; i < len; i++) {
  		var obj = formattedDishes[i];
  		obj.count = result[formattedDishes[i].dishId];
  		newFormated.push(obj);
  	}

  	return newFormated;
  }

  function onConfirmOrder() {
  	console.log("onConfirmOrder");
  	if (totalOrderNumber == 0) {
  		f7.alert("您还没有点餐！");
  		return;
  	}

  	saveOrder();
	mainView.router.load({
		url: 'patient/confirm-order.html',
		query: {
			'openId': openId,
			'hospitalId': hospitalId,
			'originPath': originPath
		},
		animatePages: false
	});
  }

  function getHospitalInfo() {

  	Service.getHospitalInfo({
      'hospitalId': hospitalId,
      'departmentId': departmentId
    }).then(function(res){
      if (res.success) {
      	deptInfo = res.data;
      	console.log("deptInfo: " + JSON.stringify(deptInfo));
      	var hospitalName = res.data.hospitalName;
      	Template.render('#hospInfoTpl', {'hospitalName': hospitalName});
      }
  	});
  }

  function onContentScroll() {
  	//console.log("It's scroll.");
  	var scrolltop = $$('#wrapper-rightarea').scrollTop();
  	if (scrolltop < heightRegular) {
      $$('#wrapper-leftarea').find('.wrapper-btn-dish').removeClass('btn-active');
      $$('#btn-regular-food').addClass('btn-active');	
  	}
  	else if (scrolltop < (heightRegular + heightSemiFluid)) {
      $$('#wrapper-leftarea').find('.wrapper-btn-dish').removeClass('btn-active');
      $$('#btn-semi-food').addClass('btn-active');	 		
  	}
  	else if (scrolltop < (heightRegular + heightSemiFluid + heightFuild)) {
      $$('#wrapper-leftarea').find('.wrapper-btn-dish').removeClass('btn-active');
      $$('#btn-fluid-food').addClass('btn-active');  		
  	}
  	else {
      $$('#wrapper-leftarea').find('.wrapper-btn-dish').removeClass('btn-active');
      $$('#btn-medical-food').addClass('btn-active');    		
  	}
  }

  function tabDayChange() {
  	var sel = $$(this).data('day-sel');
  	var newDaySel;
  	var newDateSel;
  	if (sel == "today") {
  		newDaySel = today;
  		newDateSel = dateToday.getDate();
  	}
  	else if (sel == "tomorrow") {
  		newDaySel = tomorrow;
  		newDateSel = dateToday.getDate() + 1;
  	}
  	else if (sel == "after-tomorrow") {
  		newDaySel = afterTomorrow;
  		newDateSel = dateToday.getDate() + 2;
  	}
  	else {
  		console.log("invalid data.");
  		newDaySel = today;
  		newDateSel = dateToday.getDate();
  	}

  	if (daySel == newDaySel) {
  		return;
  	}
  	daySel = newDaySel;
  	dateSel = newDateSel;
  	totalOrderNumber = 0;
  	totalOrderFee = 0;
    $$('.day-highlight-line').remove();
    $$(this).append('<hr class="day-highlight-line" /></td>');
    $$('#total-order-number').html(totalOrderNumber);
  	$$('#bill-number').html(totalOrderFee);

    getMenuList(daySel, mealSel, dishTypeSel);
    //Utils.clearCacheByKey('ORDER_IN_CACHE');
  }

  function tabMealTypeChange() {
    var newMealSel = $$(this).data('day-sel');

    if (newMealSel == mealSel) {
    	return;
    }
    mealSel = newMealSel;
  	totalOrderNumber = 0;
  	totalOrderFee = 0;    

    $$('.meal-highlight-line').remove();
    $$(this).append('<hr class="meal-highlight-line" /></td>');
    $$('#total-order-number').html(totalOrderNumber);
  	$$('#bill-number').html(totalOrderFee);

    getMenuList(daySel, mealSel, dishTypeSel);
    //Utils.clearCacheByKey('ORDER_IN_CACHE');
  }

  function tabDishTypeChange() {
    dishTypeSel = $$(this).data('dish-type-sel');

    $$(this).parents('#dish-type-block').find('.wrapper-btn-dish').removeClass('btn-active');
    $$(this).parent('.wrapper-btn-dish').addClass('btn-active');

    if (dishTypeSel == "regular") {
    	$$('#wrapper-rightarea').scrollTop(0, 500);
    }
    else if (dishTypeSel == "semi-fluid") {
     	$$('#wrapper-rightarea').scrollTop(heightRegular, 500);
    }
    else if (dishTypeSel == "fluid") {
    	$$('#wrapper-rightarea').scrollTop(heightRegular + heightSemiFluid, 500);
    }
    else if (dishTypeSel == "medical-food") {
    	$$('#wrapper-rightarea').scrollTop(heightRegular + heightSemiFluid + heightFuild, 500);
    }
  }

  function getMenuList(day, meal, dish, orderId) {
    console.log("day: " + day + " meal: " + meal + " dish: " + dish + " orderId: " + orderId);

    Service.getMenuList({
      'hospitalId': hospitalId,
      'day': daySel,
      'mealType': mealSel
    }).then(function(res){
      if (res.success) {
        console.log(res.page);
        console.log(res.data);
        var regularDish = [];
        var semiDish = [];
        var fluidDish = [];
        var medicalDish = [];
        for (var i = 0, len = res.data.length; i < len; i++) {
        	if (res.data[i].dishType == "regular") {
        		regularDish.push(res.data[i]);
        	}
        	else if (res.data[i].dishType == "semi-fluid") {
        		semiDish.push(res.data[i]);
        	}
        	else if (res.data[i].dishType == "fluid") {
        		fluidDish.push(res.data[i]);
        	}
        	else if (res.data[i].dishType == "medical-food") {
        		medicalDish.push(res.data[i]);
        	}
        }
        Template.render('#regularMenuInfoTpl', regularDish);
        Template.render('#semiMenuInfoTpl', semiDish);
        Template.render('#fluidMenuInfoTpl', fluidDish);
        Template.render('#medicalMenuInfoTpl', medicalDish);
        heightRegular = $$('#wrapper-regular-food').outerHeight(true);
        heightSemiFluid = $$('#wrapper-semifluid-food').outerHeight(true);
        heightFuild = $$('#wrapper-fluid-food').outerHeight(true);
        heightMedical = $$('#wrapper-medical-food').outerHeight(true);
        dishes = [];
        Utils.bindEvents([{
        	element: '.btn-minus',
        	event: 'click',
        	handler: onMinusDish
        }, {
        	element: '.btn-plus',
        	event: 'click',
        	handler: onPlusDish
        }]);
      }
    });
  }

  function onMinusDish() {
  	var dishId = $$(this).data('dish-id');
  	var dishPrice = parseInt($$(this).data('dish-price'));
  	var str = $$('#dish-' + dishId).html();
  	var number = parseInt(str);

  	if (number > 0) {
  		number = number - 1;

  		for (var i = 0, len = dishes.length; i < len; i++) {
  			if (dishes[i].dishId == dishId) {
  				dishes.splice(i, 1);
  				break;
  			}
  		}

  		$$('#dish-' + dishId).html(number);

  		totalOrderNumber = totalOrderNumber - 1;
  		$$('#total-order-number').html(totalOrderNumber);

  		totalOrderFee = totalOrderFee - dishPrice;
  		$$('#bill-number').html(totalOrderFee);
  	}
  }

  function onPlusDish() {
  	var dishId = $$(this).data('dish-id');
  	var dishPrice = parseInt($$(this).data('dish-price'));
  	var dishType = $$(this).data('dish-type');
  	var dishName = $$(this).data('dish-name');
  	var str = $$('#dish-' + dishId).html();
  	var number = parseInt(str);

  	dishes.push({
  		'dishId': dishId,
  		'dishType': dishType,
  		'dishName': dishName,
  		'price': dishPrice
  	});
  	totalOrderNumber = totalOrderNumber + 1;
	number = number + 1;

	$$('#dish-' + dishId).html(number);
	$$('#total-order-number').html(totalOrderNumber);

	totalOrderFee = totalOrderFee + dishPrice;
	$$('#bill-number').html(totalOrderFee);
  }

  return Module;
});