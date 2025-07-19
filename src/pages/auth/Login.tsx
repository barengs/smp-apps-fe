import React from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import LoginForm from '../../components/LoginForm';

const Login: React.FC = () => {
  return (
    <LandingLayout>
      <LoginForm />
    </LandingLayout>
  );
};

export default Login;