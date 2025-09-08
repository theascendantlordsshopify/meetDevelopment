import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'CalendlyClone - Smart Scheduling Made Simple',
  description: 'Streamline your scheduling with our intelligent booking platform. Connect calendars, automate workflows, and provide seamless booking experiences.',
};

const features = [
  {
    name: 'Smart Scheduling',
    description: 'Intelligent availability calculation with multi-timezone support and conflict detection.',
    icon: CalendarDaysIcon,
  },
  {
    name: 'Automated Workflows',
    description: 'Create powerful automation sequences with conditional logic and multiple action types.',
    icon: BoltIcon,
  },
  {
    name: 'Team Collaboration',
    description: 'Manage team schedules with role-based access control and round-robin booking.',
    icon: UserGroupIcon,
  },
  {
    name: 'Real-time Analytics',
    description: 'Track booking performance, conversion rates, and optimize your scheduling strategy.',
    icon: ChartBarIcon,
  },
  {
    name: 'Buffer Time Management',
    description: 'Automatically manage buffer times and prevent back-to-back bookings.',
    icon: ClockIcon,
  },
  {
    name: 'Enterprise Security',
    description: 'Advanced security features including MFA, SSO, and comprehensive audit logging.',
    icon: CheckCircleIcon,
  },
];

const testimonials = [
  {
    content: "This platform has revolutionized how we handle client bookings. The automation features save us hours every week.",
    author: "Sarah Johnson",
    role: "Sales Director",
    company: "TechCorp",
  },
  {
    content: "The multi-timezone support and team features make it perfect for our global organization.",
    author: "Michael Chen",
    role: "Operations Manager",
    company: "GlobalTech",
  },
  {
    content: "Integration with our existing tools was seamless. The workflow automation is incredibly powerful.",
    author: "Emily Rodriguez",
    role: "Marketing Lead",
    company: "StartupXYZ",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">CalendlyClone</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">
              Smart Scheduling
              <span className="block text-gradient">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Streamline your scheduling with our intelligent booking platform. 
              Connect calendars, automate workflows, and provide seamless booking experiences 
              that delight your clients and save you time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to schedule smarter
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern businesses and professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by thousands of professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
              >
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your scheduling?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have streamlined their booking process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">CalendlyClone</h3>
              <p className="text-gray-400 mb-4">
                Smart scheduling made simple. Streamline your booking process 
                with our intelligent platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CalendlyClone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}