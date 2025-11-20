import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 py-3 px-2 mt-auto">
      <div className="container mx-auto">
        <p className="text-sm text-gray-500 text-center">
          {'Copyright © '}
          在宅勤務申請システム
          {new Date().getFullYear()}
          {'.'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;