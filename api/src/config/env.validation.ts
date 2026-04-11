import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  RESTAURANTS_API_KEY: Joi.string().required(),
  RESTAURANTS_BASE_URL: Joi.string().uri().required(),
  GEOCODING_BASE_URL: Joi.string().uri().required(),
  HTTP_TIMEOUT_MS: Joi.number().positive().default(8000),
});
