define([
  'utils',
  'services/restaurant/menu-setting',
  'template'
], function (Utils, Service, Template) {


  var openId = window.openId || Utils.getCache('USER_INFO').openId;
  var restaurantId = window.restaurantId;

  var targetHeight = [];

  var Module = {
    init: function (query) {

      Utils.bindEvents(this.methods());
      getMenuList();
    },

    methods: function () {
      return [{
        element: '#wrapper-rightarea',
        event: 'scroll',
        handler: onContentScroll
      }, {
        element: '#btn-add-dish-type',
        event: 'click',
        handler: onAddDishType
      }];
    }
  };

  function onAddDishType() {
    var modal = f7.modal({
      title: '新增菜品类型',
      afterText:  '<form id="form-dishtype-add" class="list-block">'+
                    '<ul>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-title label">菜品类型</div>'+
                            '<div class="item-input">'+
                              '<input type="text" id="dish-type" name="dish-type" placeholder="请输入菜品类型" autofocus="autofocus"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                    '</ul>'+
                  '</form>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          bold: true,
          onClick: function () {
            var dishType = $$('#dish-type').val();
            var data = {
              restaurantId: restaurantId,
              openId: openId,
              dishType: dishType
            };

            Service.addDishType(data).then(function(res){
              if (res.success) {
                console.log("Dish type is added successfully.");
                getMenuList();
              }
            });
          }
        },
      ]
    });    
  }

  function onAddDish() {
    var dishTypeId = $$(this).data('dish-type-id');
    var dishType = $$(this).data('dish-type');
    addDish(dishTypeId, dishType);
  }

  function addDish(dishTypeId, dishType) {

    var t = Utils.isUploadSupported();
    console.log("isUploadSupported: " + t);
    var modal = f7.modal({
      title: '新增菜品',
      afterText:  '<form id="form-dish-add" class="list-block">'+
                    '<ul>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" id="dish-name" name="dish-name" placeholder="请输入食谱名称" autofocus="autofocus"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="number" id="dish-price" name="dish-price" placeholder="请输入价格"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                    '</ul>'+
                    '<div class="txt-prompt" style="text-align:left">请上传图片：</div>' +
                    '<div style="height:50px">' +
                      '<input id="up-file" type="file" name="file" accept="image/*" style="opacity: 0;position: absolute;top: 180px;left: 10px;width: 70px;height: 70px;z-index: 2">' +
                      '<img src="img/upload.png" id="up-icon" style="position: absolute;top: 180px;left: 10px;width: 70px;height: 70px; overflow: hidden;line-height: 99em; no-repeat 0 0;z-index: 1;" />' +
                    '</div>' +
                  '</form>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          bold: true,
          onClick: function () {
            var formData = f7.formToJSON('#form-dish-add');
            var dishName = $$('#dish-name').val();
            var dishPrice = $$('#dish-price').val();
            var photo = $$('#up-icon').data('photo-key');

            console.log("photo key: " + photo);
            var data = {
              restaurantId: restaurantId,
              openId: openId,
              dishTypeId: dishTypeId,
              dishType: dishType,
              dishName: dishName,
              price: dishPrice,
              photo: photo
            };
            //f7.alert(JSON.stringify(formData));

            Service.addDish(data).then(function(res){
              if (res.success) {
                console.log("Dish is added successfully.");
                console.log(res.page);
                console.log(res.data);
                getMenuList();
              }
            });
          }
        },
      ]
    });
    console.log("after modal open.");

    Utils.bindEvents([
    {
      element: '.modal',
      event: 'opened',
      handler: openModal
    }
    ]);

    function openModal() {
      console.log("Modal open event is triggerred.");

      Utils.bindEvents([
        {
          element: '#up-file',
          event: 'change',
          handler: onChangeFile
        }
      ]);
    }

    function onChangeFile() {
      console.log("onChangeFile");
      readFile(this);
    }

    function uploadToQiniu2(form_id) {

       Service.getQiniuToken()
        .then(function(res) {
          console.log("qiniu token: " + res.uptoken);

          var formData = new FormData(document.getElementById(form_id));;

          formData.append('token', res.uptoken);

          $.ajax({
            type: 'POST',
            url: 'http://upload.qiniu.com/',
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
              if (data.key) {
                console.log('Your file was successfully uploaded! key: ' + data.key + " hash: " + data.hash);
              } else {
                alert('There was an error uploading your file! Error: ' + JSON.stringify(data));
              }
            },
            error: function (data) {
              alert('There was an error uploading your file! Error: ' + data.responseText);
            }
          });
        });     
    }

    function uploadToQiniu() {
      Utils.qiniuUploadImg('up-file', function(url, key) {
        console.log("file uploading url: " + url + " key: " + key);
      }, function(percent) {
        console.log("file uploading percent: " + percent);
      });
    }
  }

