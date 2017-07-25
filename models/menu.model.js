const mongoose = require('mongoose');
const Promise = global.Promise;

const MenuSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true
  },
  openId: {
    type: String,
    required: true
  },
  day: {
    type: String,
    enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    required: true
  },
  meal: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  dishType: {
    type: String,
    enum: ['regular', 'semi-fluid', 'fluid', 'medical-food'],
    required: true
  },
  dishName: {
    type: String,
    required: true
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
  list(data) {

    return this.find(data)
      .exec();
  },

  listAll() {
    return this.find()
    .exec();
  }
};

module.exports = mongoose.model('menu', MenuSchema);
