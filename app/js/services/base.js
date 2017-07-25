define(['http', 'utils'], function (Http, Utils) {

  var OFFLINE_TITLE = '您正处于离线状态';
  var OFFLINE_ALERT = '网络异常，请检查网络设置！';
  var handleSuccess = Http.handleSuccess;
  var handleFail = Http.handleFail;
  var handleFailQuiet = Http.handleFailQuiet;

  var Service = {

    /**
     * 获取 API 接口数据
     * @param  {String} options.method       http method: get, post, put, delete
     * @param  {String} options.api          http uri
     * @param  {Object|String} options.data  post data or get query
     * @param  {Boolean} options.noCache     determine whether use cache
     * @return {Promise}
     */

    getData: function (options) {
      var method = options.method.toLowerCase();
      var url = options.url;
      var data = options.data;
      var noCache = options.noCache;
      var isQuiet = options.isQuiet;

      if (!navigator.onLine) { // 微信上不缓存接口
        f7.addNotification({
          title: OFFLINE_TITLE,
          message: OFFLINE_ALERT
        });
        // var cache = Utils.getCache(url);
        // if (cache && !noCache) {
        //   return Promise.resolve(cache);
        // }

        return Promise.resolve(undefined);
      } else {
        if (method === 'get') {
          return Http.get(url + data)
            .then(handleSuccess, isQuiet ? handleFailQuiet : handleFail);
        }

        return Http[method](url, data)
          .then(handleSuccess, isQuiet ? handleFailQuiet : handleFail);
      }

    }
  };

  return Service;
});
