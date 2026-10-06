export type AdminRole = "super" | "editor";

export interface MockAdmin {
  id: number;
  username: string;
  password: string;
  name: string;
  role: AdminRole;
  email: string;
  active: boolean;
  lastLogin: string;
}

export interface MockUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  joined: string;
  status: "active" | "blocked";
  readCount: number;
}

export interface MockMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  replied: boolean;
}

export interface MockNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  kind: "message" | "user" | "article" | "system";
}

export interface VisitPoint {
  label: string;
  value: number;
}

export interface SiteSettings {
  siteName: string;
  siteDesc: string;
  supportEmail: string;
  allowComments: boolean;
  maintenance: boolean;
  notifyNewMessage: boolean;
}

export const mockAdmins: MockAdmin[] = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    name: "علی محمدی",
    role: "super",
    email: "admin@electrocar.ir",
    active: true,
    lastLogin: "۱۱ مهر ۱۴۰۵",
  },
  {
    id: 2,
    username: "editor",
    password: "123456",
    name: "سارا رضایی",
    role: "editor",
    email: "editor@electrocar.ir",
    active: true,
    lastLogin: "۱۰ مهر ۱۴۰۵",
  },
  {
    id: 3,
    username: "karimi",
    password: "123456",
    name: "رضا کریمی",
    role: "editor",
    email: "karimi@electrocar.ir",
    active: false,
    lastLogin: "۲ مهر ۱۴۰۵",
  },
];

export const mockUsers: MockUser[] = [
  { id: 1, name: "امیر حسینی", email: "amir@example.com", phone: "09121234567", joined: "۸ مهر ۱۴۰۵", status: "active", readCount: 24 },
  { id: 2, name: "نگار احمدی", email: "negar@example.com", phone: "09129876543", joined: "۷ مهر ۱۴۰۵", status: "active", readCount: 17 },
  { id: 3, name: "مهدی صادقی", email: "mahdi@example.com", phone: "09351112233", joined: "۶ مهر ۱۴۰۵", status: "active", readCount: 31 },
  { id: 4, name: "زهرا موسوی", email: "zahra@example.com", phone: "09194445566", joined: "۵ مهر ۱۴۰۵", status: "blocked", readCount: 4 },
  { id: 5, name: "پارسا نادری", email: "parsa@example.com", phone: "09207778899", joined: "۴ مهر ۱۴۰۵", status: "active", readCount: 12 },
  { id: 6, name: "الهام کریمی", email: "elham@example.com", phone: "09123334455", joined: "۳ مهر ۱۴۰۵", status: "active", readCount: 9 },
  { id: 7, name: "کیان مرادی", email: "kian@example.com", phone: "09366667788", joined: "۲ مهر ۱۴۰۵", status: "active", readCount: 21 },
  { id: 8, name: "دنیا فرهادی", email: "donya@example.com", phone: "09012223344", joined: "۱ مهر ۱۴۰۵", status: "blocked", readCount: 2 },
];

export const mockMessages: MockMessage[] = [
  {
    id: 1,
    name: "امیر حسینی",
    email: "amir@example.com",
    subject: "سوال درباره شارژ خانگی",
    body: "سلام، برای شارژ خانگی خودروی برقی چه آمپراژی پیشنهاد می‌کنید؟ آیا نیاز به کنتور جداست؟ ممنون می‌شم راهنمایی کنید.",
    date: "۱۱ مهر ۱۴۰۵",
    read: false,
    replied: false,
  },
  {
    id: 2,
    name: "نگار احمدی",
    email: "negar@example.com",
    subject: "درخواست بررسی خودرو",
    body: "سلام، امکانش هست خودروی جدید BYD را هم بررسی کنید؟ خیلی ممنون از مقالات خوبتون.",
    date: "۱۰ مهر ۱۴۰۵",
    read: false,
    replied: false,
  },
  {
    id: 3,
    name: "مهدی صادقی",
    email: "mahdi@example.com",
    subject: "خطا در صفحه مقایسه",
    body: "سلام، در صفحه مقایسه وقتی دو خودرو انتخاب می‌کنم جدول به‌هم می‌ریزد. لطفا بررسی کنید.",
    date: "۹ مهر ۱۴۰۵",
    read: false,
    replied: false,
  },
  {
    id: 4,
    name: "زهرا موسوی",
    email: "zahra@example.com",
    subject: "تشکر از راهنمای باتری",
    body: "مقاله عمر باتری عالی بود. فقط کاش درباره گارانتی باتری‌ها هم بنویسید.",
    date: "۸ مهر ۱۴۰۵",
    read: true,
    replied: true,
  },
  {
    id: 5,
    name: "پارسا نادری",
    email: "parsa@example.com",
    subject: "تبلیغات و همکاری",
    body: "سلام، برای همکاری و رپورتاژ آگهی شرایط‌تان چیست؟ لطفا تعرفه را ارسال کنید.",
    date: "۷ مهر ۱۴۰۵",
    read: true,
    replied: false,
  },
  {
    id: 6,
    name: "کیان مرادی",
    email: "kian@example.com",
    subject: "پیشنهاد موضوع مقاله",
    body: "سلام، پیشنهاد می‌کنم درباره هزینه واقعی نگهداری خودرو برقی در ایران هم بنویسید.",
    date: "۶ مهر ۱۴۰۵",
    read: true,
    replied: true,
  },
];

export const mockNotifications: MockNotification[] = [
  { id: "n1", title: "پیام جدید", text: "امیر حسینی درباره شارژ خانگی پیام فرستاد", time: "۲ ساعت پیش", kind: "message" },
  { id: "n2", title: "کاربر جدید", text: "دنیا فرهادی ثبت‌نام کرد", time: "۵ ساعت پیش", kind: "user" },
  { id: "n3", title: "دیدگاه جدید", text: "روی مقاله «تفاوت شارژ AC و DC» دیدگاه ثبت شد", time: "دیروز", kind: "article" },
  { id: "n4", title: "یادآوری سیستم", text: "نسخه پشتیبان هفتگی با موفقیت ساخته شد", time: "۲ روز پیش", kind: "system" },
];

export const mockVisits: VisitPoint[] = [
  { label: "۲۸ شه", value: 820 },
  { label: "۲۹ شه", value: 940 },
  { label: "۳۰ شه", value: 760 },
  { label: "۳۱ شه", value: 1120 },
  { label: "۱ مهر", value: 1280 },
  { label: "۲ مهر", value: 990 },
  { label: "۳ مهر", value: 1340 },
  { label: "۴ مهر", value: 1520 },
  { label: "۵ مهر", value: 1210 },
  { label: "۶ مهر", value: 1430 },
  { label: "۷ مهر", value: 1680 },
  { label: "۸ مهر", value: 1590 },
  { label: "۹ مهر", value: 1820 },
  { label: "۱۰ مهر", value: 1740 },
];

export const defaultSettings: SiteSettings = {
  siteName: "ElectroCar",
  siteDesc: "مجله تخصصی خودروهای برقی؛ اخبار، مقالات، فناوری و معرفی خودروهای الکتریکی.",
  supportEmail: "support@electrocar.ir",
  allowComments: true,
  maintenance: false,
  notifyNewMessage: true,
};
