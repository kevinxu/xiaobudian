const mongoose = require('mongoose');
const Promise = global.Promise;

const DishTypeSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true
  },
  openId: {
    type: String,
    required: true
  },
  dishType: {
    type: String,
    required: true
  },
  updateTime: {
    type: Date,
    default: Date.now
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

DishTypeSchema.statics = {

  /**
   * Get order data
   *
   * @param {number} id
   * @returns {Promise<Order, Error>}
   */
  get(filter) {
    return this.findOne(filter)
      .exec();
  },

  // This function name cannot be named as update() which is the same name as that in library.
  updateOne(dishId, data) {
    return this.update({'_id': dishId}, {$set: data})
            .exec()
            .then(dishes => {
              console.log(dishes);
              if (dishes) {
                return dishes;
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

module.exports = mongoose.model('restaurantdishtype', DishTypeSchema);
