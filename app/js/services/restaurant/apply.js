define(['services/base'], function (Service) {
  var Apply = {

    apply: function (data) {
      return Service.getData({
        method: 'post',
        url: '/api/restaurant/apply',
        data: data,
        isQuiet: true
      });
    }
  };

  return Apply;
});