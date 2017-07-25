define([], function () {
  'use strict';

  var Utils = {
    pageSize: 10,

    /**
     * Bind DOM event to some handler function in controller.
     * @param  {Array} bindings
     */
    bindEvents: function (bindings) {
      if ($$.isArray(bindings) && bindings.length > 0) {
        bindings.forEach(function (binding) {
          if (binding.parent) { // Live binding
            $$(binding.parent).on(binding.event, binding.element, binding.handler);
          } else {
            $$(binding.element).on(binding.event, binding.handler);
          }
        });
      }
    },

    unbindEvents: function (bindings) {
      if ($$.isArray(bindings) && bindings.length > 0) {
        bindings.forEach(function (binding) {
          if (binding.parent) { // Live binding
            $$(binding.parent).off(binding.event, binding.element, binding.handler);
          } else {
            $$(binding.element).off(binding.event, binding.handler);
          }
        });
      }
    },

    /**
     * Merge some JavaScript objects into one object.
     * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
     * @param  {Object} target
     * @return {Object}
     */
    extend: function (target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    },

    /* eslint-disable */

    /**
     * Converts an object to x-www-form-urlencoded serialization.
     * http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
     * @param  {Object} obj
     * @return {String}
     */
    serialize: function(obj) {
      var query = '',
        name,
        value,
        fullSubName,
        subName,
        subValue,
        innerObj,
        i;

      for (name in obj) {
        value = obj[name];

        if (value instanceof Array) {
          for (i = 0; i < value.length; ++i) {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += Utils.serialize(innerObj) + '&';
          }
        } else if (value instanceof Object) {
          for (subName in value) {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += Utils.serialize(innerObj) + '&';
          }
        } else if (value !== undefined && value !== null)
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }

      return query.length ? query.substr(0, query.length - 1) : query;
    },

    /* eslint-enable */

    loadState: function () {
      try {
        var serializedState = localStorage.getItem('state');
        if (serializedState === null) {
          return undefined;
        }
        return JSON.parse(serializedState);
      } catch (err) {
        return undefined;
      }
    },

    saveState: function (state) {
      try {
        var serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
      } catch (err) {}
    },

    clearState: function () {
      localStorage.removeItem('state');
    },

    saveCache: function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    getCache: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },

    clearCacheByKey: function (key) {
      localStorage.removeItem(key);
    },

    setHistoryItems: function (key) {
      if (key === '' || key === null) {
        return;
      }
      key = key.trim();
      var historyItems = localStorage.historyItems;
      if (historyItems === undefined) {
        localStorage.historyItems = key;
      } else {
        var onlyItem = historyItems.split('|');
        if (onlyItem.length > 0)
          {historyItems = key + '|' + onlyItem.join('|');}
        localStorage.historyItems = historyItems;
      }
    },

    getHistoryItems: function () {
      var historyItems = localStorage.historyItems;
      if (historyItems === undefined) {
        return;
      }
      return historyItems.split('|');
    },

    saveScrollTop: function (key, param) {
      var flag = false;
      var scrollTopList = Utils.getCache(key);
      var data = [];
      if (!scrollTopList) {
        data.push(param);
        Utils.saveCache(key, data);
      } else {
        for (var i = 0; i < scrollTopList.length; i++) {
          if (scrollTopList[i].classId === param.classId) {
            scrollTopList[i].top = param.top;
            flag = true;
            break;
          }
        }
        if (!flag) {
          scrollTopList.push(param);
        }
        Utils.saveCache(key, scrollTopList);
      }
    },

    getScrollTop: function (key, classId) {
      var scrollTopList = Utils.getCache(key);
      if (!scrollTopList) {
        return;
      }
      for (var i = 0; i < scrollTopList.length; i++) {
        if (scrollTopList[i].classId === classId) {
          var scrollTop = scrollTopList[i].top;
          // $$(element).scrollTop(scrollTopList[i].top);
          break;
        }
      }
      return scrollTop;
    },

    imgsLoaded: function (ele, callback) {
      var imgs = $$(ele).find('img');
      var imgList = Array.prototype.slice.call(imgs, 0);
      var promises = imgList.map(function (img) {
        return watchImgLoaded(img);
      });

      Promise.all(promises).then(callback);
    },

    changeWechatTitle: function (name) {
      document.title = name; // Android 内生效

      if (f7.device.ios) { // iOS 中需 hack
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('src', '/favicon.ico');
        iframe.addEventListener('load', function () {
          setTimeout(function () {
            iframe.removeEventListener('load', null);
            document.body.removeChild(iframe);
          }, 0);
        });
        document.body.appendChild(iframe);
      }
    },

    toCamel: function (str) {
      var reg = /-(\w)/g;
      return str.replace(reg, function () {
        var args = arguments;
        return args[1].toUpperCase();
      });
    },

    calculateAge: function(birthday){
      var aDate=birthday.split("-");
      var birthdayYear = parseInt(aDate[0]);
      var currentDate = new Date();
      var currentYear = parseInt(currentDate.getFullYear());
      return currentYear-birthdayYear;
      return 0;
    },

    initCalendar: function(ele){
      $$(ele).html(new Date().format('yyyy-MM-dd hh:mm'));
      var calendar = new datePicker();
      calendar.init({
        'trigger': ele, /*按钮选择器，用于触发弹出插件*/
        'type': 'datetime',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
        'minDate':'2010-1-1',/*最小日期*/
        'maxDate':new Date().format('yyyy-MM-dd'),/*最大日期*/
        'onSubmit':function(){/*确认时触发事件*/
          $$(ele).html(calendar.value);
        },
        'onClose':function(){/*取消时触发事件*/
        }
      });
    },

    qiniuUploadImg: function(browse_button, fileUploadFun, progressHandle) {
      var domain = 'http://ojp7zgdna.bkt.clouddn.com/';
      var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4', //上传模式,依次退化
        browse_button: browse_button, //上传选择的点选按钮，**必需**
        uptoken_url: '/upqiniu', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成   //node接口
        //uptoken_url : '/qiniu/commonToken',   //java接口
        //unique_names: true,
        multi_selection: false,
        domain: domain,
        flash_swf_url: '/plugins/qiniu/Moxie.swf',
        silverlight_xap_url: '/plugins/qiniu/Moxie.xap',
        max_file_size: '200mb', //最大文件体积限制
        max_retries: 2, //上传失败最大重试次数
        dragdrop: true, //开启可拖曳上传
        chunk_size: '4mb', //分块上传时，每片的体积
        auto_start: false, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        init: {
          'FilesAdded': function FilesAdded(up, files) {
            plupload.each(files, function (file) {
              if (file.name.indexOf('gif') == -1 && file.name.indexOf('GIF') == -1 && file.name.indexOf('jpg') == -1 && file.name.indexOf('png') == -1 && file.name.indexOf('bmp') == -1 && file.name.indexOf('PNG') == -1 && file.name.indexOf('JPG') == -1 && file.name.indexOf('BMP') == -1) {
                alert('图片格式不对！');
                uploader.removeFile(file.id);
                return;
              }
              document.getElementById('j_progress').style.display = 'block';
              uploader.start();
            });
          },
          'BeforeUpload': function BeforeUpload(up, file) {},
          'UploadProgress': function UploadProgress(up, file) {
            // 上传进度
            progressHandle(file.percent);
          },
          'FileUploaded': function FileUploaded(up, file, info) {
            //UTIL.closeLoading();
            console.log(file);
            var res = JSON.parse(info);
            var name = res.key;
            var domain = up.getOption('domain');
            var url = domain + name;

            fileUploadFun(url, res.key, file.name);
          },
          'Error': function Error(up, err, errTip) {
            //上传出错时,处理相关的事情
            //alert(err.message)
            //UTIL.closeLoading();
            console.log('err:');
            console.log(err);
            console.log('errTip:');
            console.log(errTip);
            if (err.message == 'HTTP Error.') {
              alert('网络超时，请刷新页面重试！');
            }
          },
          'UploadComplete': function UploadComplete(up, file, info) {}
        }
      });
    }
  };

  Date.prototype.format = function (format) {
    var date = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds(),
      'q+': Math.floor((this.getMonth() + 3) / 3),
      'S+': this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1
        ? date[k] : ('00' + date[k]).substr(('' + date[k]).length));
      }
    }
    return format;
  };


  function watchImgLoaded(img) {
    return new Promise(function (resolve, reject) {
      img.onload = function () {
        resolve('img loaded!');
      };
    });
  }
  return Utils;
});
