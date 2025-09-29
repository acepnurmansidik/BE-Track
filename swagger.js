const swaggerAutogen = require("swagger-autogen")();
const GlobalSchema = require("./resource/app/schema");
const { server } = require("./resource/utils/config");

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"]; // Sesuaikan dengan file-file yang berisi route Anda

const doc = {
  info: {
    version: server.versionApp, // by default: '1.0.0'
    title: "REST API", // by default: 'REST API'
    description: "", // by default: ''
  },
  host: `${server.publicServer}:${server.portAccess}`, // by default: 'localhost:3022'
  basePath: "/", // by default: '/'
  schemes: ["http", "https"], // by default: ['http']
  consumes: [], // by default: ['application/json']
  produces: [], // by default: ['application/json']
  tags: [],
  definitions: {
    ...GlobalSchema,
    NotFound: {
      code: 404,
      success: false,
      message: "Data not found!",
      data: "",
    },
    QueryIdSchema: {
      id: "",
    },
  },
  components: {},
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      scheme: "bearer",
      name: "Authorization",
      bearerFormat: "JWT",
      description: "Please insert JWT format!",
    },
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
      description: "API key header",
    },
  },
  security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
};

swaggerAutogen(outputFile, endpointsFiles, doc);
