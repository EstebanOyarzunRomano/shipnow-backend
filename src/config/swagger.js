
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description:
        "API REST para la gestión de usuarios, productos, pedidos y entregas. Incluye generación de datos simulados, manejo centralizado de errores y logging.",
    },

    servers: [
      {
        url: "/",
        description: "Servidor actual de ShipNow",
      },
    ],

    tags: [
      { name: "Users", description: "Gestión de usuarios" },
      { name: "Products",  description: "Gestión de productos y control de stock"},
      { name: "Orders", description: "Gestión de pedidos" },
      { name: "Deliveries", description: "Gestión de entregas" },
      { name: "Mocks", description: "Generación y persistencia de datos simulados" },
      { name: "Logger", description: "Validación del sistema de logging" },
    ],
  },

  apis: ["./src/docs/**/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;