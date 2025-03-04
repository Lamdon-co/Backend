import Joi from "joi";

// Validate notification toggle request
export const validateToggleNotification = (data: { enable: boolean }) => {
  const schema = Joi.object({
    enable: Joi.boolean().required(),
  });

  return schema.validate(data);
};
