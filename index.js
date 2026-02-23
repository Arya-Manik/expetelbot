const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // Nanti dipakai buat request ke Tripay
const crypto = require('crypto'); // Nanti dipakai buat generate signature Tripay

// Ganti dengan Token dari BotFather
const token = 'GANTI_DENGAN_TOKEN_BOT_KAMU'; 
const bot = new TelegramBot(token, { polling: true });

// --- DATA DUMMY PRODUK (Nanti bisa diganti database) ---
const products = [
    { id: 'prod_1', name: 'Spotify Premium 1 Bulan', price: 15000 },
    { id: 'prod_2', name: 'Netflix Sharing 1 Bulan', price: 35000 },
    { id: 'prod_3', name: 'Youtube Premium 1 Bulan', price: 10000 }
];

// --- MENU UTAMA ---
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.first_name;

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🛍️ Beli Produk', callback_data: 'menu_shop' }],
                [{ text: '📦 Cek Status Pesanan', callback_data: 'menu_status' }],
                [{ text: '📞 Bantuan', callback_data: 'menu_help' }]
            ]
        }
    };

    bot.sendMessage(chatId, `Halo ${username}! Selamat datang di Bot Store kami.\nSilakan pilih menu di bawah:`, opts);
});

// --- HANDLER TOMBOL (CALLBACK QUERY) ---
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = message.chat.id;

    // 1. Menu Shop (List Produk)
    if (data === 'menu_shop') {
        // Generate tombol dari list produk
        const productButtons = products.map(p => {
            return [{ text: `${p.name} - Rp${p.price.toLocaleString('id-ID')}`, callback_data: `buy_${p.id}` }];
        });
        
        // Tambah tombol kembali
        productButtons.push([{ text: '🔙 Kembali', callback_data: 'menu_back' }]);

        bot.editMessageText('Pilih produk yang ingin kamu beli:', {
            chat_id: chatId,
            message_id: message.message_id,
            reply_markup: { inline_keyboard: productButtons }
        });
    }

    // 2. Logic Klik Beli Produk
    else if (data.startsWith('buy_')) {
        const productId = data.split('_')[1];
        const product = products.find(p => p.id === productId);

        if (product) {
            // DI SINI LOGIKA CREATE TRANSACTION TRIPAY
            bot.sendMessage(chatId, `⏳ Sedang memproses tagihan untuk <b>${product.name}</b>...`, { parse_mode: 'HTML' });
            
            // Panggil fungsi createTripayTransaction (Lihat bawah)
            createTripayTransaction(chatId, product);
        }
    }

    // 3. Menu Cek Status (Placeholder)
    else if (data === 'menu_status') {
        bot.sendMessage(chatId, "Fitur cek status transaksi akan segera hadir.");
    }

    // 4. Tombol Kembali ke Menu Utama
    else if (data === 'menu_back') {
        bot.editMessageText('Silakan pilih menu utama:', {
            chat_id: chatId,
            message_id: message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛍️ Beli Produk', callback_data: 'menu_shop' }],
                    [{ text: '📦 Cek Status Pesanan', callback_data: 'menu_status' }],
                    [{ text: '📞 Bantuan', callback_data: 'menu_help' }]
                ]
            }
        });
    }
});

// --- FUNGSI INTEGRASI TRIPAY (TEMPLATE) ---
async function createTripayTransaction(chatId, product) {
    try {
        // Nanti kamu isi data asli di sini
        const apiKey = 'API_KEY_TRIPAY_KAMU';
        const privateKey = 'PRIVATE_KEY_TRIPAY_KAMU';
        const merchantCode = 'KODE_MERCHANT_KAMU';
        
        const merchantRef = `INV-${Date.now()}`; // ID Unik Transaksi

        // Contoh Payload untuk Tripay (Closed Payment)
        /* const payload = {
            method: 'BRIVA', // Contoh metode pembayaran
            merchant_ref: merchantRef,
            amount: product.price,
            customer_name: 'Customer Bot',
            customer_email: 'email@customer.com',
            customer_phone: '08123456789',
            order_items: [
                {
                    sku: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                }
            ],
            expired_time: (Math.floor(Date.now() / 1000) + 24 * 60 * 60), // 24 jam
            signature: 'GENERATED_SIGNATURE_DISINI'
        };
        */

        // --- SIMULASI SUKSES (Hapus ini kalau sudah connect API) ---
        setTimeout(() => {
            const fakePaymentUrl = "https://tripay.co.id/checkout/contoh-link";
            const message = `
✅ <b>Tagihan Dibuat!</b>

📦 <b>Produk:</b> ${product.name}
💰 <b>Harga:</b> Rp${product.price.toLocaleString('id-ID')}
🆔 <b>No. Ref:</b> ${merchantRef}

Silakan lakukan pembayaran melalui link berikut:
${fakePaymentUrl}

<i>(Ini adalah simulasi, belum connect Tripay beneran)</i>
            `;
            bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }, 1500);

        // --- KODE REQUEST ASLI (UNCOMMENT NANTI) ---
        // const response = await axios.post('https://tripay.co.id/api-sandbox/transaction/create', payload, { headers: { Authorization: `Bearer ${apiKey}` } });
        // return response.data;

    } catch (error) {
        console.error('Error Tripay:', error);
        bot.sendMessage(chatId, "Maaf, terjadi kesalahan saat membuat tagihan.");
    }
}

console.log('Bot sedang berjalan...');
