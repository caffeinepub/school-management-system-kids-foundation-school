export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg z-40">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm md:text-base font-bold text-white text-center md:text-left">
            © 2025 KIDS' FOUNDATION SCHOOL. All rights reserved.
          </p>
          <p className="text-sm md:text-base font-bold text-white text-center md:text-right">
            Developed and Built by SS. Zahir Khan
          </p>
        </div>
      </div>
    </footer>
  );
}
