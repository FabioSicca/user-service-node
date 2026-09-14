export const httpErrorSchema = {
  $id: "HttpError",
  type: "object",
  additionalProperties: false,
  required: ["statusCode", "error", "message"],
  properties: {
    statusCode: { type: "integer" },
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;