function readFile(input) {
  if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        $$('#up-icon').attr('src', e.target.result);
      }

      reader.onloadend = function () {
        console.log("onloadend");
        processFile(reader.result, input.files[0].type);
      }

      reader.onerror = function () {
        f7.alert('There was an error reading the file!');
      }

      reader.readAsDataURL(input.files[0]);
  }
}


function processFile(dataURL, fileType) {
  var maxWidth = 800;
  var maxHeight = 800;

  var image = new Image();
  image.src = dataURL;

  image.onload = function () {
    var width = image.width;
    var height = image.height;
    var shouldResize = (width > maxWidth) || (height > maxHeight);

    if (!shouldResize) {
      console.log("no need resize");
      sendFile(dataURL);
      return;
    }

    var newWidth;
    var newHeight;

    if (width > height) {
      newHeight = height * (maxWidth / width);
      newWidth = maxWidth;
    } else {
      newWidth = width * (maxHeight / height);
      newHeight = maxHeight;
    }

    var canvas = document.createElement('canvas');

    canvas.width = newWidth;
    canvas.height = newHeight;

    var context = canvas.getContext('2d');

    context.drawImage(this, 0, 0, newWidth, newHeight);

    dataURL = canvas.toDataURL(fileType);

    sendFile(dataURL);
  };

  image.onerror = function () {
    alert('There was an error processing your file!');
  };
}

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  //Old Code
  //write the ArrayBuffer to a blob, and you're done
  //var bb = new BlobBuilder();
  //bb.append(ab);
  //return bb.getBlob(mimeString);

  //New Code
  return new Blob([ab], {type: mimeString});
}

