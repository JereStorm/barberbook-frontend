import { Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-principal fuente-clara pb-6 pt-2 mt-2 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-gray-600/30 pt-4">
        {/* Logo + Texto */}
        <div className="flex items-center space-x-3">
          <img src="/peluqueria-blanco.png" alt="logo" className="h-10 w-auto opacity-90" />
          <span className="text-sm">
            © 2025 Dev studio solutions | All Rights Reserved
          </span>
        </div>

        {/* Íconos */}
        <div className="flex text-sm items-center space-x-5 text-gray-200">
          <span className="flex items-center gap-2">
            <Mail className="h-5 w-5 cursor-pointer hover:text-white transition" />
            devstudio@barberbook.com
          </span>
          <span className="flex items-center gap-2">
            <Phone className="h-5 w-5 cursor-pointer hover:text-white transition" />
            22844-556677
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
