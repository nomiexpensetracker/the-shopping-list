-- Starter Packs Seed Data — Indonesia-first, 7 packs
-- All IDs are pre-generated CUID2 tokens.
-- Run AFTER schema-v6.sql.

-- ============================================================
-- Packs
-- ============================================================
INSERT INTO starter_packs (id, slug, title, description, category, cuisine, difficulty, locale, is_published, is_featured) VALUES
  ('sp_rendang01234567890', 'beef-rendang',    'Beef Rendang',          'Semua bumbu dan bahan untuk membuat rendang sapi yang otentik dan lezat.',            'food',    'Indonesian', 'medium', 'id-ID', true, true),
  ('sp_nasigoreng0123456', 'nasi-goreng',      'Nasi Goreng Spesial',   'Bahan-bahan lengkap untuk nasi goreng rumahan yang sederhana dan penuh cita rasa.',    'food',    'Indonesian', 'easy',   'id-ID', true, true),
  ('sp_sateayam01234567',  'sate-ayam',        'Sate Ayam Madura',      'Daftar belanja lengkap untuk sate ayam Madura dengan bumbu kacang khas.',              'food',    'Indonesian', 'medium', 'id-ID', true, false),
  ('sp_bbqparty012345678', 'bbq-party',        'BBQ Party',             'Semua yang kamu butuhkan untuk pesta BBQ seru bersama keluarga dan teman.',             'party',   'Indonesian', 'easy',   'id-ID', true, true),
  ('sp_camping01234567890','camping-trip',      'Camping Trip Essentials','Perbekalan makanan dan camilan untuk perjalanan berkemah 2 malam.',                    'outdoor', NULL,         'easy',   'id-ID', true, false),
  ('sp_gado0123456789012', 'gado-gado',        'Gado-Gado Jakarta',     'Bahan-bahan segar dan bumbu kacang untuk gado-gado ala Jakarta.',                      'food',    'Indonesian', 'easy',   'id-ID', true, false),
  ('sp_sopayang01234567',  'sop-ayam',         'Sop Ayam Kampung',      'Bahan lengkap untuk sop ayam kampung yang hangat dan menyehatkan.',                    'food',    'Indonesian', 'easy',   'id-ID', true, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Variants
-- ============================================================
INSERT INTO starter_pack_variants (id, starter_pack_id, name, locale, description) VALUES
  -- Beef Rendang
  ('spv_rendang_std01234', 'sp_rendang01234567890', 'Standar (4 porsi)',    'id-ID', 'Porsi standar untuk 4 orang'),
  ('spv_rendang_big01234', 'sp_rendang01234567890', 'Besar (8 porsi)',      'id-ID', 'Porsi besar untuk acara keluarga'),
  -- Nasi Goreng
  ('spv_nasgoren_std0123', 'sp_nasigoreng0123456',  'Standar (2 porsi)',    'id-ID', 'Untuk sarapan atau makan malam 2 orang'),
  -- Sate Ayam
  ('spv_sate_std012345678','sp_sateayam01234567',   'Standar (30 tusuk)',   'id-ID', 'Sate ayam 30 tusuk dengan bumbu kacang'),
  -- BBQ Party
  ('spv_bbq_small01234567','sp_bbqparty012345678',  'Small Party (5 orang)','id-ID', 'Paket BBQ untuk 5 orang'),
  ('spv_bbq_big0123456789','sp_bbqparty012345678',  'Big Party (10 orang)', 'id-ID', 'Paket BBQ besar untuk 10 orang'),
  -- Camping
  ('spv_camping_2night012','sp_camping01234567890',  '2 Malam (4 orang)',    'id-ID', 'Perbekalan untuk 4 orang selama 2 malam'),
  -- Gado-Gado
  ('spv_gado_std012345678','sp_gado0123456789012',  'Standar (4 porsi)',    'id-ID', 'Gado-gado untuk 4 orang'),
  -- Sop Ayam
  ('spv_sopayam_std012345','sp_sopayang01234567',   'Standar (4 porsi)',    'id-ID', 'Sop ayam untuk 4 orang')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — Beef Rendang Standar
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_r1_01','spv_rendang_std01234','Daging sapi (has dalam)',1,'kg',false,'daging',180000,1),
  ('spvi_r1_02','spv_rendang_std01234','Santan kental',2,'bungkus',false,'bumbu',15000,2),
  ('spvi_r1_03','spv_rendang_std01234','Bawang merah',150,'gram',false,'sayuran',8000,3),
  ('spvi_r1_04','spv_rendang_std01234','Bawang putih',6,'siung',false,'sayuran',5000,4),
  ('spvi_r1_05','spv_rendang_std01234','Cabai merah keriting',10,'buah',false,'bumbu',6000,5),
  ('spvi_r1_06','spv_rendang_std01234','Serai',3,'batang',false,'bumbu',3000,6),
  ('spvi_r1_07','spv_rendang_std01234','Daun kunyit',2,'lembar',false,'bumbu',2000,7),
  ('spvi_r1_08','spv_rendang_std01234','Lengkuas',1,'ruas',false,'bumbu',3000,8),
  ('spvi_r1_09','spv_rendang_std01234','Kunyit',1,'ruas',false,'bumbu',2000,9),
  ('spvi_r1_10','spv_rendang_std01234','Jahe',1,'ruas',false,'bumbu',2000,10),
  ('spvi_r1_11','spv_rendang_std01234','Garam',1,'bungkus',false,'bumbu',3000,11),
  ('spvi_r1_12','spv_rendang_std01234','Gula merah',1,'bungkus',true,'bumbu',5000,12)
ON CONFLICT (id) DO NOTHING;

-- Items — Beef Rendang Besar (8 porsi)
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_r2_01','spv_rendang_big01234','Daging sapi (has dalam)',2,'kg',false,'daging',360000,1),
  ('spvi_r2_02','spv_rendang_big01234','Santan kental',4,'bungkus',false,'bumbu',30000,2),
  ('spvi_r2_03','spv_rendang_big01234','Bawang merah',300,'gram',false,'sayuran',16000,3),
  ('spvi_r2_04','spv_rendang_big01234','Bawang putih',12,'siung',false,'sayuran',8000,4),
  ('spvi_r2_05','spv_rendang_big01234','Cabai merah keriting',20,'buah',false,'bumbu',12000,5),
  ('spvi_r2_06','spv_rendang_big01234','Serai',5,'batang',false,'bumbu',5000,6),
  ('spvi_r2_07','spv_rendang_big01234','Daun kunyit',4,'lembar',false,'bumbu',3000,7),
  ('spvi_r2_08','spv_rendang_big01234','Lengkuas',2,'ruas',false,'bumbu',5000,8),
  ('spvi_r2_09','spv_rendang_big01234','Kunyit',2,'ruas',false,'bumbu',4000,9),
  ('spvi_r2_10','spv_rendang_big01234','Jahe',2,'ruas',false,'bumbu',4000,10),
  ('spvi_r2_11','spv_rendang_big01234','Garam',2,'bungkus',false,'bumbu',5000,11),
  ('spvi_r2_12','spv_rendang_big01234','Gula merah',2,'bungkus',true,'bumbu',10000,12)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — Nasi Goreng Standar
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_ng_01','spv_nasgoren_std0123','Nasi putih (sisa kemarin)',2,'porsi',false,'karbohidrat',NULL,1),
  ('spvi_ng_02','spv_nasgoren_std0123','Telur ayam',2,'butir',false,'protein',4000,2),
  ('spvi_ng_03','spv_nasgoren_std0123','Ayam suwir',100,'gram',true,'protein',15000,3),
  ('spvi_ng_04','spv_nasgoren_std0123','Bawang merah',3,'siung',false,'bumbu',3000,4),
  ('spvi_ng_05','spv_nasgoren_std0123','Bawang putih',2,'siung',false,'bumbu',2000,5),
  ('spvi_ng_06','spv_nasgoren_std0123','Kecap manis',1,'botol',false,'bumbu',12000,6),
  ('spvi_ng_07','spv_nasgoren_std0123','Cabai rawit',3,'buah',true,'bumbu',3000,7),
  ('spvi_ng_08','spv_nasgoren_std0123','Daun bawang',2,'batang',false,'sayuran',3000,8),
  ('spvi_ng_09','spv_nasgoren_std0123','Wortel',1,'buah',true,'sayuran',5000,9),
  ('spvi_ng_10','spv_nasgoren_std0123','Minyak goreng',3,'sdm',false,'bumbu',4000,10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — Sate Ayam Madura Standar
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_sa_01','spv_sate_std012345678','Dada ayam',500,'gram',false,'protein',35000,1),
  ('spvi_sa_02','spv_sate_std012345678','Tusuk sate',50,'buah',false,'alat',5000,2),
  ('spvi_sa_03','spv_sate_std012345678','Kacang tanah goreng',200,'gram',false,'bumbu',15000,3),
  ('spvi_sa_04','spv_sate_std012345678','Kecap manis',1,'botol',false,'bumbu',12000,4),
  ('spvi_sa_05','spv_sate_std012345678','Bawang putih',4,'siung',false,'bumbu',3000,5),
  ('spvi_sa_06','spv_sate_std012345678','Cabai rawit',5,'buah',false,'bumbu',3000,6),
  ('spvi_sa_07','spv_sate_std012345678','Bawang merah goreng',2,'sdm',true,'bumbu',5000,7),
  ('spvi_sa_08','spv_sate_std012345678','Air jeruk limau',2,'buah',false,'bumbu',4000,8),
  ('spvi_sa_09','spv_sate_std012345678','Gula merah',1,'bungkus',false,'bumbu',5000,9),
  ('spvi_sa_10','spv_sate_std012345678','Garam',1,'bungkus',false,'bumbu',3000,10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — BBQ Party Small (5 orang)
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_bbqs_01','spv_bbq_small01234567','Daging sapi slice',500,'gram',false,'daging',80000,1),
  ('spvi_bbqs_02','spv_bbq_small01234567','Ayam potong',1,'kg',false,'protein',45000,2),
  ('spvi_bbqs_03','spv_bbq_small01234567','Sosis sapi',10,'buah',false,'protein',30000,3),
  ('spvi_bbqs_04','spv_bbq_small01234567','Jagung manis',5,'buah',false,'sayuran',15000,4),
  ('spvi_bbqs_05','spv_bbq_small01234567','Brokoli',1,'kepala',true,'sayuran',12000,5),
  ('spvi_bbqs_06','spv_bbq_small01234567','Saus BBQ',1,'botol',false,'bumbu',25000,6),
  ('spvi_bbqs_07','spv_bbq_small01234567','Saus sambal',1,'botol',false,'bumbu',15000,7),
  ('spvi_bbqs_08','spv_bbq_small01234567','Arang BBQ',2,'kg',false,'alat',20000,8),
  ('spvi_bbqs_09','spv_bbq_small01234567','Aluminium foil',1,'gulung',true,'alat',12000,9),
  ('spvi_bbqs_10','spv_bbq_small01234567','Tusuk sate',1,'pak',false,'alat',8000,10),
  ('spvi_bbqs_11','spv_bbq_small01234567','Roti tawar',2,'bungkus',true,'karbohidrat',15000,11)
ON CONFLICT (id) DO NOTHING;

-- Items — BBQ Party Big (10 orang)
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_bbqb_01','spv_bbq_big0123456789','Daging sapi slice',1,'kg',false,'daging',160000,1),
  ('spvi_bbqb_02','spv_bbq_big0123456789','Ayam potong',2,'kg',false,'protein',90000,2),
  ('spvi_bbqb_03','spv_bbq_big0123456789','Sosis sapi',20,'buah',false,'protein',60000,3),
  ('spvi_bbqb_04','spv_bbq_big0123456789','Jagung manis',10,'buah',false,'sayuran',30000,4),
  ('spvi_bbqb_05','spv_bbq_big0123456789','Brokoli',2,'kepala',true,'sayuran',24000,5),
  ('spvi_bbqb_06','spv_bbq_big0123456789','Saus BBQ',2,'botol',false,'bumbu',50000,6),
  ('spvi_bbqb_07','spv_bbq_big0123456789','Saus sambal',2,'botol',false,'bumbu',30000,7),
  ('spvi_bbqb_08','spv_bbq_big0123456789','Arang BBQ',4,'kg',false,'alat',40000,8),
  ('spvi_bbqb_09','spv_bbq_big0123456789','Aluminium foil',2,'gulung',true,'alat',24000,9),
  ('spvi_bbqb_10','spv_bbq_big0123456789','Tusuk sate',2,'pak',false,'alat',16000,10),
  ('spvi_bbqb_11','spv_bbq_big0123456789','Roti tawar',4,'bungkus',true,'karbohidrat',30000,11)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — Camping Trip (2 malam, 4 orang)
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_cam_01','spv_camping_2night012','Indomie goreng',12,'bungkus',false,'karbohidrat',4000,1),
  ('spvi_cam_02','spv_camping_2night012','Nasi instant',8,'bungkus',false,'karbohidrat',8000,2),
  ('spvi_cam_03','spv_camping_2night012','Telur ayam',12,'butir',false,'protein',24000,3),
  ('spvi_cam_04','spv_camping_2night012','Sarden kaleng',4,'kaleng',false,'protein',20000,4),
  ('spvi_cam_05','spv_camping_2night012','Kornet sapi',2,'kaleng',false,'protein',30000,5),
  ('spvi_cam_06','spv_camping_2night012','Roti tawar',2,'bungkus',false,'karbohidrat',15000,6),
  ('spvi_cam_07','spv_camping_2night012','Selai kacang',1,'botol',true,'makanan',25000,7),
  ('spvi_cam_08','spv_camping_2night012','Air mineral 1.5L',8,'botol',false,'minuman',12000,8),
  ('spvi_cam_09','spv_camping_2night012','Kopi sachet',1,'kotak',false,'minuman',20000,9),
  ('spvi_cam_10','spv_camping_2night012','Snack campur',1,'kg',false,'snack',40000,10),
  ('spvi_cam_11','spv_camping_2night012','Cokelat batang',4,'buah',true,'snack',20000,11),
  ('spvi_cam_12','spv_camping_2night012','Garam',1,'bungkus',false,'bumbu',3000,12),
  ('spvi_cam_13','spv_camping_2night012','Minyak goreng sachet',4,'sachet',false,'bumbu',8000,13)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — Gado-Gado Jakarta
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_gado_01','spv_gado_std012345678','Kacang tanah goreng',200,'gram',false,'bumbu',15000,1),
  ('spvi_gado_02','spv_gado_std012345678','Tempe',2,'papan',false,'protein',10000,2),
  ('spvi_gado_03','spv_gado_std012345678','Tahu putih',4,'buah',false,'protein',8000,3),
  ('spvi_gado_04','spv_gado_std012345678','Telur rebus',4,'butir',false,'protein',8000,4),
  ('spvi_gado_05','spv_gado_std012345678','Kentang',3,'buah',false,'sayuran',10000,5),
  ('spvi_gado_06','spv_gado_std012345678','Kangkung',1,'ikat',false,'sayuran',6000,6),
  ('spvi_gado_07','spv_gado_std012345678','Tauge',100,'gram',false,'sayuran',5000,7),
  ('spvi_gado_08','spv_gado_std012345678','Kacang panjang',100,'gram',false,'sayuran',5000,8),
  ('spvi_gado_09','spv_gado_std012345678','Kecap manis',1,'botol',false,'bumbu',12000,9),
  ('spvi_gado_10','spv_gado_std012345678','Cabai rawit',3,'buah',true,'bumbu',3000,10),
  ('spvi_gado_11','spv_gado_std012345678','Bawang putih',2,'siung',false,'bumbu',2000,11),
  ('spvi_gado_12','spv_gado_std012345678','Air asam jawa',2,'sdm',false,'bumbu',4000,12)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items — Sop Ayam Kampung
-- ============================================================
INSERT INTO starter_pack_variant_items (id, variant_id, name, quantity, unit, is_optional, category, default_price, position) VALUES
  ('spvi_sop_01','spv_sopayam_std012345','Ayam kampung',1,'ekor',false,'protein',65000,1),
  ('spvi_sop_02','spv_sopayam_std012345','Wortel',3,'buah',false,'sayuran',9000,2),
  ('spvi_sop_03','spv_sopayam_std012345','Kentang',3,'buah',false,'sayuran',12000,3),
  ('spvi_sop_04','spv_sopayam_std012345','Daun bawang',3,'batang',false,'sayuran',4000,4),
  ('spvi_sop_05','spv_sopayam_std012345','Seledri',2,'batang',false,'sayuran',4000,5),
  ('spvi_sop_06','spv_sopayam_std012345','Bawang putih',4,'siung',false,'bumbu',3000,6),
  ('spvi_sop_07','spv_sopayam_std012345','Bawang merah',4,'siung',false,'bumbu',3000,7),
  ('spvi_sop_08','spv_sopayam_std012345','Merica bubuk',1,'bungkus',false,'bumbu',4000,8),
  ('spvi_sop_09','spv_sopayam_std012345','Garam',1,'bungkus',false,'bumbu',3000,9),
  ('spvi_sop_10','spv_sopayam_std012345','Pala bubuk',1,'bungkus',true,'bumbu',5000,10),
  ('spvi_sop_11','spv_sopayam_std012345','Bawang goreng',1,'bungkus',true,'bumbu',8000,11)
ON CONFLICT (id) DO NOTHING;
