import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-6 text-center">
      <div className="container mx-auto">
        <p className="text-lg mb-4">
          &copy; {new Date().getFullYear()} Pesantren Digital. All rights reserved.
        </p>
        <p className="text-sm text-gray-400">
          Jl. Contoh No. 123, Kota Santri, Provinsi Damai
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;