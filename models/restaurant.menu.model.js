const mongoose = require('mongoose');
const Promise = global.Promise;

const MenuSchema = new mongoose.Schema({
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
  dishTypeId: {
    type: String,
    required: true
  },
  dishName: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

MenuSchema.statics = {

  /**
   * Get order data
   *
   * @param {number} id
   * @returns {Promise<Order, Error>}
   */
  get(id) {
    return this.findOne({id: id})
      .exec()
      .then(catalog => {
        if (catalog) {
          return catalog
        }

        const err = new Error('No such order exists!')
        return Promise.reject(err);
      });
  },

  // This function name cannot be named as update() which is the same name as that in library.
  updateOne(condition, data) {
    return this.update(condition, {$set: data})
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

  updateMulti(condition, data) {
      return this.update(condition, {$set: data}, {multi: true})
            .exec()
            .then(dishes => {
              console.log(dishes);
              if (dishes) {
                return dishes;
              }

              const err = new Error('Update multi failed!');
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
  list(data) {

    return this.find(data)
      .exec();
  },

  listAll() {
    return this.find()
    .exec();
  }
};

module.exports = mongoose.model('restaurantmenu', MenuSchema);
