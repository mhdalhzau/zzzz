import { Pool } from 'pg';

// Koneksi database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Data dummy
const dummyData = {
  stores: [
    {
      name: 'Toko Sumber Rejeki',
      address: 'Jl. Mawar No. 123, Jakarta Selatan',
      phone: '021-12345678',
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      lowStockThreshold: 5
    },
    {
      name: 'Warung Bu Siti',
      address: 'Jl. Melati No. 456, Bandung',
      phone: '022-87654321', 
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      lowStockThreshold: 3
    }
  ],
  products: [
    { name: 'Beras Premium 5kg', sku: 'BRS001', priceBuy: 45000, priceSell: 52000, stock: 25, unit: 'karung', category: 'Sembako' },
    { name: 'Minyak Goreng 2L', sku: 'MYG001', priceBuy: 28000, priceSell: 32000, stock: 15, unit: 'botol', category: 'Sembako' },
    { name: 'Gula Pasir 1kg', sku: 'GLP001', priceBuy: 12000, priceSell: 14000, stock: 30, unit: 'kg', category: 'Sembako' },
    { name: 'Teh Celup 25 pcs', sku: 'TEH001', priceBuy: 8000, priceSell: 10000, stock: 50, unit: 'kotak', category: 'Minuman' },
    { name: 'Kopi Instan', sku: 'KOP001', priceBuy: 15000, priceSell: 18000, stock: 20, unit: 'sachet', category: 'Minuman' },
    { name: 'Sabun Mandi', sku: 'SAB001', priceBuy: 3500, priceSell: 5000, stock: 40, unit: 'batang', category: 'Kebersihan' }
  ],
  customers: [
    { name: 'Ibu Sari', phone: '08123456789', email: 'sari@email.com', address: 'Jl. Kenanga No. 10' },
    { name: 'Pak Budi', phone: '08234567890', address: 'Jl. Anggrek No. 15' },
    { name: 'Ibu Maya', phone: '08345678901', email: 'maya@email.com', address: 'Jl. Cempaka No. 20' },
    { name: 'Pak Joko', phone: '08456789012', address: 'Jl. Dahlia No. 25' }
  ],
  cashFlowEntries: [
    { type: 'income', amount: 500000, description: 'Penjualan hari ini', category: 'Penjualan' },
    { type: 'expense', amount: 200000, description: 'Beli stok barang', category: 'Pembelian' },
    { type: 'income', amount: 150000, description: 'Pelunasan piutang', category: 'Piutang' },
    { type: 'expense', amount: 50000, description: 'Bayar listrik', category: 'Operasional' }
  ]
};

async function populateData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Memulai populate data dummy...');
    
    // 1. Insert stores dan ambil ID
    console.log('📦 Membuat toko...');
    const storeIds = [];
    for (const store of dummyData.stores) {
      const result = await client.query(
        `INSERT INTO stores (name, address, phone, timezone, currency, low_stock_threshold, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
        [store.name, store.address, store.phone, store.timezone, store.currency, store.lowStockThreshold]
      );
      storeIds.push(result.rows[0].id);
      console.log(`   ✅ ${store.name} - ID: ${result.rows[0].id}`);
    }
    
    // 2. Insert products untuk setiap toko
    console.log('📦 Menambah produk...');
    for (const storeId of storeIds) {
      for (const product of dummyData.products) {
        await client.query(
          `INSERT INTO products (store_id, name, sku, price_buy, price_sell, stock, unit, category, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
          [storeId, product.name, `${product.sku}-${storeId.slice(-4)}`, product.priceBuy, product.priceSell, product.stock, product.unit, product.category]
        );
      }
      console.log(`   ✅ ${dummyData.products.length} produk untuk toko ${storeId}`);
    }
    
    // 3. Insert customers untuk setiap toko  
    console.log('👥 Menambah pelanggan...');
    const customerIds = [];
    for (const storeId of storeIds) {
      const storeCustomerIds = [];
      for (const customer of dummyData.customers) {
        const result = await client.query(
          `INSERT INTO customers (store_id, name, phone, email, address, balance, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW()) RETURNING id`,
          [storeId, customer.name, customer.phone, customer.email || null, customer.address]
        );
        storeCustomerIds.push(result.rows[0].id);
      }
      customerIds.push(storeCustomerIds);
      console.log(`   ✅ ${dummyData.customers.length} pelanggan untuk toko ${storeId}`);
    }
    
    // 4. Insert cash flow entries
    console.log('💰 Menambah arus kas...');
    for (const storeId of storeIds) {
      for (const entry of dummyData.cashFlowEntries) {
        await client.query(
          `INSERT INTO cash_flow_entries (store_id, type, amount, description, category, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [storeId, entry.type, entry.amount, entry.description, entry.category]
        );
      }
      console.log(`   ✅ ${dummyData.cashFlowEntries.length} entry arus kas untuk toko ${storeId}`);
    }
    
    // 5. Buat beberapa transaksi dummy
    console.log('🧾 Membuat transaksi...');
    for (let i = 0; i < storeIds.length; i++) {
      const storeId = storeIds[i];
      const storeCustomerIds = customerIds[i];
      
      // Ambil beberapa produk untuk transaksi
      const products = await client.query(
        'SELECT id, name, price_sell FROM products WHERE store_id = $1 LIMIT 3',
        [storeId]
      );
      
      if (products.rows.length > 0) {
        const items = products.rows.map(product => ({
          productId: product.id,
          productName: product.name,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: parseFloat(product.price_sell),
          discount: 0
        }));
        
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        await client.query(
          `INSERT INTO transactions (store_id, customer_id, invoice_number, items, subtotal, discount, tax, total, payment_status, payment_method, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 0, 0, $5, 'paid', 'cash', 'Transaksi contoh', NOW(), NOW())`,
          [storeId, storeCustomerIds[0], `TRX-${Date.now()}-${i}`, JSON.stringify(items), subtotal]
        );
      }
      console.log(`   ✅ Transaksi untuk toko ${storeId}`);
    }
    
    // 6. Update user dengan store ID yang benar
    console.log('👤 Update user store IDs...');
    await client.query(
      'UPDATE users SET store_ids = $1 WHERE email = $2',
      [JSON.stringify(storeIds), 'admin@pos.com']
    );
    
    console.log('🎉 Data dummy berhasil diisi!');
    console.log(`📊 Summary:`);
    console.log(`   - ${storeIds.length} toko`);
    console.log(`   - ${dummyData.products.length * storeIds.length} produk`);
    console.log(`   - ${dummyData.customers.length * storeIds.length} pelanggan`);
    console.log(`   - ${dummyData.cashFlowEntries.length * storeIds.length} entry arus kas`);
    console.log(`   - ${storeIds.length} transaksi`);
    
    // Tampilkan store IDs untuk referensi
    console.log('\n📋 Store IDs:');
    for (let i = 0; i < storeIds.length; i++) {
      console.log(`   ${dummyData.stores[i].name}: ${storeIds[i]}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Jalankan jika dipanggil langsung
if (import.meta.url === `file://${process.argv[1]}`) {
  populateData();
}

export { populateData };