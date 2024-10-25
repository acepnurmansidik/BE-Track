const SysUserSchema = require("../../models/sys_users");
const responseAPI = require("../../../utils/response");
const { methodConstant } = require("../../../utils/constanta");
const { default: mongoose } = require("mongoose");
const SysTrxEducationSchema = require("../../models/sys_trx_education");
const SysTrxExperienceSchema = require("../../models/sys_trx_experience");

const controller = {};

controller.updateResume = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['PROFILE']
    #swagger.summary = 'profile'
    #swagger.description = 'untuk referensi group'
    #swagger.parameters['obj'] = {
      in: 'body',
      description: 'Create role',
      schema: { $ref: '#/definitions/BodyProfileSchema' }
    }
  */
  const session = await mongoose.startSession();
  try {
    const payload = req.body;
    const data = await SysUserSchema.findOneAndUpdate(
      {
        auth_id: req.login._id,
      },
      { ...payload },
      { new: true, session },
    );

    payload.educations.map((edu) => (edu.user_id = data.id));
    payload.experiences.map((exp) => (exp.user_id = data.id));

    await Promise.all([
      await SysTrxEducationSchema.deleteMany({ user_id: data.id }, { session }),
      await SysTrxExperienceSchema.deleteMany(
        { user_id: data.id },
        { session },
      ),
      await SysTrxEducationSchema.insertMany(payload.educations, { session }),
      await SysTrxExperienceSchema.insertMany(payload.experiences, { session }),
    ]);

    session.endSession();

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
