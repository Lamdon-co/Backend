import Joi from "joi";

// Validate notification toggle request
export const validateToggleNotification = (data: { enable: boolean }) => {
  const schema = Joi.object({
    enable: Joi.boolean().required(),
  });

  return schema.validate(data);
};

// ✅ Validation Schema for Updating Profile
export const profileUpdateSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  address: Joi.string().optional(),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    relationship: Joi.string().required(),
  }).optional(),
});

// ✅ Joi Validation for KYC Submission
export const kycSchema = Joi.object({
  idType: Joi.string()
    .valid("Driving License", "Passport", "Identity Card")
    .required(),
  frontImage: Joi.required(),
  backImage: Joi.required()
});
