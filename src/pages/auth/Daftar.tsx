import React from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import RegisterForm from '../../components/RegisterForm';

const Daftar: React.FC = () => {
  return (
    <LandingLayout title="Daftar">
      <RegisterForm />
    </LandingLayout>
  );
};

export default Daftar;