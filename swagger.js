const swaggerAutogen = require("swagger-autogen")();
const GlobalSchema = require("./resource/schema");
const { portAccess, puclicIP } = require("./resource/utils/config");

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"]; // Sesuaikan dengan file-file yang berisi route Anda

const doc = {
  info: {
    version: "", // by default: '1.0.0'
    title: "REST API", // by default: 'REST API'
    description: "", // by default: ''
  },
  host: `${puclicIP}:${portAccess}`, // by default: 'localhost:3022'
  basePath: "/", // by default: '/'
  schemes: ["http", "https"], // by default: ['http']
  consumes: [], // by default: ['application/json']
  produces: [], // by default: ['application/json']
  tags: [],
  definitions: {
    ...GlobalSchema,
    NotFound: {
      code: 404,
      status: false,
      message: "Data not found!",
      data: "",
    },
    QueryIdSchema: {
      id: "",
    },
  }, // by default: empty object (Swagger 2.0)
  components: {}, // by default: empty object (OpenAPI 3.x)
  // securityDefinitions: {
  //   apiKeyAuth: {
  //     type: "apiKey",
  //     in: "header", // can be 'header', 'query' or 'cookie'
  //     name: "X-API-KEY", // name of the header, query parameter or cookie
  //     description: "Some description...",
  //   },
  // },
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      scheme: "bearer",
      name: "Authorization",
      bearerFormat: "JWT",
      description: "Please insert JWT format!",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
