import React from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import RegisterForm from '../../components/RegisterForm';
import { useTranslation } from 'react-i18next';

const Daftar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LandingLayout title={t('registerPageTitle')}>
      <RegisterForm />
    </LandingLayout>
  );
};

export default Daftar;