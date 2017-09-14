define([
  'utils',
  'services/menu-manage',
  'template'
], function (Utils, Service, Template) {


  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var hospitalId = window.hospitalId;

  var dayStr = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var daySel = 1;
  var mealSel = "breakfast";
  var heightRegular;
  var heightSemiFluid;
  var heightFuild;
  var heightMedical;
  var dishes = [];

  var Module = {
    init: function (query) {

      Utils.bindEvents(this.methods());
      getMenuList(dayStr[daySel], mealSel);
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
        element: '#btn-add-regular',
        event: 'click',
        handler: onAddRegularFood
      }, {
        element: '#btn-add-semifluid',
        event: 'click',
        handler: onAddSemiFluidFood
      }, {
        element: '#btn-add-fluid',
        event: 'click',
        handler: onAddFluidFood
      }, {
        element: '#btn-add-medical',
        event: 'click',
        handler: onAddMedicalFood
      }];
    }
  };

  function onAddRegularFood() {
    addDish("regular");
  }

  function onAddSemiFluidFood() {
    addDish("semi-fluid");
  }

  function onAddFluidFood() {
    addDish("fluid");
  }

  function onAddMedicalFood() {
    addDish("medical-food");
  }

  function addDish(dishType) {

    var modal = f7.modal({
      title: '新增菜品',
      afterText:  '<form id="form-dish-add" class="list-block">'+
                    '<ul>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" id="dish-name" name="dish-name" placeholder="请输入食谱名称"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="number" id="dish-price" name="dish-price" placeholder="请输入价格"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                    '</ul>'+
                  '</form>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          bold: true,
          onClick: function () {
            var formData = f7.formToJSON('#form-dish-add');
            var dishName = $$('#dish-name').val();
            var dishPrice = $$('#dish-price').val();
            var data = {
              hospitalId: hospitalId,
              openId: openId,
              day: dayStr[daySel],
              meal: mealSel,
              dishType: dishType,
              dishName: dishName,
              price: dishPrice
            };
            //f7.alert(JSON.stringify(formData));

            Service.addDish(data).then(function(res){
              if (res.success) {
                console.log("Dish is added successfully.");
                console.log(res.page);
                console.log(res.data);
                getMenuList(dayStr[daySel], mealSel);
              }
            });
          }
        },
      ]
    });
  }

  function tabDayChange() {
    var sel = parseInt($$(this).data('day-sel'));

    if (daySel == sel) {
      return;
    }
    daySel = sel;

    $$('.day-highlight-line').remove();
    $$(this).append('<hr class="day-highlight-line" /></td>');

    getMenuList(dayStr[daySel], mealSel);
  }

  function tabMealTypeChange() {
    var newMealSel = $$(this).data('meal-sel');

    if (newMealSel == mealSel) {
      return;
    }
    mealSel = newMealSel;

    $$('.meal-highlight-line').remove();
    $$(this).append('<hr class="meal-highlight-line" /></td>');

    getMenuList(dayStr[daySel], mealSel);
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

  function getMenuList(day, meal) {
    console.log("day: " + day + " meal: " + meal);

    Service.getMenuList({
      'hospitalId': hospitalId,
      'day': day,
      'mealType': meal
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
        Utils.bindEvents(
          [
            {
              element: '.dish-delete',
              event: 'click',
              handler: deleteDish
            },
            {
              element: '.dish-edit',
              event: 'click',
              handler: editDish
            }
          ]);
      }
    });
  }

  function deleteDish() {
    var dishId = $$(this).data('id');

    Service.deleteDish({
      'hospitalId': hospitalId,
      'day': dayStr[daySel],
      'meal': mealSel,
      'dishId': dishId
    }).then(function(res){
      if (res.success) {
        console.log("delete dish successfully.");
      }
    })
  }

  function editDish() {
    var dishId = $$(this).data('id');
    var dishName = $$(this).data('dish-name');
    var price = $$(this).data('price');
    var dishType = $$(this).data('dish-type');
    console.log("dish name: " + dishName + " price: " + price + " dishType: " + dishType);

    var modal = f7.modal({
      title: '编辑菜品',
      afterText:  '<form id="form-dish-edit" class="list-block">'+
                    '<ul>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" id="dish-name" name="dish-name" placeholder="请输入食谱名称"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="number" id="dish-price" name="dish-price" placeholder="请输入价格"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                    '</ul>'+
                  '</form>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          bold: true,
          onClick: function () {
            var formData = f7.formToJSON('#form-dish-edit');
            var dishName = $$('#dish-name').val();
            var dishPrice = $$('#dish-price').val();
            var data = {
              'hospitalId': hospitalId,
              'openId': openId,
              'dishId': dishId,
              'day': dayStr[daySel],
              'meal': mealSel,
              'dishType': dishType,
              'dishName': dishName,
              'price': dishPrice
            };

            Service.editDish(data).then(function(res){
              if (res.success) {
                console.log("Dish is updated successfully.");
                console.log(res.page);
                console.log(res.data);
                getMenuList(dayStr[daySel], mealSel);
              }
            });
          }
        },
      ]
    });

    console.log("Modal opened.");
    Utils.bindEvents([
    {
      element: '.modal',
      event: 'opened',
      handler: openModal
    }
    ]);

    function openModal() {
      console.log("Modal open event is triggerred.");
      $$('#dish-name').attr('value', dishName);
      $$('#dish-price').attr('value', price);
    }
  }

  return Module;
});