import React from "react";

export const Footer = () => {
  return (
    <footer className="relative mt-auto bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-20 w-16 h-16 bg-purple-200 rounded-full blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-24 h-24 bg-blue-200 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative z-20 max-w-6xl mx-auto px-6 py-16">
        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 AutoMate. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 text-sm transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 text-sm transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 text-sm transition-colors duration-200"
            >
              Cookie Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 text-sm transition-colors duration-200"
            >
              GDPR
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
