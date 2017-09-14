/* global define, require, $$, f7, mainView, secondView, thirdView */
define([
  'utils',
  'constant'
], function (Utils, PAGE_TITLE) {
  'use strict';

  // 返回不重新加载 controller 的页面
  var ignoreReinitPages = [];

  // 页面入口
  var PAGE = {
    // 医院端
    HOSPITAL_APPLY: 'hospital/apply.html',
    HOSPITAL_ORDER: 'hospital/order.html',
    HOSPITAL_NO_SETTING: 'hospital/no-setting.html',
    HOSPITAL_MENU_SETTING: 'hospital/menu-manage.html',
    HOSPITAL_SETTING: 'hospital/setting.html',

    // 患者端
    PATIENT_ORDER: 'patient/online-order.html',
    PATIENT_MY_ORDER: 'patient/my-order.html',
    PATIENT_READ_ME: 'patient/read-me.html',
    PATIENT_NO_SETTING: 'patient/no-setting.html',

    // 餐馆端
    RESTAURANT_SETTING: 'restaurant/setting.html',
    RESTAURANT_NO_SETTING: 'restaurant/no-setting.html',
    RESTAURANT_MENU_SETTING: 'restaurant/menu-setting.html',

    // 餐馆客户端
    CUSTOMER_ONLINE_ORDER: 'customer/online-order.html',
    CUSTOMER_NO_SETTING: 'customer/no-setting.html',
    CUSTOMER_ORDER_DONE: 'customer/order-done.html',
    CUSTOMER_MY_ORDER: 'customer/my-order.html',
    CUSTOMER_READ_ME: 'customer/read-me.html',
  };

  var CONTROLLER = {
    // 医院端
    hospitalSetting: 'hospital/setting',
    hospitalApply: 'hospital/apply',
    hospitalMenuManage: 'hospital/menu-manage',
    hospitalNoSetting: 'hospital/no-setting',
    hospitalOrder: 'hospital/order',
    hospitalTransferManager: 'hospital/transfer-manager',

    // 患者端
    patientOnlineOrder: 'patient/online-order',
    patientConfirmOrder: 'patient/confirm-order',
    patientMyOrder: 'patient/my-order',
    patientNoSetting: 'patient/no-setting',
    patientReadMe: 'patient/read-me',

    // 餐馆端
    restaurantSetting: 'restaurant/setting',
    restaurantApply: 'restaurant/apply',
    restaurantNoSetting: 'restaurant/no-setting',
    restaurantTransferManager: 'restaurant/transfer-manager',
    restaurantMenuSetting: 'restaurant/menu-setting',

    // 餐馆客户端
    customerOnlineOrder: 'customer/online-order',
    customerConfirmOrder: 'customer/confirm-order',
    customerOrderDone: 'customer/order-done',
    customerMyOrder: 'customer/my-order',
    customerReadMe: 'customer/read-me',
  };

  var Router = {
    init: function (callback) {

      // 监听页面初始化
      f7.onPageInit('*', function (page) {
        console.log("page.name:");
        console.log(page.name);
        console.log("page.query");
        console.log(page.query);
        load(page.name, page.query); // 加载页面 controller
      });

      var page = PAGE[window.entry.toUpperCase()];
      var query = {
        openId: window.openId,
        originPath: window.originPath
      }
      console.log('loadPage');
      loadPage(page, query);
 
      mainView.history.shift();
    }
  };

  /**
   * 页面跳转
   * @param  {string} page 页面
   */
  function loadPage(page, query) {
    mainView.router.load({
      url: page,
      query: query,
      animatePages: false
    });
  }

  /**
   * Load (or reload) controller from js code (another controller) - call it's init function
   * @param  name     页面控制器名称，取自 data-page
   * @param  query    页面 url 的 query 部分，比如 user.html?id=1001 中的 { id: 1001 }
   */
  function load(name, query) {
    // $$('title').html(pageTitle[name]);

    /*console.log(query);*/
    var title = Utils.toCamel(name);
    console.log("load: " + title);
    console.log("load: " + PAGE_TITLE[title]);
    if (PAGE_TITLE[title]) {

      Utils.changeWechatTitle(PAGE_TITLE[title]);
    }

    if (!name || name.indexOf('smart-select') !== -1) {
      return;
    }

    require(['controllers/' + CONTROLLER[title] + '.ctrl'], function (controller) {
      controller.init(query);

    });
  }

  /**
   * 返回修改页面名称
   */
  window.onpopstate = function (e) {

    if (e.state) {
      var pageUrl = e.state.url;
   
      console.log("onpopstate: " + e);

      var matches = pageUrl.match(/(([^(.|/)]+?)\.)/);
      var pageName = Utils.toCamel(matches[2]);
      console.log("pageName: " + pageName);
      Utils.changeWechatTitle(PAGE_TITLE[pageName]);      
    }
  };

  return Router;
});
