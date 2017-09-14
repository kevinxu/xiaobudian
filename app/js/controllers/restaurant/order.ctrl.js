define([
  'utils',
  'services/restaurant/order',
  'template'
], function (Utils, Service, Template) {

  var openId = window.openId;
  var restaurantId = window.restaurantId;
  var pageSize = 15;
  var pageNum = 0;
  var loadingLast = false;

  var Module = {
    init: function (query) {
      pageNum = 0;
      loadingLast = false;
      loadOrders();
    },

    methods: function () {

    }
  };

  function loadOrders() {

    loadPage(pageNum);

    handleInfiniteScroll();
  }

  function loadPage(page) {
    Service.getOrderListByRestaurantID({
      'restaurantId': restaurantId,
      'pageSize': pageSize,
      'pageNum': page
    }).then(function(res){
      if (res.success) {

        console.log("restaurant orders pageNum: " + page + " list: " + JSON.stringify(res.data));
        if (res.data.length < pageSize) {
          loadingLast = true;
        }

        var orders = [];
        for (var i = 0, len = res.data.length; i < len; i++) {
          orders.push(res.data[i]);
          var d = new Date(res.data[i].orderDate);
          orders[i].orderDate = d.format("yyyy-MM-dd");
          orders[i].orderTime = d.format("hh:mm");
        }

        // 生成新条目的HTML
        var html = '';
        for (var i = 0, len = orders.length; i < len; i++) {
          html += '<tr><td>' + orders[i].orderDate + '<br>' + orders[i].orderTime + '</td><td>';
          html += orders[i].deskName + '</td><td>';
          for (var j = 0, l = orders[i].dishes.length; j < l; j++) {
            html += orders[i].dishes[j].dishName + 'x' + orders[i].dishes[j].count + '<br>';
          }
          html += '</td><td>' + orders[i].totalFee + '</td><td><div id="' + orders[i].orderId +'">';
          if (orders[i].status == 1) {
            html += '<a id="confirm-' + orders[i].orderId + '" href="#"' + ' class="button btn-confirm" data-order-id="' + orders[i].orderId + '">确定</a>';
            html += '<a id="unsubscribe-' + orders[i].orderId + '" href="#"' + ' class="button btn-unsubscribe" data-order-id="' + orders[i].orderId + '">退订</a>';
          }
          else if (orders[i].status == 2) {
            html += '<span>已确认</span>';
          }
          else if (orders[i].status == 3) {
            html += '<span>已退订</span>';
          }
          else if (orders[i].status == 4) {
            html += '已撤销';
          }
          else {
            html += '<a id="confirm-' + orders[i].orderId + '" href="#"' + ' class="button btn-confirm" data-order-id="' + orders[i].orderId + '">确定</a>';
            html += '<a id="unsubscribe-' + orders[i].orderId + '" href="#"' + ' class="button btn-unsubscribe" data-order-id="' + orders[i].orderId + '">退订</a>';
          }
          html += '</div></td></tr>';
        }
     
        //console.log("html: " + html);
        var newHtml = $$('#tb-order-list').html() + html;
        // 添加新条目
        $$('#tb-order-list').html(newHtml);

        Utils.bindEvents([{
          element: '.btn-confirm',
          event: 'click',
          handler: onConfirm
        }, {
          element: '.btn-unsubscribe',
          event: 'click',
          handler: onUnsubscribe
        }]);
      }
    });   
  }

  function handleInfiniteScroll() {
    // 加载flag
    var loading = false;

    // 注册'infinite'事件处理函数
    $$('.infinite-scroll').on('infinite', function () {
      //$$('.infinite-scroll-preloader').show();
     
      // 如果正在加载，则退出
      if (loading) return;
     
      // 设置flag
      loading = true;
     
      // 模拟1s的加载过程
      setTimeout(function () {
        // 重置加载flag
        loading = false;
     
        if (loadingLast) {
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          f7.detachInfiniteScroll($$('.infinite-scroll'));
          // 删除加载提示符
          $$('.infinite-scroll-preloader').remove();
          return;
        }

        pageNum++;
        loadPage(pageNum);
     
      }, 500);
    });
  }

  function onConfirm() {
    var orderId = $$(this).data('order-id');
    //f7.alert(id);
    Service.confirmOrder(orderId).then(function(res){
      if (res.success) {
        console.log("It's confirmed. ID: " + orderId);
        $$('#'+orderId).html('<span>已确定</span>');
      }
    });
  }

  function onUnsubscribe() {
    var orderId = $$(this).data('order-id');

    var modal = f7.modal({
      title: '确认需要退订吗？',
      //text: '好的?',
      afterText:  '<div class="list-block">'+
                    '<ul>'+
                      '<li class="align-top">'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<textarea id="txtreason" placeholder="请输入退订理由"></textarea>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                      '<li>'+
                        '<p class="buttons-row">'+
                          '<a id="btn-soldout" href="#" class="button">已售完</a>'+
                        '</p>'+
                      '</li>'+
                    '</ul>'+
                  '</div>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认退订',
          bold: true,
          onClick: function () {
            var txt = $$('#txtreason').val();
            console.log("退订理由： " + txt);
            Service.unsubscribeOrder(orderId, txt).then(function(res){
              if (res.success) {
                console.log("It's confirmed. ID: " + orderId);
                $$('#'+orderId).html('<span>已退订</span>');
              }
            }); 
            f7.alert('谢谢!已退订！');
          }
        },
      ]
    });
    console.log('---------------------------onUnsubscribe');

    Utils.bindEvents(
      [{
            element: '#btn-soldout',
            event: 'click',
            handler: goSoldOut
        }
      ]
    );
  }

  function goSoldOut() {
    //console.log("It's sold out.");
    var txt = $$('#txtreason').val();
    //console.log("txt: " + txt);
    txt = txt + "已售完";
    $$('#txtreason').val(txt);
  }

  return Module;
});