import React, { useState } from 'react';
import { useLockScreen } from '@/contexts/LockScreenContext';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import * as toast from '@/utils/toast';

const LockScreen: React.FC = () => {
  const { unlockScreen } = useLockScreen();
  const currentUser = useSelector(selectCurrentUser);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        toast.showError('User data not found. Please refresh.');
        return;
    }
    setIsLoading(true);

    setTimeout(() => {
      if (email.toLowerCase() === currentUser.email.toLowerCase()) {
        toast.showSuccess('Layar berhasil dibuka!');
        unlockScreen();
      } else {
        toast.showError('Email salah. Silakan coba lagi.');
      }
      setIsLoading(false);
      setEmail('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleUnlock}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Layar Terkunci</CardTitle>
            <CardDescription>
              Demi keamanan Anda, layar telah dikunci karena tidak ada aktivitas.
              Silakan masukkan email Anda untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Membuka...' : 'Buka Kunci'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LockScreen;