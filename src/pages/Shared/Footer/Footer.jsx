const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="border-gray-700 pt-6 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} Imran Hossain. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
