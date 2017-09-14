define([
  'utils',
  'services/customer/my-order',
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

  function getMyOrders() {

    Service.getOrderListByUserID({
      'openId': openId,
      'pageSize': pageSize,
      'pageNum': pageNum
    }).then(function(res){
      if (res.success) {

        console.log("my orders: " + JSON.stringify(res.data));
        var orders = [];
        for (var i = 0, len = res.data.length; i < len; i++) {
          orders.push(res.data[i]);
          var d = new Date(res.data[i].orderDate);
          orders[i].orderDate = d.format("yyyy-MM-dd");
          orders[i].orderTime = d.format("hh:mm");
        }

        Template.render('#orderListTpl', orders);
        Utils.bindEvents([{
          element: '.btn-edit-order',
          event: 'click',
          handler: onRevokeOrder
        }, {
          element: '.btn-view-reason',
          event: 'click',
          handler: onViewReason
        }]);
      }
    });
  }

  function loadOrders() {

    loadPage(pageNum);

    handleInfiniteScroll();
  }

  function loadPage(page) {
    Service.getOrderListByUserID({
      'openId': openId,
      'pageSize': pageSize,
      'pageNum': page
    }).then(function(res){
      if (res.success) {

        console.log("my orders pageNum: " + page + " list: " + JSON.stringify(res.data));
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
          for (var j = 0, l = orders[i].dishes.length; j < l; j++) {
            html += orders[i].dishes[j].dishName + 'x' + orders[i].dishes[j].count + '<br>';
          }
          html += '</td><td>' + orders[i].totalFee + '</td><td>';
          if (orders[i].status == 1) {
            html += '待确认<br><a id="btn-' + orders[i].orderId + '" href="#"' + ' class="button btn-edit-order" data-order-id="' + orders[i].orderId + '">撤销</a>';
          }
          else if (orders[i].status == 2) {
            html += '已确认';
          }
          else if (orders[i].status == 3) {
            html += '已退订<br><a id="btn-' + orders[i].orderId + '" href="#"' + ' class="button btn-view-reason" data-order-id="' + orders[i].orderId + '">理由</a>';
          }
          else if (orders[i].status == 4) {
            html += '已撤销';
          }
          else {
            html += '已确认';
          }
          html += '</td></tr>';
        }
     
        //console.log("html: " + html);
        var newHtml = $$('#tb-order-list').html() + html;
        // 添加新条目
        $$('#tb-order-list').html(newHtml);

        Utils.bindEvents([{
          element: '.btn-edit-order',
          event: 'click',
          handler: onRevokeOrder
        }, {
          element: '.btn-view-reason',
          event: 'click',
          handler: onViewReason
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

  function onViewReason() {
    var orderId = $$(this).data('order-id');
     console.log("onViewReason id: " + orderId);

    Service.onViewCancelReason({
      'orderId': orderId
    }).then(function(res){
      if (res.success) {
        console.log("view reason successfully.");
        console.log("cancel reason: " + res.data);
        f7.alert(res.data, "退订理由");
      }
    });   
  }

  function onRevokeOrder() {
    var orderId = $$(this).data('order-id');
    console.log("onRevokeOrder id: " + orderId);

    Service.onRevokeOrder({
      'orderId': orderId
    }).then(function(res){
      if (res.success) {
        console.log("revoke successfully.");
        $$('#btn-' + orderId).parent('td').html('已撤销');
      }
    });
  }

  return Module;
});