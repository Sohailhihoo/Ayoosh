'use client';


export default function HomeLayout({ children }) {
    return (
        <>
            <style jsx global>{`
                /* Hide navbar and announcement bar completely on homepage */
                header,
                nav,
                .navbar,
                [class*="navbar"],
                [class*="Navbar"],
                [role="banner"] {
                    display: none !important;
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                /* Remove any top spacing from main content */
                main {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
                
                /* Ensure body has no top margin */
                body {
                    padding-top: 0 !important;
                }
            `}</style>
            {children}
        </>
    );
}
