define(['services/base'], function (Service) {
  var Apply = {

    apply: function (data) {
      return Service.getData({
        method: 'post',
        url: '/api/hospital/apply',
        data: data,
        isQuiet: true
      });
    }
  };

  return Apply;
});