const { StatusCodes } = require("http-status-codes");
const { methodConstant } = require("./constanta");

const response = {};

response.MethodResponse = ({ res, method, data }) => {
  let code = StatusCodes.OK;
  let message;
  switch (method) {
    case methodConstant.POST:
      code = StatusCodes.CREATED;
      message = "Data has created successfully!";
      break;
    case methodConstant.PUT:
      message = "Data has updated successfully!";
      break;
    case methodConstant.DELETE:
      message = "Data has deleted successfully!";
      break;
    default:
      message = "Data retrieved successfully!";
      break;
  }

  return res.status(code).json({
    code,
    status: true,
    message,
    data,
  });
};

response.GetPaginationResponse = ({ res, data, page, page_size }) => {
  return res.status(StatusCodes.CREATED).json({
    code: StatusCodes.OK,
    status: true,
    message: "Data retrieved successfully!",
    data: {
      data,
      pagination: {
        page,
        page_size,
        total: data.length,
      },
    },
  });
};

response.ErrorResponse = (res, code, message) => {
  return res.status(StatusCodes.BAD_REQUEST).json({
    code,
    status: false,
    message,
    data: null,
  });
};

module.exports = response;
