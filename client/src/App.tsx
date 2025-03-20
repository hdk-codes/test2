import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import { motion } from "framer-motion";

// Navigation component with beautiful animation effects
function Navigation() {
  return (
    <motion.nav 
      className="fixed top-0 right-0 z-50 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="flex gap-4">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/gallery">Gallery</NavLink>
      </div>
    </motion.nav>
  );
}

// Animated navigation link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const isActive = location === href;
  
  return (
    <div 
      className={`relative px-4 py-2 group cursor-pointer ${isActive ? 'text-pink-300' : 'text-white'}`}
      onClick={() => navigate(href)}
    >
      <span className="relative z-10 text-lg font-medium transition-colors duration-300 group-hover:text-pink-300">
        {children}
      </span>
      <span className={`absolute inset-0 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 transform transition-all duration-300 ${
        isActive ? 'opacity-100 scale-110' : 'opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-110'
      }`}></span>
    </div>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/gallery" component={Gallery} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
