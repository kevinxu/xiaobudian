const mongoose = require('mongoose');
const Promise = global.Promise;

const OrderSchema = new mongoose.Schema({
  openId: {
    type: String,
    required: true
  },
  hospitalId: {
    type: String,
    required: true
  },
  departmentId: {
    type: String,
    required: true
  },
  departmentName: {
    type: String,
  },
  orderDate: {
    type: String,
    required: true
  },
  orderMealType: {
    type: String,
    required: true
  },
  remarks: [String],
  patientName: {
    type: String
  },
  inHospitalId: {
    type: String
  },
  patientMobile: {
    type: Number
  },
  patientBedNo: {
    type: String
  },
  totalFee: {
    type: Number
  },
  orderTimeTips: {
    // 0-前一天；1-当天
    reminderDay: {
      type: Number
    },
    reminderTime: {
      type: String
    },
    shippingStart: {
      type: String
    },
    shippingEnd: {
      type: String
    }
  },
  dishes: [
    {
      dishId: {
        type: String,
        required: true
      },
      dishType: {
        type: String
      },
      dishName: {
        type: String
      },
      price: {
        type: Number
      },
      count: {
        type: Number
      }
    }
  ],
  // 操作类型： 1: 未确认； 2：已确认； 3：已退订
  op: {
    type: Number,
    default: 1
  },
  // 订单状态：0-订单保存未提交；1-订单已提交未确认；2-订单已确认；3-订单被管理员退回；4-订单已撤回
  status: {
    type: Number,
    default: 0
  },
  // 退订理由
  comment: {
    type: String,
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.statics = {

  /**
   * Get order data
   *
   * @param {number} id
   * @returns {Promise<Order, Error>}
   */
  get(data) {
    return this.findOne(data)
      .exec();
  },

  // This function name cannot be called update() which is the same name as that in library.
  updateOne(orderId, data) {
    //return this.update({_id: orderId}, {$set: data}, false, false)
    return this.update({_id: orderId}, {$set: data})
            .exec()
            .then(order => {
              console.log(order);
              if (order) {
                //console.log(order);
                return order;
              }

              const err = new Error('Update failed!');
              return Promise.reject(err);
            });
  },

  /**
   * List orders in descending order of given 'sort' param.
   *
   * @param {number} limit - Limit number of catalogs to be returned.
   * @param {number} skip - Number of catalogs to be skipped.
   * @param {string} sort - sort by.
   * @returns {Promise<Catalog[]>}
   */
  list(filter) {

    return this.find(filter)
      .exec();
  },

  listAll() {
    return this.find()
    .exec();
  }
};

module.exports = mongoose.model('orders', OrderSchema);
