import React from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import LoginForm from '../../components/LoginForm';

const Login: React.FC = () => {
  return (
    <LandingLayout title="Login">
      <LoginForm />
    </LandingLayout>
  );
};

export default Login;