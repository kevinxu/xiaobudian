define([
  'appconfig',
  'router',
  'template'
], function (appConfig, Router, Template) {
  'use strict';

  var App = {
    init: function () {

      // Custom DOM library, save it to $$ variable:
      window.$$ = Dom7;

      // Instance of Framework7
      window.f7 = new Framework7(appConfig);

      // Add views
      window.mainView = f7.addView('#mainView', {
        dynamicNavbar: true,
        animatePages: false  // 页面切换动画
      });
    },

    boot: function () {
      Template.register();
      Router.init();
    }
  };

  return App;
});
