define(['utils'], function (Utils) {
  'use strict';

  function render(selector, data) {
    var $template = $$('script' + selector);
    var templateStr = $template.html();
    var $parent = $template.parent();
    var compiledTemplate = Template7.compile(templateStr);

    $parent.html($template[0].outerHTML);
    $parent.append(compiledTemplate(data));
  }

  function renderInfinite(selector, data) {   // 下拉加载更多的渲染
    var $template = $$('script' + selector);
    var templateStr = $template.html();
    var $parent = $template.parent();
    var compiledTemplate = Template7.compile(templateStr);

    $parent.append(compiledTemplate(data));
  }

  function preloaderShowOrHide(lastPage, parent) {
    var element = $$(parent).find('.infinite-scroll');
    if (lastPage) {
      f7.detachInfiniteScroll(element);
      $$(parent).find('.infinite-scroll-preloader').addClass('hidden');
      return;
    } else {
      f7.attachInfiniteScroll(element);
      $$(parent).find('.infinite-scroll-preloader').removeClass('hidden');
    }
  }

  function register() {

    /* eslint no-eval: "off" */
    Template7.registerHelper('compare', function (expression, options) {
      var func;
      if (expression.indexOf('return') >= 0) {
        func = '(function(){' + expression + '})';
      } else {
        func = '(function(){return (' + expression + ')})';
      }
      var context = Utils.extend(this, options.data);
      var condition = eval.call(context, func).call(context);
      if (condition) {
        return options.fn(this, options.data);
      } else {
        return options.inverse(this, options.data);
      }
    });

    // 评论
    Template7.registerHelper('comment', function (commentList,closed) {
      var html = '';
      var comment = 'icon-comment';
      var praise = 'icon-praise';
      var img = 'img/head-img.png';
      for (var i = 0; i < commentList.length; i++) {
        img = 'img/head-img.png';
        if (commentList[i].speaknum) {
          comment = 'icon-commented';
        }
        if (commentList[i].img && commentList[i].img.toString().indexOf('http') === -1) {
          img = window.qiniuDomain + '/' + commentList[i].img;
        } else if (commentList[i].img && commentList[i].img.toString().indexOf('http') !== -1) {
          img = commentList[i].img;
        }
        for (var j = 0; j < commentList[i].favInfo.result.length; j++) {
          if (commentList[i].favInfo.result[j].createId === Utils.loadState().id) {
            praise = 'icon-praised';
            break;
          }
        }
        html += '<li class="item-content item-comment" data-id="' + commentList[i].id + '">' +
          '<div class="item-media">' +
          '<img src="' + img + '" width="45" height="45">' +
          '</div>' +
          '<div class="item-inner">' +
          '<div class="item-title-row">' +
          '<div class="item-title">' + commentList[i].createName + '</div>' +
          '</div>' +
          '<div class="item-desc">' + commentList[i].content +
          '</div>' +
          '<div class="item-panel">' +
          '<div class="item-date">' + commentList[i].createDate + '</div>' +
          '<div class="item-option">';
        if (window.nurseId) {
          html += '<a href="pages/commentDetail.html?id=' + commentList[i].id + '&classId=' + commentList[i].classId + '&closed=' + closed + '&nurseId= ' + window.nurseId + '" class="item-link">';
        } else {
          html += '<a href="pages/commentDetail.html?id=' + commentList[i].id + '&classId=' + commentList[i].classId + '&closed=' + closed + '" class="item-link">';
        }
        html += '<i class="icon ' + comment + '"></i>' +
          '<span>' + commentList[i].speaknum + '</span>' +
          '</a>' +

          /* '<a href="#" class="item-link comment_praise">' +
          '<i class="icon ' + praise + '"></i>' +
          '<span class="praiseByComment">' + commentList[i].favInfo.totalCount + '</span>' +
          '</a>' +*/
          '</div>' +
          '</div>' +
          '</div>' +
          '</li>';
      }
      return html;
    });
  }

  return {
    render: render,
    renderInfinite: renderInfinite,
    preloaderShowOrHide: preloaderShowOrHide,
    register: register
  };
});
