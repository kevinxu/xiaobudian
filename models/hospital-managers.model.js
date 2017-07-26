const mongoose = require('mongoose');
const Promise = global.Promise;

const ManagersSchema = new mongoose.Schema({
  openId: {
    type: String,
    required: true,
    unique: true
  },
  hospitalId: {
    type: String
  },
  // 0 - normal manager; 1 - hospital creator
  superManager: {
    type: Number
  },
  nickName: {
    type: String
  },
  // 1 - subscribe, 2 - unsubscribe
  subscribeStatus: {
    type: Number
  },
  sex: {
    type: String
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
  // 微信字段
  remark: {
    type: String
  },
  // 1 - unbind; 0 - bind;
  disabled: {
    type: Number
  },
  // 私有字段
  remarkName: {
    type: String
  },
  // 医院二维码 含hospitalId和openId
  hospitalQrCode: {
    type: String
  },
  // 二维码过期日期
  qrCodeExpireDate: {
    type: String
  },
  createdTime: {
    type: Date,
    default: Date.now
  }
});

ManagersSchema.statics = {

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
  updateOne(managerOpenId, data) {
    return this.update({'openId': managerOpenId}, {$set: data})
            .exec()
            .then(mgr => {
              console.log("updateOne: ")
              console.log(mgr);
              if (mgr) {
                return mgr;
              }

              const err = new Error('Update failed!');
              return Promise.reject(err);
            });
  },

  list(data) {
    return this.find(data)
      .exec();
  },

  listAll() {
    return this.find()
    .exec();
  }
};

module.exports = mongoose.model('managers', ManagersSchema);
