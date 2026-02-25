"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import { i18n, localeNames, localeFlags, type Locale } from "@/lib/i18n/config";
import { useState, useRef, useEffect } from "react";

export function Footer() {
    const pathname = usePathname();
    const { locale, setLocale } = useLocale();
    const t = useTranslations();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            {/* "Load more" Button Section */}
            <div className="flex justify-center py-10 bg-white">
                <button className="bg-[#3665f3] hover:bg-[#2b54d6] text-white font-bold py-3 px-12 rounded-full text-base transition-colors">
                    {t('footer.loadMore')}
                </button>
            </div>

            <div className="border-t border-gray-200">
                <div className="container mx-auto px-4 pt-10">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 mb-10">
                        {/* Column 1: Buy */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">{t('footer.buy.title')}</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.howToBuy')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.byCategory')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.promotions')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.app')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.brands')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.carBrands')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.rights')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.buy.extra')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Sell */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">{t('footer.sell.title')}</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.howToSell')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.tools')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.sellersSpace')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.openShop')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.shippingSpace')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.fees')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.protection')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.international')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.sell.howItWorks')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: About */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">{t('footer.aboutSection.title')}</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.sustainable')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.legalNotice')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.advertising')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.affiliation')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.vero')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.developers')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.press')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.careers')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.aboutSection.courtDecisions')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Help */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">{t('footer.helpSection.title')}</h3>
                            <ul className="space-y-1.5 text-[11px]">
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.helpSection.security')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.helpSection.guarantee')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 5: Community & Sites */}
                        <div>
                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">{t('footer.community.title')}</h3>
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
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.community.news')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.community.helpForums')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.community.discussionForums')}</Link></li>
                                <li><Link href="#" className="hover:underline hover:text-[#0654ba]">{t('footer.community.groups')}</Link></li>
                            </ul>

                            <h3 className="font-bold text-[#111] mb-2 text-xs uppercase tracking-wide">{t('footer.sites')}</h3>
                            <div className="relative inline-block" ref={langRef}>
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className="flex items-center gap-2 border border-gray-300 rounded bg-white px-3 py-1.5 cursor-pointer hover:bg-gray-50 focus:outline-none"
                                >
                                    <span className="text-lg leading-none">{localeFlags[locale]}</span>
                                    <span className="text-[#333] text-sm font-medium">{localeNames[locale]}</span>
                                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isLangOpen && (
                                    <div className="absolute bottom-full mb-1 left-0 w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden z-50">
                                        <ul className="py-1">
                                            {i18n.locales.map((l: Locale) => (
                                                <li key={l}>
                                                    <button
                                                        onClick={() => {
                                                            setLocale(l);
                                                            setIsLangOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 ${locale === l ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                                                    >
                                                        <span className="text-lg leading-none">{localeFlags[l]}</span>
                                                        <span>{localeNames[l]}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="text-[10px] text-[#767676] mt-4">
                        <p className="flex flex-wrap gap-1 items-center">
                            {t('footer.copyrightText')}
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">{t('footer.accessibilityLink')}</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">{t('footer.termsLink')}</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">{t('footer.privacyNotice')}</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">{t('footer.paymentTerms')}</Link>,
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba]">{t('footer.cookiesLink')}</Link> {t('footer.andConjunction')}
                            <Link href="#" className="underline text-[#767676] hover:text-[#0654ba] inline-flex items-center gap-0.5">{t('footer.adChoice')} <span className="w-2.5 h-2.5 rounded-full border border-gray-400 inline-flex items-center justify-center text-[8px]">i</span></Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-white p-3 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-gray-100 hover:bg-gray-50 transition-shadow"
                    aria-label={t('footer.backToTop')}
                >
                    <ChevronUp className="w-5 h-5 text-gray-700" />
                </button>
                <Link
                    href="/chat/"
                    className="bg-[#3665f3] hover:bg-[#2b54d6] p-3 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-[#3665f3] transition-all"
                    aria-label={t('footer.openChat')}
                >
                    <MessageCircle className="w-5 h-5 text-white" />
                </Link>
            </div>
        </footer>
    );
}
