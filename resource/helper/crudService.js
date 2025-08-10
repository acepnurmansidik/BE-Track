const { default: mongoose } = require("mongoose");

const crudServices = {};

// FIND BY ID
crudServices.findOneById = async (
  model,
  { id, populateField, selectField },
) => {
  try {
    const result = await model
      .findOne({ _id: id, is_delete: { $ne: true } })
      .populate(populateField)
      .select(`${selectField ?? ""} -__v -updatedAt -is_delete`)
      .lean();

    if (!result) throw new Error(`data with id: '${id}' not found!`);

    return {
      success: true,
      message: "Data retrieved successfully!",
      data: result,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// FINDONE
crudServices.findOne = async (model, { query, populateField, selectField }) => {
  try {
    const result = await model
      .findOne({ ...query, is_delete: { $ne: true } })
      .populate(populateField)
      .select(`${selectField ?? ""} -__v -updatedAt -is_delete`)
      .lean();

    if (!result) throw new Error(`data not found!`);

    return {
      success: true,
      message: "Data retrieved successfully!",
      data: result,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// CREATE
crudServices.create = async (model, { data }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await model.create([data], { session });

    await session.commitTransaction();

    delete result[0].is_delete;
    delete result[0].updatedAt;
    return {
      success: true,
      message: "Data created successfully!",
      data: result[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message);
  } finally {
    await session.endSession();
  }
};

// UPDATE
crudServices.update = async (model, { fieldSearch, data }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await model.findOneAndUpdate(
      { ...fieldSearch, is_delete: { $ne: true } },
      data,
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!result) throw new Error(`data not found!`);

    await session.commitTransaction();

    delete result.is_delete;
    delete result.updatedAt;
    return {
      success: true,
      message: "Data updated successfully!",
      data: result,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message);
  } finally {
    await session.endSession();
  }
};

// DELETE
crudServices.delete = async (model, { id, data }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await model.findOnedAndUpdate(
      { id, is_delete: { $ne: true } },
      { is_delete: true },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!result) throw new Error(`data with id: '${id}' not found!`);

    await session.commitTransaction();
    return {
      success: true,
      message: "Data updated successfully!",
      data: result[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message);
  } finally {
    await session.endSession();
  }
};

module.exports = crudServices;
