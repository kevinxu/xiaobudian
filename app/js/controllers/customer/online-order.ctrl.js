define([
  'utils',
  'services/customer/online-order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var restaurantId = window.restaurantId;
  var departmentId = window.departmentId;

  var targetHeight = [];

  var totalOrderNumber = 0;
  var totalOrderFee = 0;
  var dishes = [];
  var deptInfo;

  var Module = {
    init: function (query) {

    	Utils.bindEvents(this.methods());

    	getRestaurantInfo();

    	getMenuList();
    },

    methods: function () {
    	return [{
    		element: '#wrapper-rightarea',
    		event: 'scroll',
    		handler: onContentScroll
    	}, {
    		element: '#btn-confirm',
    		event: 'click',
    		handler: onConfirmOrder
    	}];
    }
  };

  function saveOrder() {
  	var dishes = formatDishes();
  	var order = {
  		'openId': openId,
  		'restaurantId': restaurantId,
  		'dishes': dishes,
  		'totalNumber': totalOrderNumber,
  		'totalFee': totalOrderFee
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
      obj.fee = obj.price * obj.count;
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
  		url: 'customer/confirm-order.html',
  		query: {
  			'openId': openId,
  			'restaurantId': restaurantId,
  			'originPath': originPath
  		},
  		animatePages: false
	  });
  }

  function getRestaurantInfo() {

  	Service.getRestaurantInfo({
      'restaurantId': restaurantId
    }).then(function(res){
      if (res.success) {
      	var restaurantName = res.data.restaurantName;
      	Template.render('#restInfoTpl', {'restaurantName': restaurantName});
      }
  	});
  }

  function onContentScroll() {
    var scrolltop = $$('#wrapper-rightarea').scrollTop();
    //console.log("It's scroll. scrolltop: " + scrolltop);

    for (var i = 0, len = targetHeight.length; i < len; i++) {
      if (scrolltop <= targetHeight[i]) {
        //console.log("scrolltop: " + scrolltop + " index: " + i);
        $$('#wrapper-leftarea').find('.btn-dish-type').removeClass('btn-active');
        $$('#wrapper-id-' + i).addClass('btn-active');
        break;
      }
    }
  }

  function tabDishTypeChange() {
    var typeIndex = $$(this).data('dish-type-index');

    console.log("typeIndex: " + typeIndex);
    $$(this).parents('#wrapper-leftarea').find('.btn-dish-type').removeClass('btn-active');
    $$(this).addClass('btn-active');

    console.log("target: " + targetHeight[typeIndex]);
    $$('#wrapper-rightarea').scrollTop(targetHeight[typeIndex], 500);
  }

  function getMenuList() {

    Service.getDishTypes({
      'restaurantId': restaurantId
    }).then(function(res) {
      Template.render('#dishTypeInfoTpl', res.data);
      var dishes = res.data;
      $$('#wrapper-id-0').addClass('btn-active');

      Service.getMenuList({
        'restaurantId': restaurantId
      }).then(function(res){
        if (res.success) {
          console.log(res.page);
          console.log(res.data);
          var menus = [];

          if (res.data.length == 0) {
            console.log("没有任何菜单信息！");
            return;
          }

          for (var i = 0, len = res.data.length; i < len; i++) {
            for (var j = 0; j < dishes.length; j++) {
              if (res.data[i].dishTypeId == dishes[j].id) {
                if (!dishes[j].dishes) {
                  dishes[j].dishes = [];
                }
                dishes[j].dishes.push({
                  'dishName': res.data[i].dishName,
                  'dishType': res.data[i].dishType,
                  'price': res.data[i].price,
                  'id': res.data[i]._id,
                  'dishImage': res.data[i].photo ? res.data[i].photo : "img/avatar.png"
                });
              }
            }
          }
          
          Template.render('#detailMenuInfoTpl', dishes);

          targetHeight.push(0);
          for (var i = 1, len = dishes.length; i < len; i++) {
            var t = i - 1;
            var h = $$('#wrapper-food-' + t).outerHeight(true) + targetHeight[t];
            //var h = $$('#wrapper-food-' + t).height() + targetHeight[t];
            console.log("i: " + i + " height: " + h);
            targetHeight.push(h);
          }

          Utils.bindEvents(
            [
              {
                element: '.btn-dish-type',
                event: 'click',
                handler: tabDishTypeChange,
              },
              {
                element: '.btn-minus',
                event: 'click',
                handler: onMinusDish
              }, {
                element: '.btn-plus',
                event: 'click',
                handler: onPlusDish
              }
            ]);
          }
      });      
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

    console.log("dishType: " + dishType + " dishName: " + dishName);

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