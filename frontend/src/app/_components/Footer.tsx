"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    // Logic to show footer only on Home and Catalog pages
    const shouldShowFooter =
        pathname === "/" ||
        pathname.startsWith("/items") ||
        pathname.startsWith("/shop") ||
        pathname.includes("search");

    if (!shouldShowFooter) {
        return null;
    }

    return (
        <footer className="bg-[#f7f7f7] text-[#767676] font-sans pt-0 pb-10 relative">
            {/* "Charger plus" Button Section - Visually part of the footer area in the request */}
            <div className="flex justify-center py-10 bg-white">
                <button className="bg-[#3665f3] hover:bg-[#2b54d6] text-white font-bold py-3 px-12 rounded-full text-base transition-colors">
                    Charger plus
                </button>
            </div>

            <div className="border-t border-gray-200">
                <div className="container mx-auto px-4 pt-10">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 mb-10">
                        {/* Column 1: Acheter */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">Acheter</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Comment acheter</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Acheter par catégories</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Promotions</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Application Collector</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Marques</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Marques de voiture</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Droits et obligations sur Collector</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Collector Extra</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Vendre */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">Vendre</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Comment vendre</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Outils de vente</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Espace vendeurs</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Ouvrir une boutique Collector</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Espace livraison</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Frais de vente</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Protection des vendeurs</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Vendre à l&apos;international</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Fonctionnement de la plateforme Collector</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: A propos de Collector */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">A propos de Collector</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Consommation Raisonnée</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Mentions légales</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Collector Advertising</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Affiliation</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">VeRO: Propriété Intellectuelle</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Programme Collector des développeurs</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Communiqués de presse</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Opportunités de carrière</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Décisions de Justice</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Aide */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">Aide</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Espace Sécurité</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Garantie client Collector</Link></li>
                            </ul>
                        </div>

                        {/* Column 5: Communauté & Sites Collector */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">Communauté</h3>
                            <ul className="space-y-1.5 text-[11px] mb-6">
                                <li>
                                    <Link href="#" className="flex items-center gap-2 hover:underline hover:text-[#0654ba]">
                                        <div className="w-4 h-4 rounded-full bg-gray-600 text-white flex items-center justify-center text-[10px] font-bold">f</div> Facebook
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="flex items-center gap-2 hover:underline hover:text-[#0654ba]">
                                        <div className="w-4 h-4 rounded-full bg-gray-600 text-white flex items-center justify-center text-[10px] font-bold">X</div> X (Twitter)
                                    </Link>
                                </li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Instagram</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Pinterest</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Actualités Collector</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Forums d&apos;entraide</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Forums de discussion</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">Groupes</Link></li>
                            </ul>

                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">Sites Collector</h3>
                            <div className="relative inline-block border border-gray-300 rounded bg-white px-3 py-1.5 cursor-pointer hover:bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none">🇫🇷</span>
                                    <span className="text-[#333] text-sm font-medium">France</span>
                                    <ChevronDown className="w-3 h-3 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="text-[10px] text-[#767676] mt-4">
                        <p className="flex flex-wrap gap-1 items-center">
                            Copyright © 1995-2026 Collector Inc. Tous droits réservés.
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">Accessibilité</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">Conditions d&apos;utilisation</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">Avis sur les données personnelles</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">Conditions d&apos;utilisation des services de paiement</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">Cookies</Link> et
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba] inline-flex items-center gap-0.5">AdChoice <span className="w-2.5 h-2.5 rounded-full border border-gray-400 inline-flex items-center justify-center text-[8px]">i</span></Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                <button className="bg-white p-3 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-gray-100 hover:bg-gray-50 transition-shadow">
                    <ChevronUp className="w-5 h-5 text-gray-700" />
                </button>
                <button className="bg-white p-3 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-gray-100 hover:bg-gray-50 transition-shadow">
                    <HelpCircle className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </footer>
    );
}
