"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    console.log('🧹 Cleaning up existing data...');
    await prisma.adImpression.deleteMany();
    await prisma.adCampaign.deleteMany();
    await prisma.partnerPreferences.deleteMany();
    await prisma.advertisingPartner.deleteMany();
    await prisma.translation.deleteMany();
    await prisma.notificationPreferences.deleteMany();
    await prisma.userInterest.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.image.deleteMany();
    await prisma.item.deleteMany();
    await prisma.category.deleteMany();
    await prisma.shop.deleteMany();
    await prisma.user.deleteMany();
    console.log('📁 Creating categories...');
    const categories = await Promise.all([
        prisma.category.create({ data: { name: 'Art & Collections' } }),
        prisma.category.create({ data: { name: 'Auto & Moto' } }),
        prisma.category.create({ data: { name: 'High-Tech' } }),
        prisma.category.create({ data: { name: 'Maison & Jardin' } }),
        prisma.category.create({ data: { name: 'Jouets & Jeux' } }),
        prisma.category.create({ data: { name: 'Culture & Loisirs' } }),
        prisma.category.create({ data: { name: 'Mode' } }),
        prisma.category.create({ data: { name: 'Seconde main' } }),
    ]);
    console.log('👥 Creating users...');
    const password = await bcrypt.hash('password123', 10);
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'admin@collector.com',
                password,
                name: 'Admin Collector',
                role: 'ADMIN',
                isSeller: true,
                sellerType: 'PROFESSIONNEL',
                bio: 'Administrateur de la plateforme Collector',
            },
        }),
        prisma.user.create({
            data: {
                email: 'lucas@collector.com',
                password,
                name: 'Lucas Labonde',
                role: 'USER',
                isSeller: true,
                sellerType: 'PARTICULIER',
                bio: 'Passionné de jeux vidéo rétro et de figurines',
            },
        }),
        prisma.user.create({
            data: {
                email: 'marie@collector.com',
                password,
                name: 'Marie Dupont',
                role: 'USER',
                isSeller: true,
                sellerType: 'PROFESSIONNEL',
                bio: 'Boutique spécialisée en manga et BD japonaises',
            },
        }),
        prisma.user.create({
            data: {
                email: 'pierre@collector.com',
                password,
                name: 'Pierre Martin',
                role: 'USER',
                isSeller: true,
                sellerType: 'PARTICULIER',
                bio: 'Collectionneur de vinyles et de matériel audio vintage',
            },
        }),
        prisma.user.create({
            data: {
                email: 'sophie@collector.com',
                password,
                name: 'Sophie Bernard',
                role: 'USER',
                isSeller: false,
                bio: 'Amatrice de sneakers et de streetwear',
            },
        }),
        prisma.user.create({
            data: {
                email: 'thomas@collector.com',
                password,
                name: 'Thomas Petit',
                role: 'USER',
                isSeller: true,
                sellerType: 'PARTICULIER',
                bio: 'Expert en cartes Pokémon et Yu-Gi-Oh!',
            },
        }),
    ]);
    console.log('🏪 Creating shops...');
    const shops = await Promise.all([
        prisma.shop.create({
            data: {
                name: 'Retro Gaming Paradise',
                description: 'Votre boutique spécialisée en jeux rétro et consoles vintage',
                ownerId: users[1].id,
            },
        }),
        prisma.shop.create({
            data: {
                name: 'Manga & BD Store',
                description: 'Import direct du Japon - Manga, BD, et goodies',
                ownerId: users[2].id,
            },
        }),
        prisma.shop.create({
            data: {
                name: 'Vinyl Vibes',
                description: 'Disques vinyles neufs et occasion - Rock, Jazz, Électro',
                ownerId: users[3].id,
            },
        }),
        prisma.shop.create({
            data: {
                name: 'Card Collection Pro',
                description: 'Cartes Pokémon, Magic, Yu-Gi-Oh! - Achat et vente',
                ownerId: users[5].id,
            },
        }),
    ]);
    console.log('📦 Creating items...');
    const items = [];
    const item1 = await prisma.item.create({
        data: {
            title: 'Nintendo 64 Complète en Boîte',
            description: 'Console Nintendo 64 en excellent état avec boîte originale, câbles et manette. Testée et fonctionnelle.',
            price: 149.99,
            shippingCost: 8.5,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[1].id,
            shopId: shops[0].id,
            categoryId: categories[2].id, // High-Tech
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
                    },
                    {
                        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
                    },
                ],
            },
        },
    });
    items.push(item1);
    const item2 = await prisma.item.create({
        data: {
            title: 'The Legend of Zelda: Ocarina of Time N64',
            description: 'Cartouche originale en très bon état. Stickers parfaits, fonctionne parfaitement.',
            price: 45.0,
            shippingCost: 4.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[1].id,
            shopId: shops[0].id,
            categoryId: categories[2].id, // High-Tech
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1595852432378-490f57a46e7a?w=800',
                    },
                ],
            },
        },
    });
    items.push(item2);
    const item3 = await prisma.item.create({
        data: {
            title: 'Game Boy Advance SP Bleu Cobalt',
            description: 'Console Game Boy Advance SP en très bon état, écran lumineux AGS-101. Quelques rayures mineures.',
            price: 89.99,
            shippingCost: 5.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[1].id,
            shopId: shops[0].id,
            categoryId: categories[2].id, // High-Tech
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800',
                    },
                ],
            },
        },
    });
    items.push(item3);
    const item4 = await prisma.item.create({
        data: {
            title: 'One Piece - Édition Collector Volume 1-50',
            description: 'Coffret collector One Piece volumes 1 à 50 en parfait état. Jamais lu, encore sous blister.',
            price: 499.99,
            shippingCost: 12.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[2].id,
            shopId: shops[1].id,
            categoryId: categories[5].id, // Culture & Loisirs
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800',
                    },
                ],
            },
        },
    });
    items.push(item4);
    const item5 = await prisma.item.create({
        data: {
            title: 'Figurine Luffy Gear 5 - Edition Limitée',
            description: 'Figurine premium Monkey D. Luffy Gear 5, hauteur 30cm, numérotée (156/500).',
            price: 179.99,
            shippingCost: 8.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[2].id,
            shopId: shops[1].id,
            categoryId: categories[4].id, // Jouets & Jeux
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800',
                    },
                ],
            },
        },
    });
    items.push(item5);
    const item6 = await prisma.item.create({
        data: {
            title: 'Pink Floyd - Dark Side of the Moon Vinyl Original 1973',
            description: 'Vinyle original de 1973 en excellent état. Pochette VG+, disque NM. Son exceptionnel.',
            price: 249.0,
            shippingCost: 6.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[3].id,
            shopId: shops[2].id,
            categoryId: categories[5].id, // Culture & Loisirs
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800',
                    },
                ],
            },
        },
    });
    items.push(item6);
    const item7 = await prisma.item.create({
        data: {
            title: 'Platine Vinyle Technics SL-1200 MK2',
            description: 'Légendaire platine DJ Technics SL-1200 MK2. Révisée complètement, pitch neuf.',
            price: 899.0,
            shippingCost: 25.0,
            status: 'SOLD',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[3].id,
            shopId: shops[2].id,
            categoryId: categories[2].id, // High-Tech
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1543108795-5e1f8c4e3a89?w=800',
                    },
                ],
            },
        },
    });
    items.push(item7);
    const item8 = await prisma.item.create({
        data: {
            title: 'Dracaufeu Première Édition PSA 9',
            description: 'Carte Pokémon Dracaufeu Édition de Base 1ère édition gradée PSA 9. Pièce de collection exceptionnelle.',
            price: 2499.0,
            shippingCost: 15.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[5].id,
            shopId: shops[3].id,
            categoryId: categories[4].id, // Jouets & Jeux
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
                    },
                ],
            },
        },
    });
    items.push(item8);
    const item9 = await prisma.item.create({
        data: {
            title: 'Lot 50 Cartes Pokémon Rare Holofoil',
            description: 'Collection de 50 cartes rares holographiques diverses extensions. Parfait pour démarrer une collection.',
            price: 129.99,
            shippingCost: 5.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[5].id,
            shopId: shops[3].id,
            categoryId: categories[4].id, // Jouets & Jeux
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=800',
                    },
                ],
            },
        },
    });
    items.push(item9);
    const item10 = await prisma.item.create({
        data: {
            title: 'Air Jordan 1 Retro High OG Chicago (2015)',
            description: 'Sneakers Air Jordan 1 Chicago 2015. État neuf, jamais portées. Taille 42.',
            price: 1299.0,
            shippingCost: 10.0,
            status: 'AVAILABLE',
            validationStatus: 'APPROVED',
            published: true,
            ownerId: users[4].id,
            categoryId: categories[6].id, // Mode
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
                    },
                ],
            },
        },
    });
    items.push(item10);
    console.log('💳 Creating transactions...');
    const transaction1 = await prisma.transaction.create({
        data: {
            amount: 924.0,
            status: 'COMPLETED',
            buyerId: users[4].id,
            sellerId: users[3].id,
            itemId: item7.id,
            commission: 92.4,
            stripePaymentStatus: 'succeeded',
            paymentMethod: 'card',
        },
    });
    console.log('⭐ Creating reviews...');
    await prisma.review.create({
        data: {
            rating: 5,
            comment: 'Platine en excellent état, exactement comme décrit. Vendeur très pro et emballage soigné !',
            authorId: users[4].id,
            targetId: users[3].id,
            transactionId: transaction1.id,
        },
    });
    console.log('💬 Creating conversations...');
    const conv1 = await prisma.conversation.create({
        data: {
            participants: {
                connect: [{ id: users[4].id }, { id: users[1].id }],
            },
            messages: {
                create: [
                    {
                        content: 'Bonjour, la N64 est-elle toujours disponible ?',
                        senderId: users[4].id,
                    },
                    {
                        content: 'Oui tout à fait ! Elle est en excellent état avec tous les accessoires.',
                        senderId: users[1].id,
                    },
                    {
                        content: 'Super ! Les manettes fonctionnent bien ?',
                        senderId: users[4].id,
                    },
                    {
                        content: 'Parfaitement ! Joysticks testés, pas de jeu. Je peux faire une vidéo si vous voulez.',
                        senderId: users[1].id,
                    },
                ],
            },
        },
    });
    console.log('🔔 Creating notifications...');
    await Promise.all([
        prisma.notification.create({
            data: {
                type: 'NEW_MESSAGE',
                data: JSON.stringify({ conversationId: conv1.id }),
                userId: users[1].id,
            },
        }),
        prisma.notification.create({
            data: {
                type: 'ITEM_SOLD',
                data: JSON.stringify({ itemId: item7.id }),
                userId: users[3].id,
                read: true,
            },
        }),
        prisma.notification.create({
            data: {
                type: 'PURCHASE_CONFIRMED',
                data: JSON.stringify({ transactionId: transaction1.id }),
                userId: users[4].id,
                read: true,
            },
        }),
    ]);
    console.log('⚙️ Creating notification preferences...');
    await Promise.all(users.map((user) => prisma.notificationPreferences.create({
        data: {
            userId: user.id,
            emailNewItem: true,
            emailMatchingInterest: true,
            emailMessages: true,
            emailTransactions: true,
            inAppNewItem: true,
            inAppMatchingInterest: true,
            inAppMessages: true,
            inAppTransactions: true,
        },
    })));
    console.log('❤️ Creating user interests...');
    await Promise.all([
        prisma.userInterest.create({
            data: {
                userId: users[4].id,
                categoryId: categories[2].id, // High-Tech
                keyword: 'nintendo',
                minPrice: 50,
                maxPrice: 200,
            },
        }),
        prisma.userInterest.create({
            data: {
                userId: users[4].id,
                categoryId: categories[6].id, // Mode
                keyword: 'jordan',
                minPrice: 500,
                maxPrice: 2000,
            },
        }),
    ]);
    console.log('📊 Creating price history...');
    await prisma.priceHistory.create({
        data: {
            price: 169.99,
            itemId: item1.id,
            recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${categories.length} categories created`);
    console.log(`   - ${shops.length} shops created`);
    console.log(`   - ${items.length} items created`);
    console.log(`   - 1 transaction created`);
    console.log(`   - 1 review created`);
    console.log(`   - 1 conversation created`);
    console.log('\n🔑 Login credentials (all users):');
    console.log('   Email: [user]@collector.com');
    console.log('   Password: password123');
    console.log('\n   Example: lucas@collector.com / password123');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map