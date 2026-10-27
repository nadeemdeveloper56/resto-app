
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const RestaurantHeader = () => {
    const [details, setDetails] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let data = localStorage.getItem("restaurant");

        if (data) {
            setDetails(JSON.parse(data));
        } else {
            setDetails(null);
        }

        if (!data && pathname === "/restaurant/DashBoard") {
            router.push("/restaurant");
        }
    }, [pathname, router]);

    const logout = () => {
        localStorage.removeItem("restaurant");
        setDetails(null);
        router.push("/restaurant");
    };

    return (
        <div className="header-wrapper">

            {/* Logo */}
            <div className="Logo">
                <img
                    src="https://graphicsfamily.com/wp-content/uploads/edd/2023/02/Restaurant-Logo-Design-2-1180x664.jpg"
                    alt="Restaurant Logo"
                    className="logo-image"
                    style={{
                        width: "100px",
                        height: "auto",
                    }}
                />
            </div>

            <ul>

                <li>
                    <Link href="/">Home</Link>
                </li>

                {details && (
                    <>
                        <li>
                            <Link href="/restaurant/DashBoard">
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link href="/">
                                Profile
                            </Link>
                        </li>

                        <li>
                            <button onClick={logout}>
                                Logout
                            </button>
                        </li>
                    </>
                )}

                {!details && (
                    <>
                        <li>
                            <Link href="/restaurant">
                                Login/Signup
                            </Link>
                        </li>

                        <li>
                            <Link href="/">
                                Profile
                            </Link>
                        </li>
                    </>
                )}

            </ul>

        </div>
    );
};

export default RestaurantHeader;
