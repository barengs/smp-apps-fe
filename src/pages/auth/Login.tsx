import React from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import LoginForm from '../../components/LoginForm';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LandingLayout title={t('loginPageTitle')}>
      <LoginForm />
    </LandingLayout>
  );
};

export default Login;