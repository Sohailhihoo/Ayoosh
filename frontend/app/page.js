import HomePage from './home/page';

/**
 * Root Page — renders the HomePage component so content lives at /
 * (canonical URL). /home remains accessible but is no longer the primary URL.
 */
export default function RootPage() {
    return <HomePage />;
}
