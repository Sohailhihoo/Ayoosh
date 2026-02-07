import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import QueryProvider from '@/components/QueryProvider';
import { Toaster } from 'react-hot-toast';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

/**
 * Metadata configuration for SEO optimization
 */
export const metadata = {
  icons: {
    icon: '/images/brand/yellow-logo.png',
    shortcut: '/images/brand/yellow-logo.png',
    apple: '/images/brand/yellow-logo.png',
  },
  title: 'Ayoosh - Premium Beauty Products | ayooshonline.com',
  description: 'Shop premium beauty products, stylish sunglasses, and trendy accessories at Ayoosh. Elevate your natural glow with our curated collection of clean, effective skincare.',
  keywords: 'beauty, skincare, premium beauty products, sunglasses, accessories, ayoosh, ayooshonline, natural beauty, clean skincare',
  authors: [{ name: 'Ayoosh' }],
  creator: 'Ayoosh',
  publisher: 'Ayoosh',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ayooshonline.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ayoosh - Premium Beauty Products',
    description: 'Elevate your natural glow with our premium collection of beauty products, sunglasses, and accessories.',
    url: 'https://ayooshonline.com',
    siteName: 'Ayoosh',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ayoosh Premium Beauty Products',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayoosh - Premium Beauty Products',
    description: 'Elevate your natural glow with our premium collection.',
    images: ['/twitter-image.jpg'],
    creator: '@ayooshonline',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
  },
};

/**
 * Root Layout Component
 * 
 * Provides the base HTML structure and global providers for the application.
 * Includes:
 * - Font configurations (Inter, Playfair Display)
 * - Toast notifications
 * - Conditional Navigation bar and Footer via LayoutWrapper
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root layout
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${playfair.variable} ${montserrat.variable}`}
        suppressHydrationWarning={true}
      >
        <QueryProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#4a4a4a',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#e8a4b8',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
 
