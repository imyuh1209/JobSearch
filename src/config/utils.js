// Function to determine color based on HTTP method
export const colorMethod = (method) => {
    switch (method) {
        case 'GET':
            return '#61affe';
        case 'POST':
            return '#49cc90';
        case 'PUT':
            return '#fca130';
        case 'DELETE':
            return '#f93e3e';
        case 'PATCH':
            return '#50e3c2';
        default:
            return '#000000';
    }
};

// Function to group permissions by module
export const groupByPermission = (data) => {
    const groups = {};

    if (Array.isArray(data)) {
        data.forEach(item => {
            const { module } = item;
            if (!groups[module]) {
                groups[module] = {
                    module,
                    permissions: []
                };
            }
            groups[module].permissions.push(item);
        });
    }

    return Object.values(groups);
};

// Function to build query params
export const buildQuery = (page, pageSize, filters = {}, additionalParams = {}) => {
    let query = `page=${page}&size=${pageSize}`;

    // Add sort if provided
    if (additionalParams.sort) {
        query += `&sort=${additionalParams.sort}`;
    } else {
        query += `&sort=updatedAt,desc`;
    }

    // Add filters if provided
    const filterStrings = [];

    // Handle salary range if provided
    const { salaryMin, salaryMax, ...restFilters } = filters || {};
    if (salaryMin !== undefined && salaryMin !== null && salaryMin !== "") {
        const min = Number(salaryMin);
        if (!Number.isNaN(min)) filterStrings.push(`salary >= ${min}`);
    }
    if (salaryMax !== undefined && salaryMax !== null && salaryMax !== "") {
        const max = Number(salaryMax);
        if (!Number.isNaN(max)) filterStrings.push(`salary <= ${max}`);
    }

    for (const key in restFilters) {
        const value = restFilters[key];
        if (value === undefined || value === null || value === "") continue;
        filterStrings.push(`${key} ~ '${value}'`);
    }

    if (filterStrings.length > 0) {
        query = `filter=${filterStrings.join(' and ')}&${query}`;
    }

    return query;
};

export const LOCATION_LIST = [
    { label: "ALL", value: "ALL" },
    // Thành phố trực thuộc trung ương
    { label: "Hà Nội", value: "HANOI" },
    { label: "Hồ Chí Minh", value: "HOCHIMINH" },
    { label: "Đà Nẵng", value: "DANANG" },
    { label: "Hải Phòng", value: "HAIPHONG" },
    { label: "Cần Thơ", value: "CANTHO" },
    // Tỉnh
    { label: "An Giang", value: "ANGIANG" },
    { label: "Bà Rịa - Vũng Tàu", value: "BARIAVUNGTAU" },
    { label: "Bắc Giang", value: "BACGIANG" },
    { label: "Bắc Kạn", value: "BACKAN" },
    { label: "Bạc Liêu", value: "BACLIEU" },
    { label: "Bắc Ninh", value: "BACNINH" },
    { label: "Bến Tre", value: "BENTRE" },
    { label: "Bình Dương", value: "BINHDUONG" },
    { label: "Bình Phước", value: "BINHPHUOC" },
    { label: "Bình Thuận", value: "BINHTHUAN" },
    { label: "Bình Định", value: "BINHDINH" },
    { label: "Cà Mau", value: "CAMAU" },
    { label: "Cao Bằng", value: "CAOBANG" },
    { label: "Đắk Lắk", value: "DAKLAK" },
    { label: "Đắk Nông", value: "DAKNONG" },
    { label: "Điện Biên", value: "DIENBIEN" },
    { label: "Đồng Nai", value: "DONGNAI" },
    { label: "Đồng Tháp", value: "DONGTHAP" },
    { label: "Gia Lai", value: "GIALAI" },
    { label: "Hà Giang", value: "HAGIANG" },
    { label: "Hà Nam", value: "HANAM" },
    { label: "Hà Tĩnh", value: "HATINH" },
    { label: "Hải Dương", value: "HAIDUONG" },
    { label: "Hậu Giang", value: "HAUGIANG" },
    { label: "Hòa Bình", value: "HOABINH" },
    { label: "Hưng Yên", value: "HUNGYEN" },
    { label: "Khánh Hòa", value: "KHANHHOA" },
    { label: "Kiên Giang", value: "KIENGIANG" },
    { label: "Kon Tum", value: "KONTUM" },
    { label: "Lai Châu", value: "LAICHAU" },
    { label: "Lạng Sơn", value: "LANGSON" },
    { label: "Lào Cai", value: "LAOCAI" },
    { label: "Lâm Đồng", value: "LAMDONG" },
    { label: "Long An", value: "LONGAN" },
    { label: "Nam Định", value: "NAMDINH" },
    { label: "Nghệ An", value: "NGHEAN" },
    { label: "Ninh Bình", value: "NINHBINH" },
    { label: "Ninh Thuận", value: "NINHTHUAN" },
    { label: "Phú Thọ", value: "PHUTHO" },
    { label: "Phú Yên", value: "PHUYEN" },
    { label: "Quảng Bình", value: "QUANGBINH" },
    { label: "Quảng Nam", value: "QUANGNAM" },
    { label: "Quảng Ngãi", value: "QUANGNGAI" },
    { label: "Quảng Ninh", value: "QUANGNINH" },
    { label: "Quảng Trị", value: "QUANGTRI" },
    { label: "Sóc Trăng", value: "SOCTRANG" },
    { label: "Sơn La", value: "SONLA" },
    { label: "Tây Ninh", value: "TAYNINH" },
    { label: "Thái Bình", value: "THAIBINH" },
    { label: "Thái Nguyên", value: "THAINGUYEN" },
    { label: "Thanh Hóa", value: "THANHHOA" },
    { label: "Thừa Thiên Huế", value: "THUATHIENHUE" },
    { label: "Tiền Giang", value: "TIENGIANG" },
    { label: "Trà Vinh", value: "TRAVINH" },
    { label: "Tuyên Quang", value: "TUYENQUANG" },
    { label: "Vĩnh Long", value: "VINHLONG" },
    { label: "Vĩnh Phúc", value: "VINHPHUC" },
    { label: "Yên Bái", value: "YENBAI" },
    // Tuỳ chọn khác
    { label: "Khác", value: "OTHER" }
];
