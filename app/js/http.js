define(['utils'], function (Utils) {

  /* global args */
  var xhrTimeout;
  var timeout = 15000;
  var TIMEOUT_MSG = '连接超时，请稍后重试';

  var core = {

    // Method that performs the ajax request
    ajax: function (method, url, args) {

      // Creating a promise
      var promise = new Promise(function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var xhr = new XMLHttpRequest();
        var uri = url;

        f7.showIndicator();
        xhr.open(method, uri);

        if (args && (method === 'POST' || method === 'PUT')) {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
          xhr.send(Utils.serialize(args));
        } else {
          xhr.send();
        }

        xhr.onabort = function () {
          reject(TIMEOUT_MSG);
          if (xhrTimeout) {
            clearTimeout(xhrTimeout);
          }
        };

        xhrTimeout = setTimeout(function () {
          xhr.abort();
        }, timeout);

        xhr.onload = function () {
          if (xhrTimeout) {
            clearTimeout(xhrTimeout);
          }
          if (this.status >= 200 && this.status < 300) {
            var res = JSON.parse(this.response);
            if (res.success) {
              // Utils.saveCache(uri, res);
              resolve(res);
            } else {
              reject(res.errMsg);
            }
          } else {
            reject(this.statusText);
          }
        };

        xhr.onerror = function () {
          if (xhrTimeout) {
            clearTimeout(xhrTimeout);
          }
          reject(this.statusText);
        };
      });

      return promise;
    }
  };

  function handleSuccess(res) {
    f7.hideIndicator();
    return res;
  }

  function handleFail(msg) {
    f7.hideIndicator();
    f7.alert(msg);

    return false;
  }

  function handleFailQuiet(msg) {
    f7.hideIndicator();
    console.log(msg);

    return false;
  }

  // Adapter pattern
  return {
    get: function (url) {
      return core.ajax('GET', url);
    },
    post: function (url, args) {
      return core.ajax('POST', url, args);
    },
    put: function (url, args) {
      return core.ajax('PUT', url, args);
    },
    delete: function (url, args) {
      return core.ajax('DELETE', url, args);
    },

    // help handler
    handleSuccess: handleSuccess,
    handleFail: handleFail,
    handleFailQuiet: handleFailQuiet
  };
});
