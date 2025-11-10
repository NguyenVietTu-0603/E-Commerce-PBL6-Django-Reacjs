export const vietnamLocations = {
  cities: [
    { id: '01', name: 'Hà Nội' },
    { id: '79', name: 'TP. Hồ Chí Minh' },
    { id: '48', name: 'Đà Nẵng' },
    { id: '92', name: 'Cần Thơ' },
    { id: '31', name: 'Hải Phòng' },
    { id: '04', name: 'Cao Bằng' },
    { id: '06', name: 'Bắc Kạn' },
    { id: '10', name: 'Lào Cai' },
  ],
  
  districts: {
    '01': [ // Hà Nội
      { id: '001', name: 'Quận Ba Đình', cityId: '01' },
      { id: '002', name: 'Quận Hoàn Kiếm', cityId: '01' },
      { id: '003', name: 'Quận Tây Hồ', cityId: '01' },
      { id: '004', name: 'Quận Long Biên', cityId: '01' },
      { id: '005', name: 'Quận Cầu Giấy', cityId: '01' },
      { id: '006', name: 'Quận Đống Đa', cityId: '01' },
      { id: '007', name: 'Quận Hai Bà Trưng', cityId: '01' },
      { id: '008', name: 'Quận Hoàng Mai', cityId: '01' },
      { id: '009', name: 'Quận Thanh Xuân', cityId: '01' },
    ],
    '79': [ // TP.HCM
      { id: '760', name: 'Quận 1', cityId: '79' },
      { id: '761', name: 'Quận 2', cityId: '79' },
      { id: '762', name: 'Quận 3', cityId: '79' },
      { id: '763', name: 'Quận 4', cityId: '79' },
      { id: '764', name: 'Quận 5', cityId: '79' },
      { id: '765', name: 'Quận 6', cityId: '79' },
      { id: '766', name: 'Quận 7', cityId: '79' },
      { id: '767', name: 'Quận 8', cityId: '79' },
      { id: '768', name: 'Quận 9', cityId: '79' },
      { id: '769', name: 'Quận 10', cityId: '79' },
      { id: '770', name: 'Quận 11', cityId: '79' },
      { id: '771', name: 'Quận 12', cityId: '79' },
      { id: '772', name: 'Quận Bình Thạnh', cityId: '79' },
      { id: '773', name: 'Quận Tân Bình', cityId: '79' },
      { id: '774', name: 'Quận Tân Phú', cityId: '79' },
      { id: '775', name: 'Quận Phú Nhuận', cityId: '79' },
    ],
    '48': [ // Đà Nẵng
      { id: '490', name: 'Quận Liên Chiểu', cityId: '48' },
      { id: '491', name: 'Quận Thanh Khê', cityId: '48' },
      { id: '492', name: 'Quận Hải Châu', cityId: '48' },
      { id: '493', name: 'Quận Sơn Trà', cityId: '48' },
      { id: '494', name: 'Quận Ngũ Hành Sơn', cityId: '48' },
      { id: '495', name: 'Quận Cẩm Lệ', cityId: '48' },
    ]
  },
  
  wards: {
    '001': [ // Ba Đình
      { id: '00001', name: 'Phường Phúc Xá', districtId: '001' },
      { id: '00002', name: 'Phường Trúc Bạch', districtId: '001' },
      { id: '00003', name: 'Phường Vĩnh Phúc', districtId: '001' },
      { id: '00004', name: 'Phường Cống Vị', districtId: '001' },
      { id: '00005', name: 'Phường Liễu Giai', districtId: '001' },
    ],
    '002': [ // Hoàn Kiếm
      { id: '00006', name: 'Phường Phúc Tân', districtId: '002' },
      { id: '00007', name: 'Phường Đồng Xuân', districtId: '002' },
      { id: '00008', name: 'Phường Hàng Mã', districtId: '002' },
      { id: '00009', name: 'Phường Hàng Buồm', districtId: '002' },
      { id: '00010', name: 'Phường Hàng Đào', districtId: '002' },
    ],
    '760': [ // Quận 1
      { id: '26734', name: 'Phường Tân Định', districtId: '760' },
      { id: '26735', name: 'Phường Đa Kao', districtId: '760' },
      { id: '26736', name: 'Phường Bến Nghé', districtId: '760' },
      { id: '26737', name: 'Phường Bến Thành', districtId: '760' },
      { id: '26738', name: 'Phường Nguyễn Thái Bình', districtId: '760' },
    ],
    '490': [ // Liên Chiểu
      { id: '20194', name: 'Phường Hòa Hiệp Bắc', districtId: '490' },
      { id: '20195', name: 'Phường Hòa Hiệp Nam', districtId: '490' },
      { id: '20196', name: 'Phường Hòa Khánh Bắc', districtId: '490' },
      { id: '20197', name: 'Phường Hòa Khánh Nam', districtId: '490' },
    ]
  }
};

export const getCities = () => {
  return vietnamLocations.cities;
};

export const getDistrictsByCity = (cityId) => {
  return vietnamLocations.districts[cityId] || [];
};

export const getWardsByDistrict = (districtId) => {
  return vietnamLocations.wards[districtId] || [];
};

export const getCityName = (cityId) => {
  return vietnamLocations.cities.find(c => c.id === cityId)?.name || '';
};

export const getDistrictName = (districtId) => {
  for (const districts of Object.values(vietnamLocations.districts)) {
    const district = districts.find(d => d.id === districtId);
    if (district) return district.name;
  }
  return '';
};

export const getWardName = (wardId) => {
  for (const wards of Object.values(vietnamLocations.wards)) {
    const ward = wards.find(w => w.id === wardId);
    if (ward) return ward.name;
  }
  return '';
};