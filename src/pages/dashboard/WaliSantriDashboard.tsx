import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const WaliSantriDashboard: React.FC = () => {
  const { t } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title={t('waliSantriDashboard.title')} role="wali-santri">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>{t('waliSantriDashboard.santriInfo.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('waliSantriDashboard.santriInfo.name')}: Ahmad Fulan</p>
            <p>{t('waliSantriDashboard.santriInfo.class')}: X IPA</p>
            <p>{t('waliSantriDashboard.santriInfo.status')}: {t('waliSantriDashboard.santriInfo.statusValue')}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>{t('waliSantriDashboard.latestGrades.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('waliSantriDashboard.latestGrades.math')}: 90</p>
            <p>{t('waliSantriDashboard.latestGrades.arabic')}: 85</p>
            <p>{t('waliSantriDashboard.latestGrades.fiqh')}: 92</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle>{t('waliSantriDashboard.attendance.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('waliSantriDashboard.attendance.present', { count: 20 })}</p>
            <p>{t('waliSantriDashboard.attendance.permission', { count: 1 })}</p>
            <p>{t('waliSantriDashboard.attendance.sick', { count: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>{t('waliSantriDashboard.announcements.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('waliSantriDashboard.announcements.noNew')}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriDashboard;