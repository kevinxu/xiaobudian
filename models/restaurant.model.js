const mongoose = require('mongoose');
const Promise = global.Promise;

const RestaurantSchema = new mongoose.Schema({
  // 医院创建者的openId, 也即初始超管OpenId，一旦医院创建不会改变
  createrOpenId: {
    type: String,
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  desks: [
    {
      name: {
        type: String
      },
      qrCodeCustomer: {
        type: String
      },
      qrCodeRestaurant: {
        type: String
      },
      manager: {
        type: String
      }
    }
  ],
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: Number,
    required: true
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

RestaurantSchema.statics = {

  /**
   * Get restaurant data
   *
   * @param {number} id
   * @returns {Promise<Restaurant, Error>}
   */
  get(data) {
    return this.findOne(data)
      .exec();
  },

  // This function name cannot be named as update() which is the same name as that in library.
  updateOne(restaurantId, data) {
    return this.update({'_id': restaurantId}, {$set: data})
            .exec()
            .then(rest => {
              console.log("updateOne: ")
              console.log(rest);
              if (rest) {
                return rest;
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

module.exports = mongoose.model('restaurant', RestaurantSchema);
