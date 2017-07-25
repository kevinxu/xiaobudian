define(['utils'], function (Utils) {

  var Auth = {
    isLogin: function () {
      var state = Utils.loadState();

      if (state) {
        return true;
      }

      return false;
    }
  };

  return Auth;
});
