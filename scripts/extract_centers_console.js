// 1. Hãy mở trình duyệt, truy cập: https://mindx.edu.vn/center?city=ALL&district=ALL
// 2. Kéo xuống dưới cùng để chờ màn hình tải hết tất cả các cơ sở.
// 3. Chuột phải chọn Inspect (Kiểm tra) -> Xong chọn tab Console. 
// 4. Copy toàn bộ đoạn script dưới đây DÁN VÀO console và nhấn Enter. 
// 5. Nó sẽ tự động tải file "mindx_centers_full.json" về máy bạn. Copy file này bỏ vào folder `scripts/` trong code là xong.

(function extractCenters() {
    // Tìm toàn bộ thẻ div chứa thông tin cơ sở
    const cards = Array.from(document.querySelectorAll('.flex.flex-col.gap-3.lg\\:gap-4.bg-mx-white.rounded-2xl')); 
    
    // Thu thập kết quả
    const results = cards.map(c => {
        const nameNode = c.querySelector('h3, h4, .font-semibold');
        const name = nameNode ? nameNode.innerText.trim() : 'MindX Unknown';
        
        // Đoạn này lấy address và các attribute khác
        const detailNodes = Array.from(c.querySelectorAll('span, p, a'));
        let address = '';
        let hotline = '';
        let map_link = '';
        
        detailNodes.forEach(n => {
            const text = n.innerText.trim();
            if (text.toLowerCase().includes('địa chỉ') || text.match(/[0-9]/) && text.toLowerCase().includes('quận') || text.toLowerCase().includes('phường')) {
               address = text.replace(/^Địa chỉ:\s*/i, '');
            }
            if (n.tagName.toLowerCase() === 'a' && n.href && n.href.includes('maps')) {
               map_link = n.href;
            }
        });
        
        return {
            name: name,
            address: address,
            region: name.includes('Đã Nẵng') ? 'Đà Nẵng' : name.includes('HCM') || address.includes('Hồ Chí Minh') ? 'Hồ Chí Minh' : address.includes('Hà Nội') ? 'Hà Nội' : 'Other',
            district: '',
            city: address.includes('Hà Nội') ? 'Hà Nội' : address.includes('Hồ Chí Minh') ? 'Hồ Chí Minh' : null,
            hotline: hotline,
            map_link: map_link
        }
    });

    // In ra console và tải xuống file JSON
    console.log(results);
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindx_centers_full.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
})();
