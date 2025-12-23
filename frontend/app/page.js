import { redirect } from 'next/navigation';

/**
 * Root Page - Redirects to /home
 * 
 * This page automatically redirects users to the homepage at /home
 */
export default function RootPage() {
    redirect('/home');
}