function sendFile(fileData) {
  //console.log("sendFile fileData: " + fileData);

  Service.getQiniuToken()
    .then(function(res) {
      console.log("qiniu token: " + res.uptoken);

      var blob = dataURItoBlob(fileData);
      var formData = new FormData();

      formData.append('token', res.uptoken);
      formData.append('file', blob);

      $.ajax({
        type: 'POST',
        url: 'http://upload.qiniu.com/',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
          if (data.key) {
            console.log('Your file was successfully uploaded! key: ' + data.key + " hash: " + data.hash);
            $$('#up-icon').attr('data-photo-key', data.key);
          } else {
            alert('There was an error uploading your file! Error: ' + JSON.stringify(data));
          }
        },
        error: function (data) {
          alert('There was an error uploading your file! Error: ' + data.responseText);
        }
      });
    });
}

  function tabDishTypeChange() {
    var typeIndex = $$(this).data('dish-type-index');

    console.log("typeIndex: " + typeIndex);
    $$(this).parents('#wrapper-leftarea').find('.btn-dish-type').removeClass('btn-active');
    $$(this).addClass('btn-active');

    console.log("target: " + targetHeight[typeIndex]);
    $$('#wrapper-rightarea').scrollTop(targetHeight[typeIndex], 500);
  }

  function onContentScroll() {
    //console.log("It's scroll.");
    var scrolltop = $$('#wrapper-rightarea').scrollTop();

    for (var i = 0, len = targetHeight.length; i < len; i++) {
      if (scrolltop <= targetHeight[i]) {
        //console.log("scrolltop: " + scrolltop + " index: " + i);
        $$('#wrapper-leftarea').find('.btn-dish-type').removeClass('btn-active');
        $$('#wrapper-id-' + i).addClass('btn-active');
        break;
      }
    }
  }

  function getMenuList() {

    Service.getDishTypes({
      'restaurantId': restaurantId
    }).then(function(res) {
      Template.render('#dishTypeInfoTpl', res.data);
      var dishes = res.data;
      $$('#wrapper-id-0').addClass('btn-active');

      Service.getMenuList({
        'restaurantId': restaurantId
      }).then(function(res){
        if (res.success) {
          console.log(res.page);
          console.log(res.data);
          var menus = [];


          for (var i = 0, len = res.data.length; i < len; i++) {
            for (var j = 0; j < dishes.length; j++) {
              if (res.data[i].dishTypeId == dishes[j].id) {
                if (!dishes[j].dishes) {
                  dishes[j].dishes = [];
                }
                dishes[j].dishes.push({
                  'dishName': res.data[i].dishName,
                  'price': res.data[i].price,
                  'id': res.data[i]._id,
                  'dishImage': res.data[i].photo ? res.data[i].photo : "img/avatar.png"
                });
              }
            }
          }
          
          Template.render('#detailMenuInfoTpl', dishes);

          targetHeight.push(0);
          for (var i = 1, len = dishes.length; i < len; i++) {
            var h = $$('#wrapper-food-' + i).outerHeight(true) + targetHeight[i - 1];
            console.log("i: " + i + " height: " + h);
            targetHeight.push(h);
          }

          Utils.bindEvents(
            [
              {
                element: '.dish-delete',
                event: 'click',
                handler: deleteDish
              },
              {
                element: '.dish-edit',
                event: 'click',
                handler: editDish
              },
              {
                element: '.btn-add-dish',
                event: 'click',
                handler: onAddDish
              },
              {
                element: '.dish-type-delete',
                event: 'click',
                handler: deleteDishType
              },
              {
                element: '.dish-type-edit',
                event: 'click',
                handler: editDishType
              },
              {
                element: '.btn-dish-type',
                event: 'click',
                handler: tabDishTypeChange,
              }
            ]);
        }
      });      
    });

  }

  function deleteDishType()  {
    var dishTypeId = $$(this).data('dish-type-id');

    Service.deleteDishType({
      'restaurantId': restaurantId,
      'dishTypeId': dishTypeId
    }).then(function(res){
      if (res.success) {
        console.log("delete dish type successfully.");
        getMenuList();
      }
    });
  }

  function editDishType() {
    var dishTypeId = $$(this).data('dish-type-id');
    var dishType = $$(this).data('dish-type');

    console.log("dishTypeId: " + dishTypeId + " type: " + dishType);

    var modal = f7.modal({
      title: '编辑菜品类型',
      afterText:  '<form id="form-dishtype-edit" class="list-block">'+
                    '<ul>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" id="dish-type-name" name="dish-type-name" placeholder="请输入类型名称"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                    '</ul>'+
                  '</form>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          bold: true,
          onClick: function () {
            var dishTypeName = $$('#dish-type-name').val();
            var data = {
              'restaurantId': restaurantId,
              'openId': openId,
              'dishTypeId': dishTypeId,
              'dishType': dishTypeName
            };

            Service.editDishType(data).then(function(res){
              if (res.success) {
                console.log("Dish type is updated successfully.");
                console.log(res.page);
                console.log(res.data);
                getMenuList();
              }
            });
          }
        },
      ]
    });

    console.log("Modal opened.");
    Utils.bindEvents([
    {
      element: '.modal',
      event: 'opened',
      handler: openModal
    }
    ]);

    function openModal() {
      console.log("Modal open event is triggerred.");
      $$('#dish-type-name').attr('value', dishType);
    }
  }

  function deleteDish() {
    var dishId = $$(this).data('id');

    Service.deleteDish({
      'restaurantId': restaurantId,
      'dishId': dishId
    }).then(function(res){
      if (res.success) {
        console.log("delete dish successfully.");
        getMenuList();
      }
    });
  }

  function editDish() {
    var dishId = $$(this).data('id');
    var dishName = $$(this).data('dish-name');
    var price = $$(this).data('price');
    var photo = $$(this).data('photo-url');
    console.log("dish name: " + dishName + " price: " + price + " photo: " + photo);

    var modal = f7.modal({
      title: '编辑菜品',
      afterText:  '<form id="form-dish-edit" class="list-block">'+
                    '<ul>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" id="dish-name" name="dish-name" placeholder="请输入食谱名称"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                      '<li>'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="number" id="dish-price" name="dish-price" placeholder="请输入价格"></input>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</li>'+
                    '</ul>'+
                    '<div class="txt-prompt" style="text-align:left">请上传图片：</div>' +
                    '<div style="height:50px">' +
                      '<input id="up-file" type="file" name="file" accept="image/*" style="opacity: 0;position: absolute;top: 180px;left: 10px;width: 70px;height: 70px;z-index: 2">' +
                      '<img id="up-icon" style="position: absolute;top: 180px;left: 10px;width: 70px;height: 70px; overflow: hidden;line-height: 99em; no-repeat 0 0;z-index: 1;" />' +
                    '</div>' +
                  '</form>',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          bold: true,
          onClick: function () {
            var dishName = $$('#dish-name').val();
            var dishPrice = $$('#dish-price').val();
            var photo = $$('#up-icon').data('photo-key');
            var data = {
              'restaurantId': restaurantId,
              'openId': openId,
              'dishId': dishId,
              'dishName': dishName,
              'price': dishPrice,
              'photo': photo
            };

            Service.editDish(data).then(function(res){
              if (res.success) {
                console.log("Dish is updated successfully.");
                console.log(res.page);
                console.log(res.data);
                getMenuList();
              }
            });
          }
        },
      ]
    });

    console.log("Modal opened.");
    Utils.bindEvents([
    {
      element: '.modal',
      event: 'opened',
      handler: openModal
    }
    ]);

    function openModal() {
      console.log("Modal open event is triggerred.");
      $$('#dish-name').attr('value', dishName);
      $$('#dish-price').attr('value', price);
      $$('#up-icon').attr('src', photo);

      Utils.bindEvents([
        {
          element: '#up-file',
          event: 'change',
          handler: onChangeFile
        }
      ]);
    }

    function onChangeFile() {
      console.log("onChangeFile");
      readFile(this);
    }
  }

  return Module;
});