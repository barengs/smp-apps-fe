import { createAction } from '@reduxjs/toolkit';

export const logOut = createAction('auth/logOut');
export const updateToken = createAction<string>('auth/updateToken');