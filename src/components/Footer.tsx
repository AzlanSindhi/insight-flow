import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-heading text-2xl mb-4">DataSage</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              AI-powered analytics that transforms your raw data into actionable insights.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4 opacity-90">Product</h4>
            <div className="space-y-2">
              <Link to="/dashboard" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Dashboard</Link>
              <Link to="/upload" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Upload</Link>
              <Link to="/pricing" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4 opacity-90">Company</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">About</a>
              <a href="#" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Blog</a>
              <a href="#" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Careers</a>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4 opacity-90">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Privacy</a>
              <a href="#" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Terms</a>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-50">© 2026 DataSage. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs opacity-50 hover:opacity-100">Twitter</a>
            <a href="#" className="text-xs opacity-50 hover:opacity-100">LinkedIn</a>
            <a href="#" className="text-xs opacity-50 hover:opacity-100">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
