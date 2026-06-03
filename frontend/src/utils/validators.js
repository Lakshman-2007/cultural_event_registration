/**
 * Form field validation utilities.
 */

export const validateMobile = (mobile) => {
  const clean = mobile.trim();
  if (!clean) return "Mobile number is required";
  if (!/^\d{10}$/.test(clean)) {
    return "Mobile number must be exactly 10 digits";
  }
  return "";
};

export const validateEmail = (email) => {
  const clean = email.trim().toLowerCase();
  if (!clean) return "Email address is required";
  // RFC 5322 compliant regex
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(clean)) {
    return "Please enter a valid email address";
  }
  return "";
};

export const validateAadhaar = (aadhaar) => {
  const clean = aadhaar.trim();
  if (!clean) return "Aadhaar number is required";
  if (!/^\d{12}$/.test(clean)) {
    return "Aadhaar number must be exactly 12 digits";
  }
  return "";
};

export const validateRequired = (field, name) => {
  if (!field || !field.trim()) {
    return `${name} is required`;
  }
  return "";
};

export const isInternalEmail = (email, registerNumber) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanReg = registerNumber.trim().toLowerCase();
  const domain = "@student.hindustanuniv.ac.in";
  
  if (cleanEmail.endsWith(domain)) {
    const prefix = cleanEmail.split("@")[0];
    return prefix === cleanReg;
  }
  return false;
};

export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  errors.full_name = validateRequired(formData.full_name, "Full name");
  if (!errors.full_name && formData.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters";
  }
  
  errors.mobile = validateMobile(formData.mobile);
  errors.email = validateEmail(formData.email);
  errors.address = validateRequired(formData.address, "Address");
  if (!errors.address && formData.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters";
  }
  
  errors.aadhaar_number = validateAadhaar(formData.aadhaar_number);
  errors.college_name = validateRequired(formData.college_name, "College name");
  errors.register_number = validateRequired(formData.register_number, "Register number");
  errors.department = validateRequired(formData.department, "Department");
  errors.year_of_study = validateRequired(formData.year_of_study, "Year of study");
  
  // Clean empty errors
  Object.keys(errors).forEach(key => {
    if (!errors[key]) {
      delete errors[key];
    }
  });
  
  return errors;
};
