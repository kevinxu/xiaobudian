const mongoose = require('mongoose');
const Promise = global.Promise;

const PatientSchema = new mongoose.Schema({
  openId: {
    type: String,
    required: true,
    unique: true
  },
  hospitalId: {
    type: String
  },
  departmentId: {
    type: String
  },
  departmentName: {
    type: String
  },
  // 1 - subscribe, 2 - unsubscribe
  subscribeStatus: {
    type: Number,
    default: 2
  },
  nickName: {
    type: String
  },
  // 1 -man, 2 - female, 0 - unknown
  sex: {
    type: Number
  },
  city: {
    type: String
  },
  province: {
    type: String
  },
  country: {
    type: String
  },
  headImgUrl: {
    type: String
  },
  remark: {
    type: String
  },
  realName: {
    type: String
  },
  mobile: {
    type: Number
  },
  // 住院号
  inHospitalId: {
    type: String
  },
  bedNo: {
    type: String
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

PatientSchema.statics = {

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
  updateOne(openId, data) {
    return this.update({'openId': openId}, {$set: data})
            .exec()
            .then(patient => {
              console.log("updateOne: ")
              console.log(patient);
              if (patient) {
                return patient;
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

module.exports = mongoose.model('patient', PatientSchema);
