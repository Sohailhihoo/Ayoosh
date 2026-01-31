'use client';

export default function HomeLayout({ children }) {
    return (
        <>
            <style jsx global>{`
                /* Hide the announcement bar on homepage */
                [role="banner"][aria-label="Promotional announcement"] {
                    display: none !important;
                }
                
                /* Yellow header background for homepage */
                nav[role="navigation"][aria-label="Main navigation"] {
                    background-color: #F6C811 !important;
                }
                
                /* Hide all links in navbar except the logo */
                nav a[aria-label="Shop products"],
                nav a[aria-label="About us"],
                nav a[aria-label="Contact us"] {
                    display: none !important;
                }
                
                /* Hide SEARCH button */
                nav button[aria-label="Search products"] {
                    display: none !important;
                }
                
                /* Hide ACCOUNT link/dropdown */
                nav a[aria-label="Login to your account"],
                nav button[aria-label="Account menu"],
                nav .relative.group {
                    display: none !important;
                }
                
                /* Hide CART link */
                nav a[aria-label*="Shopping cart"] {
                    display: none !important;
                }
                
                /* Hide mobile menu button */
                nav button[aria-label="Open menu"],
                nav button[aria-label="Close menu"] {
                    display: none !important;
                }
                
                /* Hide mobile menu */
                #mobile-menu {
                    display: none !important;
                }
            `}</style>
            {children}
        </>
    );
}

 
