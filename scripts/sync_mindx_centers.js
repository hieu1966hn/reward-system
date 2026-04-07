const fs = require('fs');
const path = require('path');

// Đọc thủ công file .env.local để lấy biến môi trường mà không cần gói 'dotenv'
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncCampuses() {
  console.log('--- Bắt đầu đồng bộ danh sách cơ sở MindX ---');
  
  if (!fs.existsSync('scripts/mindx_centers_full.json')) {
    console.error('Không tìm thấy file scripts/mindx_centers_full.json');
    console.log('Vui lòng tạo file này và chứa danh sách mảng JSON các cơ sở nhé.');
    console.log(`Định dạng ví dụ:
[
  {
    "name": "MindX Nguyễn Chí Thanh",
    "address": "Tầng 5, 71 Nguyễn Chí Thanh, Quận Đống Đa, Hà Nội",
    "region": "Hà Nội",
    "district": "Đống Đa",
    "city": "Hà Nội",
    "hotline": "02477717888",
    "map_link": "https://maps.app.goo.gl/..."
  }
]
    `);
    process.exit(1);
  }

  const newCenters = JSON.parse(fs.readFileSync('scripts/mindx_centers_full.json', 'utf-8'));
  console.log(`Đã load ${newCenters.length} cơ sở từ file JSON.`);

  // Bước 1: Fetch tất cả campuses hiện tại
  const { data: currentCampuses, error: fetchError } = await supabase
    .from('campuses')
    .select('*');

  if (fetchError) {
    console.error('Lỗi lấy danh sách campuses hiện hành:', fetchError);
    return;
  }
  
  console.log(`Đang có ${currentCampuses.length} cơ sở trong Database.`);

  // Bước 2: Tạm tắt tất cả (Soft Delete) để đảm bảo không làm gãy foreign key.
  // Các cơ sở cũ không có trong danh sách mới sẽ ẩn.
  if (currentCampuses.length > 0) {
    console.log('Đang thực hiện vô hiệu hóa (soft-delete) toàn bộ cơ sở cũ...');
    const { error: deactivateError } = await supabase
      .from('campuses')
      .update({ is_active: false })
      .in('id', currentCampuses.map(c => c.id));
      
    if (deactivateError) {
      console.error('Lỗi khi tắt is_active:', deactivateError);
      return;
    }
  }

  // Bước 3: Đưa danh sách cơ sở mới vào
  console.log('Bắt đầu đồng bộ các cơ sở mới...');
  let insertedCounts = 0;
  let updatedCounts = 0;

  for (const center of newCenters) {
    // Tìm thử xem cơ sở có bị trùng tên hoặc ID cũ không
    const existing = currentCampuses.find(c => c.campus_name.toLowerCase() === center.name.toLowerCase());
    
    // Fallback region / city handling
    let region = center.region || center.city;
    if (!region) {
      if (center.address && center.address.includes('Hà Nội')) region = 'Hà Nội';
      else if (center.address && center.address.includes('TP. HCM')) region = 'Hồ Chí Minh';
      else if (center.address && center.address.includes('Hồ Chí Minh')) region = 'Hồ Chí Minh';
      else region = 'Khác';
    }

    const payload = {
      campus_name: center.name,
      region: region,
      address: center.address || null,
      city: center.city || region || null,
      district: center.district || null,
      hotline: center.hotline || null,
      map_link: center.map_link || null,
      is_active: true
    };

    if (existing) {
      // Cập nhật lại cơ sở đã tồn tại, kích hoạt lại is_active = true
      const { error: updateError } = await supabase
        .from('campuses')
        .update(payload)
        .eq('id', existing.id);
        
      if (updateError) {
        console.error(`Lỗi cập nhật [${center.name}]:`, updateError);
      } else {
        updatedCounts++;
      }
    } else {
      // Thêm mới hoàn toàn
      const { error: insertError } = await supabase
        .from('campuses')
        .insert([payload]);
        
      if (insertError) {
        console.error(`Lỗi thêm mới [${center.name}]:`, insertError);
      } else {
        insertedCounts++;
      }
    }
  }

  console.log('--- HOÀN THIỆN ĐỒNG BỘ ---');
  console.log(`- Base cập nhật lại / tái kích hoạt: ${updatedCounts}`);
  console.log(`- Base thêm mới: ${insertedCounts}`);
  const deactivatedCount = currentCampuses.length - updatedCounts;
  console.log(`- Số lượng cơ sở ngưng hoạt động (bị ẩn đi): ${deactivatedCount > 0 ? deactivatedCount : 0}`);
}

syncCampuses();
