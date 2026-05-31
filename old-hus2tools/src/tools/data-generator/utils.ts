const SURNAMES = ['王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧','程','曹','袁','邓','许','傅','沈','曾','彭','吕','苏','卢','蒋','蔡','贾','丁','魏','薛','叶','阎','余','潘','杜','戴','夏','钟','汪','田','任','姜','范','方','石','姚','谭','廖','邹','熊','金','陆','郝','孔','白','崔','康','毛','邱','秦','江','史','顾','侯','邵','孟','龙','万','段','雷','钱','汤','尹','黎','易','常','武','乔','贺','赖','龚','文'];
const GIVEN_NAMES = ['伟','芳','娜','敏','静','丽','强','磊','军','洋','勇','艳','杰','涛','明','超','秀英','华','慧','建华','建国','桂花','玉兰','秀兰','鑫','鹏','飞','宇','轩','泽','浩','子涵','梓涵','欣怡','子轩','浩然','浩宇','欣悦','诗涵','可欣','梦琪','雨萱','紫萱','思涵','若曦','一诺','梓萱','语桐','雨桐'];
const EMAIL_DOMAINS = ['qq.com','163.com','gmail.com','outlook.com','126.com','sina.com','foxmail.com'];
const PHONE_PREFIXES = ['130','131','132','133','134','135','136','137','138','139','150','151','152','153','155','156','157','158','159','170','171','172','173','175','176','177','178','180','181','182','183','184','185','186','187','188','189','191','198','199'];
const AREA_CODES = ['110101','110102','110105','110106','110107','110108','110109','110111','110112','110113','110114','110115','110116','110117','310101','310104','310105','310106','310107','310109','310110','310112','310113','310114','310115','310116','310117','310118','440103','440104','440105','440106','440111','440112','440113','440114','440115','500103','500104','500105','500106','500107','500108','500109','500110','500111','500112','500113','500114','500115','500116'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function padZero(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

export function generatePhone(): string {
  return randomItem(PHONE_PREFIXES) + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

export function generateIdCard(): string {
  const areaCode = randomItem(AREA_CODES);
  const year = 1960 + Math.floor(Math.random() * 60);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const seq = Math.floor(Math.random() * 999);
  const base = areaCode + padZero(year, 4) + padZero(month, 2) + padZero(day, 2) + padZero(seq, 3);
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += parseInt(base[i]) * weights[i];
  return base + checkCodes[sum % 11];
}

export function generateEmail(): string {
  const name = 'user' + Math.floor(Math.random() * 100000);
  return name + '@' + randomItem(EMAIL_DOMAINS);
}

export function generateName(): string {
  return randomItem(SURNAMES) + randomItem(GIVEN_NAMES);
}

export type DataType = 'phone' | 'idcard' | 'email' | 'name';

export function generateBatch(types: DataType[], count: number): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  for (let i = 0; i < count; i++) {
    const row: Record<string, string> = {};
    for (const type of types) {
      switch (type) {
        case 'phone': row['手机号'] = generatePhone(); break;
        case 'idcard': row['身份证号'] = generateIdCard(); break;
        case 'email': row['邮箱'] = generateEmail(); break;
        case 'name': row['姓名'] = generateName(); break;
      }
    }
    results.push(row);
  }
  return results;
}

export function toCSV(data: Record<string, string>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const lines = [headers.join(',')];
  for (const row of data) {
    lines.push(headers.map(h => row[h]).join(','));
  }
  return lines.join('\n');
}

export function toJSON(data: Record<string, string>[]): string {
  return JSON.stringify(data, null, 2);
}
