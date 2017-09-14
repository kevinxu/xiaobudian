define([
  'utils',
  'services/customer/readme',
  'template'
], function (Utils, Service, Template) {


  var openId = window.openId;
  var restaurantId = window.restaurantId;

  var Module = {
    init: function (query) {

      Service.getRestaurantInfo({
        'restaurantId': restaurantId
      }).then(function(res){
        if (res.success) {
          var restaurantName = res.data.restaurantName;
          Template.render('#restInfoTpl', {'restaurantName': restaurantName});
        }
      });
    },

    methods: function () {

    }
  };

  return Module;
});