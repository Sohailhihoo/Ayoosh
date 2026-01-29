/**
 * Beauty Center Layout
 * 
 * Custom layout for the beauty-center page that hides
 * the global navbar and footer to use its own custom header.
 */
export default function BeautyCenterLayout({ children }) {
    return (
        <div className="beauty-center-layout">
            {children}
        </div>
    );
}
