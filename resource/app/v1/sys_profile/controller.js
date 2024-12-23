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
  session.startTransaction();
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

    await session.commitTransaction();
    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: null,
    });
  } catch (err) {
    session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

controller.fetchResume = async (req, res, next) => {
  /*
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
  /*
    #swagger.tags = ['PROFILE']
    #swagger.summary = 'profile'
    #swagger.description = 'untuk referensi group'
  */
  try {
    // Get data user by login
    const profile = await SysUserSchema.findOne({
      auth_id: req.login._id,
    })
      .select("-createdAt -updatedAt")
      .populate([
        {
          path: "skills",
          select: "-createdAt -updatedAt",
        },
      ]);
    const [experiences, educations] = await Promise.all([
      // Get data experiences
      await SysTrxExperienceSchema.find({ user_id: profile._id })
        .select("-createdAt -updatedAt -user_id")
        .populate({ path: "stacks", select: "-createdAt -updatedAt" })
        .sort({ key: 1 }),

      // Get data education
      await SysTrxEducationSchema.find({ user_id: profile._id })
        .select("-createdAt -updatedAt -user_id")
        .sort({ key: 1 }),
    ]);

    const dataResponse = {
      ...profile._doc,
      experiences,
      educations,
    };

    responseAPI.MethodResponse({
      res,
      method: methodConstant.POST,
      data: dataResponse,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = controller;
