const mongoose = require('mongoose');
const Promise = global.Promise;

const HospitalSchema = new mongoose.Schema({
  // 医院创建者的openId, 也即超管OpenId
  openId: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  departments: [
    {
      name: {
        type: String
      },
      qrCodePatient: {
        type: String
      },
      qrCodeHospital: {
        type: String
      },
      manager: {
        type: String
      }
    }
  ],
  orderTime: {
    breakfast: {
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
    lunch: {
      // 0 - 前一天; 1 - 当天
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
    dinner: {
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
    }
  },
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

HospitalSchema.statics = {

  /**
   * Get hospital data
   *
   * @param {number} id
   * @returns {Promise<Hospital, Error>}
   */
  get(data) {
    return this.findOne(data)
      .exec();
  },

  // This function name cannot be named as update() which is the same name as that in library.
  updateOne(hospitalId, data) {
    return this.update({'_id': hospitalId}, {$set: data})
            .exec()
            .then(hosp => {
              console.log("updateOne: ")
              console.log(hosp);
              if (hosp) {
                return hosp;
              }

              const err = new Error('Update failed!');
              return Promise.reject(err);
            });
  },

  getDept(hospitalId, deptName) {
    return this.find({
      'hospitalId': hospitalId
    })
      .exec()
      .then(hosp => {
        if (!hosp) {
          console.log("hospital id doesn't exist.");
          return Promise.reject(new Error('医院ID不存在！'));
        }
        var deptList = hosp.departments;
        var i;
        var len;
        console.log("getDept: " + hosp);
        for (i = 0, len = deptList.length; i < len; i++) {
          if (deptName == deptList[i].name) {
            break;
          }
        }

        if (i < len) {
          return deptList[i];
        }

        return Promise.reject(new Error('病区ID不存在！'));
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
  list(hospitalId, day, mealType, dishType) {

    return this.find({
      'hospitalId': hospitalId,
      'day': day,
      'meal': mealType,
      'dishType': dishType
    })
      .exec();
  },

  listAll() {
    return this.find()
    .exec();
  }
};

module.exports = mongoose.model('hospital', HospitalSchema);
