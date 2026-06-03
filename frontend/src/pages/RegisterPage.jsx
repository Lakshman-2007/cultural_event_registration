import React from "react";
import { Layout } from "../components/layout/Layout";
import { RegistrationForm } from "../components/registration/RegistrationForm";

export const RegisterPage = () => {
  return (
    <Layout>
      <div className="py-4">
        <RegistrationForm />
      </div>
    </Layout>
  );
};
export default RegisterPage;
