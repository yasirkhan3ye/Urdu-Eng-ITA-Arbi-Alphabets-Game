
import { AlphabetLetter, Level } from './types';

export const URDU_ALPHABET: AlphabetLetter[] = [
  { id: 'u_1', char: 'ا', name: 'Alif', exampleWord: 'انار', exampleImage: '', color: 'bg-red-400', language: 'Urdu' },
  { id: 'u_2', char: 'ب', name: 'Bay', exampleWord: 'بکری', exampleImage: '', color: 'bg-blue-400', language: 'Urdu' },
  { id: 'u_3', char: 'پ', name: 'Pay', exampleWord: 'پتنگ', exampleImage: '', color: 'bg-green-400', language: 'Urdu' },
  { id: 'u_4', char: 'ت', name: 'Tay', exampleWord: 'تتلی', exampleImage: '', color: 'bg-yellow-400', language: 'Urdu' },
  { id: 'u_5', char: 'ٹ', name: 'Te-tay', exampleWord: 'ٹماٹر', exampleImage: '', color: 'bg-orange-400', language: 'Urdu' },
  { id: 'u_6', char: 'ث', name: 'Say', exampleWord: 'ثمر', exampleImage: '', color: 'bg-purple-400', language: 'Urdu' },
  { id: 'u_7', char: 'ج', name: 'Jeem', exampleWord: 'جہاز', exampleImage: '', color: 'bg-pink-400', language: 'Urdu' },
  { id: 'u_8', char: 'چ', name: 'Chay', exampleWord: 'چڑیا', exampleImage: '', color: 'bg-teal-400', language: 'Urdu' },
  { id: 'u_9', char: 'ح', name: 'Hay', exampleWord: 'حلوہ', exampleImage: '', color: 'bg-amber-400', language: 'Urdu' },
  { id: 'u_10', char: 'خ', name: 'Khay', exampleWord: 'خرگوش', exampleImage: '', color: 'bg-indigo-400', language: 'Urdu' },
  { id: 'u_11', char: 'د', name: 'Daal', exampleWord: 'درخت', exampleImage: '', color: 'bg-emerald-400', language: 'Urdu' },
  { id: 'u_12', char: 'ڈ', name: 'De-daal', exampleWord: 'ڈول', exampleImage: '', color: 'bg-rose-400', language: 'Urdu' },
  { id: 'u_13', char: 'ذ', name: 'Zaal', exampleWord: 'ذخیرہ', exampleImage: '', color: 'bg-cyan-400', language: 'Urdu' },
  { id: 'u_14', char: 'ر', name: 'Ray', exampleWord: 'ریل', exampleImage: '', color: 'bg-violet-400', language: 'Urdu' },
  { id: 'u_15', char: 'ڑ', name: 'Re-ray', exampleWord: 'پہاڑ', exampleImage: '', color: 'bg-lime-400', language: 'Urdu' },
  { id: 'u_16', char: 'ز', name: 'Zay', exampleWord: 'زرافہ', exampleImage: '', color: 'bg-fuchsia-400', language: 'Urdu' },
  { id: 'u_17', char: 'ژ', name: 'Zhay', exampleWord: 'ژالہ', exampleImage: '', color: 'bg-sky-400', language: 'Urdu' },
  { id: 'u_18', char: 'س', name: 'Seen', exampleWord: 'سیب', exampleImage: '', color: 'bg-red-600', language: 'Urdu' },
  { id: 'u_19', char: 'ش', name: 'Sheen', exampleWord: 'شیر', exampleImage: '', color: 'bg-blue-600', language: 'Urdu' },
  { id: 'u_20', char: 'ص', name: 'Saad', exampleWord: 'صوفہ', exampleImage: '', color: 'bg-green-600', language: 'Urdu' },
  { id: 'u_21', char: 'ض', name: 'Zaad', exampleWord: 'ضعیف', exampleImage: '', color: 'bg-yellow-600', language: 'Urdu' },
  { id: 'u_22', char: 'ط', name: 'Toy', exampleWord: 'طوطا', exampleImage: '', color: 'bg-orange-600', language: 'Urdu' },
  { id: 'u_23', char: 'ظ', name: 'Zoy', exampleWord: 'ظروف', exampleImage: '', color: 'bg-purple-600', language: 'Urdu' },
  { id: 'u_24', char: 'ع', name: 'Ain', exampleWord: 'عینک', exampleImage: '', color: 'bg-pink-600', language: 'Urdu' },
  { id: 'u_25', char: 'غ', name: 'Ghain', exampleWord: 'غبارہ', exampleImage: '', color: 'bg-teal-600', language: 'Urdu' },
];

export const URDU_NUMBERS: AlphabetLetter[] = [
  { id: 'u_n0', char: '۰', name: 'Sifar', exampleWord: '', exampleImage: '', color: 'bg-slate-400', language: 'Urdu' },
  { id: 'u_n1', char: '۱', name: 'Ek', exampleWord: '', exampleImage: '', color: 'bg-red-400', language: 'Urdu' },
  { id: 'u_n2', char: '۲', name: 'Do', exampleWord: '', exampleImage: '', color: 'bg-blue-400', language: 'Urdu' },
  { id: 'u_n3', char: '۳', name: 'Teen', exampleWord: '', exampleImage: '', color: 'bg-green-400', language: 'Urdu' },
  { id: 'u_n4', char: '۴', name: 'Chaar', exampleWord: '', exampleImage: '', color: 'bg-yellow-400', language: 'Urdu' },
  { id: 'u_n5', char: '۵', name: 'Paanch', exampleWord: '', exampleImage: '', color: 'bg-orange-400', language: 'Urdu' },
  { id: 'u_n6', char: '۶', name: 'Chay', exampleWord: '', exampleImage: '', color: 'bg-purple-400', language: 'Urdu' },
  { id: 'u_n7', char: '۷', name: 'Saat', exampleWord: '', exampleImage: '', color: 'bg-pink-400', language: 'Urdu' },
  { id: 'u_n8', char: '۸', name: 'Aath', exampleWord: '', exampleImage: '', color: 'bg-teal-400', language: 'Urdu' },
  { id: 'u_n9', char: '۹', name: 'No', exampleWord: '', exampleImage: '', color: 'bg-amber-400', language: 'Urdu' },
];

export const ARABIC_ALPHABET: AlphabetLetter[] = [
  { id: 'a_1', char: 'ا', name: 'Alif', exampleWord: 'أسد', exampleImage: '', color: 'bg-emerald-500', language: 'Arabic' },
  { id: 'a_2', char: 'ب', name: 'Baa', exampleWord: 'باب', exampleImage: '', color: 'bg-rose-500', language: 'Arabic' },
  { id: 'a_3', char: 'ت', name: 'Taa', exampleWord: 'تفاح', exampleImage: '', color: 'bg-cyan-500', language: 'Arabic' },
  { id: 'a_4', char: 'ث', name: 'Thaa', exampleWord: 'ثعلب', exampleImage: '', color: 'bg-violet-500', language: 'Arabic' },
  { id: 'a_5', char: 'ج', name: 'Jeem', exampleWord: 'جمل', exampleImage: '', color: 'bg-lime-500', language: 'Arabic' },
  { id: 'a_6', char: 'ح', name: 'Haa', exampleWord: 'حصان', exampleImage: '', color: 'bg-fuchsia-500', language: 'Arabic' },
  { id: 'a_7', char: 'خ', name: 'Khaa', exampleWord: 'خروف', exampleImage: '', color: 'bg-sky-500', language: 'Arabic' },
  { id: 'a_8', char: 'د', name: 'Daal', exampleWord: 'ديك', exampleImage: '', color: 'bg-red-600', language: 'Arabic' },
  { id: 'a_9', char: 'ذ', name: 'Dhaal', exampleWord: 'ذرة', exampleImage: '', color: 'bg-blue-600', language: 'Arabic' },
  { id: 'a_10', char: 'ر', name: 'Raa', exampleWord: 'رمان', exampleImage: '', color: 'bg-green-600', language: 'Arabic' },
  { id: 'a_11', char: 'ز', name: 'Zay', exampleWord: 'زرافة', exampleImage: '', color: 'bg-yellow-600', language: 'Arabic' },
  { id: 'a_12', char: 'س', name: 'Seen', exampleWord: 'سمكة', exampleImage: '', color: 'bg-orange-600', language: 'Arabic' },
  { id: 'a_13', char: 'ش', name: 'Sheen', exampleWord: 'شمس', exampleImage: '', color: 'bg-purple-600', language: 'Arabic' },
  { id: 'a_14', char: 'ص', name: 'Saad', exampleWord: 'صقر', exampleImage: '', color: 'bg-pink-600', language: 'Arabic' },
  { id: 'a_15', char: 'ض', name: 'Daad', exampleWord: 'ضفدع', exampleImage: '', color: 'bg-teal-600', language: 'Arabic' },
  { id: 'a_16', char: 'ط', name: 'Taa', exampleWord: 'طائرة', exampleImage: '', color: 'bg-amber-600', language: 'Arabic' },
  { id: 'a_17', char: 'ظ', name: 'Zaa', exampleWord: 'ظرف', exampleImage: '', color: 'bg-indigo-600', language: 'Arabic' },
  { id: 'a_18', char: 'ع', name: 'Ain', exampleWord: 'عين', exampleImage: '', color: 'bg-emerald-600', language: 'Arabic' },
  { id: 'a_19', char: 'غ', name: 'Ghain', exampleWord: 'غزال', exampleImage: '', color: 'bg-rose-600', language: 'Arabic' },
  { id: 'a_20', char: 'ف', name: 'Faa', exampleWord: 'فيل', exampleImage: '', color: 'bg-cyan-600', language: 'Arabic' },
  { id: 'a_21', char: 'ق', name: 'Qaaf', exampleWord: 'قلم', exampleImage: '', color: 'bg-violet-600', language: 'Arabic' },
  { id: 'a_22', char: 'ك', name: 'Kaaf', exampleWord: 'كتاب', exampleImage: '', color: 'bg-lime-600', language: 'Arabic' },
  { id: 'a_23', char: 'ل', name: 'Laam', exampleWord: 'ليمون', exampleImage: '', color: 'bg-fuchsia-600', language: 'Arabic' },
  { id: 'a_24', char: 'م', name: 'Meem', exampleWord: 'موز', exampleImage: '', color: 'bg-sky-600', language: 'Arabic' },
  { id: 'a_25', char: 'ن', name: 'Noon', exampleWord: 'نحلة', exampleImage: '', color: 'bg-red-500', language: 'Arabic' },
  { id: 'a_26', char: 'هـ', name: 'Haa', exampleWord: 'هلال', exampleImage: '', color: 'bg-blue-500', language: 'Arabic' },
  { id: 'a_27', char: 'و', name: 'Waw', exampleWord: 'وردة', exampleImage: '', color: 'bg-green-500', language: 'Arabic' },
  { id: 'a_28', char: 'ي', name: 'Yaa', exampleWord: 'يد', exampleImage: '', color: 'bg-yellow-500', language: 'Arabic' },
];

export const ARABIC_NUMBERS: AlphabetLetter[] = [
  { id: 'a_n0', char: '٠', name: 'Sifr', exampleWord: '', exampleImage: '', color: 'bg-slate-400', language: 'Arabic' },
  { id: 'a_n1', char: '١', name: 'Wahid', exampleWord: '', exampleImage: '', color: 'bg-red-400', language: 'Arabic' },
  { id: 'a_n2', char: '٢', name: 'Ithnan', exampleWord: '', exampleImage: '', color: 'bg-blue-400', language: 'Arabic' },
  { id: 'a_n3', char: '٣', name: 'Thalatha', exampleWord: '', exampleImage: '', color: 'bg-green-400', language: 'Arabic' },
  { id: 'a_n4', char: '٤', name: 'Arba\'a', exampleWord: '', exampleImage: '', color: 'bg-yellow-400', language: 'Arabic' },
  { id: 'a_n5', char: '٥', name: 'Khamsa', exampleWord: '', exampleImage: '', color: 'bg-orange-400', language: 'Arabic' },
  { id: 'a_n6', char: '٦', name: 'Sitta', exampleWord: '', exampleImage: '', color: 'bg-purple-400', language: 'Arabic' },
  { id: 'a_n7', char: '٧', name: 'Sab\'a', exampleWord: '', exampleImage: '', color: 'bg-pink-400', language: 'Arabic' },
  { id: 'a_n8', char: '٨', name: 'Thamaniya', exampleWord: '', exampleImage: '', color: 'bg-teal-400', language: 'Arabic' },
  { id: 'a_n9', char: '٩', name: 'Tis\'a', exampleWord: '', exampleImage: '', color: 'bg-amber-400', language: 'Arabic' },
];

export const PASHTO_ALPHABET: AlphabetLetter[] = [
  { id: 'p_1', char: 'ا', name: 'Alif', exampleWord: 'اس', exampleImage: '', color: 'bg-red-400', language: 'Pashto' },
  { id: 'p_2', char: 'ب', name: 'Baa', exampleWord: 'بزه', exampleImage: '', color: 'bg-blue-400', language: 'Pashto' },
  { id: 'p_3', char: 'پ', name: 'Paa', exampleWord: 'پیل', exampleImage: '', color: 'bg-green-400', language: 'Pashto' },
  { id: 'p_4', char: 'ت', name: 'Taa', exampleWord: 'توتکۍ', exampleImage: '', color: 'bg-yellow-400', language: 'Pashto' },
  { id: 'p_5', char: 'ټ', name: 'Ttaa', exampleWord: 'ټوکرۍ', exampleImage: '', color: 'bg-orange-400', language: 'Pashto' },
  { id: 'p_6', char: 'ث', name: 'Saa', exampleWord: 'ثواب', exampleImage: '', color: 'bg-purple-400', language: 'Pashto' },
  { id: 'p_7', char: 'ج', name: 'Jeem', exampleWord: 'جواري', exampleImage: '', color: 'bg-pink-400', language: 'Pashto' },
  { id: 'p_8', char: 'چ', name: 'Chee', exampleWord: 'چرګ', exampleImage: '', color: 'bg-teal-400', language: 'Pashto' },
  { id: 'p_9', char: 'څ', name: 'Tsee', exampleWord: 'څادر', exampleImage: '', color: 'bg-amber-400', language: 'Pashto' },
  { id: 'p_10', char: 'ځ', name: 'Dzee', exampleWord: 'ځاى', exampleImage: '', color: 'bg-indigo-400', language: 'Pashto' },
  { id: 'p_11', char: 'ح', name: 'Haa', exampleWord: 'حلوه', exampleImage: '', color: 'bg-emerald-400', language: 'Pashto' },
  { id: 'p_12', char: 'خ', name: 'Khaa', exampleWord: 'خټکى', exampleImage: '', color: 'bg-rose-400', language: 'Pashto' },
  { id: 'p_13', char: 'د', name: 'Daal', exampleWord: 'دوغ', exampleImage: '', color: 'bg-cyan-400', language: 'Pashto' },
  { id: 'p_14', char: 'ډ', name: 'Ddaal', exampleWord: 'ډل', exampleImage: '', color: 'bg-violet-400', language: 'Pashto' },
  { id: 'p_15', char: 'ذ', name: 'Zaal', exampleWord: 'ذخیره', exampleImage: '', color: 'bg-lime-400', language: 'Pashto' },
  { id: 'p_16', char: 'ر', name: 'Raa', exampleWord: 'ریل', exampleImage: '', color: 'bg-fuchsia-400', language: 'Pashto' },
  { id: 'p_17', char: 'ړ', name: 'Rre', exampleWord: 'غړدی', exampleImage: '', color: 'bg-sky-400', language: 'Pashto' },
  { id: 'p_18', char: 'ز', name: 'Zay', exampleWord: 'زرافه', exampleImage: '', color: 'bg-red-500', language: 'Pashto' },
  { id: 'p_19', char: 'ژ', name: 'Zhe', exampleWord: 'ژاله', exampleImage: '', color: 'bg-blue-500', language: 'Pashto' },
  { id: 'p_20', char: 'ږ', name: 'Gzhe', exampleWord: 'موږک', exampleImage: '', color: 'bg-green-500', language: 'Pashto' },
  { id: 'p_21', char: 'س', name: 'Seen', exampleWord: 'سیب', exampleImage: '', color: 'bg-yellow-500', language: 'Pashto' },
  { id: 'p_22', char: 'ش', name: 'Sheen', exampleWord: 'شیدې', exampleImage: '', color: 'bg-orange-500', language: 'Pashto' },
  { id: 'p_23', char: 'ښ', name: 'Xhin', exampleWord: 'ښوونځی', exampleImage: '', color: 'bg-purple-500', language: 'Pashto' },
  { id: 'p_24', char: 'ص', name: 'Saad', exampleWord: 'صندوق', exampleImage: '', color: 'bg-pink-500', language: 'Pashto' },
  { id: 'p_25', char: 'ض', name: 'Zaad', exampleWord: 'ضعیف', exampleImage: '', color: 'bg-teal-500', language: 'Pashto' },
  { id: 'p_26', char: 'ط', name: 'Toe', exampleWord: 'طوطا', exampleImage: '', color: 'bg-amber-500', language: 'Pashto' },
  { id: 'p_27', char: 'ظ', name: 'Zoe', exampleWord: 'ظروف', exampleImage: '', color: 'bg-indigo-500', language: 'Pashto' },
  { id: 'p_28', char: 'ع', name: 'Ain', exampleWord: 'عینک', exampleImage: '', color: 'bg-emerald-500', language: 'Pashto' },
  { id: 'p_29', char: 'غ', name: 'Ghain', exampleWord: 'غوا', exampleImage: '', color: 'bg-rose-500', language: 'Pashto' },
  { id: 'p_30', char: 'ف', name: 'Fe', exampleWord: 'فیل', exampleImage: '', color: 'bg-cyan-500', language: 'Pashto' },
  { id: 'p_31', char: 'ق', name: 'Qaf', exampleWord: 'قلم', exampleImage: '', color: 'bg-violet-500', language: 'Pashto' },
  { id: 'p_32', char: 'ک', name: 'Kaf', exampleWord: 'کتاب', exampleImage: '', color: 'bg-lime-500', language: 'Pashto' },
  { id: 'p_33', char: 'ګ', name: 'Gaf', exampleWord: 'ګل', exampleImage: '', color: 'bg-fuchsia-500', language: 'Pashto' },
  { id: 'p_34', char: 'ل', name: 'Lam', exampleWord: 'لوند', exampleImage: '', color: 'bg-sky-500', language: 'Pashto' },
  { id: 'p_35', char: 'م', name: 'Mim', exampleWord: 'مڼه', exampleImage: '', color: 'bg-red-600', language: 'Pashto' },
  { id: 'p_36', char: 'ن', name: 'Nun', exampleWord: 'نمر', exampleImage: '', color: 'bg-blue-600', language: 'Pashto' },
  { id: 'p_37', char: 'ڼ', name: 'Nrun', exampleWord: 'ګاڼه', exampleImage: '', color: 'bg-green-600', language: 'Pashto' },
  { id: 'p_38', char: 'و', name: 'Waw', exampleWord: 'ورځ', exampleImage: '', color: 'bg-yellow-600', language: 'Pashto' },
  { id: 'p_39', char: 'ه', name: 'He', exampleWord: 'هګۍ', exampleImage: '', color: 'bg-orange-600', language: 'Pashto' },
  { id: 'p_40', char: 'ی', name: 'Ye', exampleWord: 'یخ', exampleImage: '', color: 'bg-purple-600', language: 'Pashto' },
];

export const PASHTO_NUMBERS: AlphabetLetter[] = [
  { id: 'p_n0', char: '۰', name: 'Sifar', exampleWord: '', exampleImage: '', color: 'bg-slate-400', language: 'Pashto' },
  { id: 'p_n1', char: '۱', name: 'Yaw', exampleWord: '', exampleImage: '', color: 'bg-red-400', language: 'Pashto' },
  { id: 'p_n2', char: '۲', name: 'Dwa', exampleWord: '', exampleImage: '', color: 'bg-blue-400', language: 'Pashto' },
  { id: 'p_n3', char: '۳', name: 'Dre', exampleWord: '', exampleImage: '', color: 'bg-green-400', language: 'Pashto' },
  { id: 'p_n4', char: '۴', name: 'Salor', exampleWord: '', exampleImage: '', color: 'bg-yellow-400', language: 'Pashto' },
  { id: 'p_n5', char: '۵', name: 'Pinza', exampleWord: '', exampleImage: '', color: 'bg-orange-400', language: 'Pashto' },
  { id: 'p_n6', char: '۶', name: 'Shpag', exampleWord: '', exampleImage: '', color: 'bg-purple-400', language: 'Pashto' },
  { id: 'p_n7', char: '۷', name: 'Owa', exampleWord: '', exampleImage: '', color: 'bg-pink-400', language: 'Pashto' },
  { id: 'p_n8', char: '۸', name: 'Ata', exampleWord: '', exampleImage: '', color: 'bg-teal-400', language: 'Pashto' },
  { id: 'p_n9', char: '۹', name: 'Naha', exampleWord: '', exampleImage: '', color: 'bg-amber-400', language: 'Pashto' },
];

const ENGLISH_WORDS = [
  'Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish', 'Giraffe', 'Horse', 'Igloo', 'Jellyfish',
  'Kangaroo', 'Lion', 'Monkey', 'Nest', 'Owl', 'Penguin', 'Queen', 'Rabbit', 'Snake', 'Tiger',
  'Umbrella', 'Vase', 'Whale', 'Xylophone', 'Yacht', 'Zebra'
];

export const ENGLISH_ALPHABET: AlphabetLetter[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c, i) => ({
  id: `e_${i}`, char: c, name: c, exampleWord: ENGLISH_WORDS[i], exampleImage: '', color: `bg-${['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal', 'amber', 'indigo', 'emerald', 'rose', 'cyan', 'violet', 'lime', 'fuchsia', 'sky', 'emerald', 'rose', 'cyan', 'violet', 'lime', 'fuchsia', 'sky', 'red', 'blue', 'green'][i % 26]}-${[400, 500, 600][i % 3]}`, language: 'English'
}));

export const ENGLISH_NUMBERS: AlphabetLetter[] = '0123456789'.split('').map((c, i) => ({
  id: `e_n${i}`, char: c, name: c, exampleWord: '', exampleImage: '', color: `bg-${['slate', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal', 'amber'][i % 10]}-400`, language: 'English'
}));

export const ITALIAN_ALPHABET: AlphabetLetter[] = [
  { id: 'i_1', char: 'A', name: 'A', exampleWord: 'Arancia', exampleImage: '', color: 'bg-red-400', language: 'Italian' },
  { id: 'i_2', char: 'B', name: 'B', exampleWord: 'Banana', exampleImage: '', color: 'bg-blue-400', language: 'Italian' },
  { id: 'i_3', char: 'C', name: 'C', exampleWord: 'Cane', exampleImage: '', color: 'bg-green-400', language: 'Italian' },
  { id: 'i_4', char: 'D', name: 'D', exampleWord: 'Delfino', exampleImage: '', color: 'bg-yellow-400', language: 'Italian' },
  { id: 'i_5', char: 'E', name: 'E', exampleWord: 'Elefante', exampleImage: '', color: 'bg-orange-400', language: 'Italian' },
  { id: 'i_6', char: 'F', name: 'F', exampleWord: 'Fiore', exampleImage: '', color: 'bg-purple-400', language: 'Italian' },
  { id: 'i_7', char: 'G', name: 'G', exampleWord: 'Gatto', exampleImage: '', color: 'bg-pink-400', language: 'Italian' },
  { id: 'i_8', char: 'H', name: 'Acca', exampleWord: 'Hotel', exampleImage: '', color: 'bg-teal-400', language: 'Italian' },
  { id: 'i_9', char: 'I', name: 'I', exampleWord: 'Isola', exampleImage: '', color: 'bg-amber-400', language: 'Italian' },
  { id: 'i_10', char: 'L', name: 'Elle', exampleWord: 'Leone', exampleImage: '', color: 'bg-indigo-400', language: 'Italian' },
  { id: 'i_11', char: 'M', name: 'Emme', exampleWord: 'Mela', exampleImage: '', color: 'bg-emerald-400', language: 'Italian' },
  { id: 'i_12', char: 'N', name: 'Enne', exampleWord: 'Nave', exampleImage: '', color: 'bg-rose-400', language: 'Italian' },
  { id: 'i_13', char: 'O', name: 'O', exampleWord: 'Orso', exampleImage: '', color: 'bg-cyan-400', language: 'Italian' },
  { id: 'i_14', char: 'P', name: 'P', exampleWord: 'Pesce', exampleImage: '', color: 'bg-violet-400', language: 'Italian' },
  { id: 'i_15', char: 'Q', name: 'Qu', exampleWord: 'Quadro', exampleImage: '', color: 'bg-lime-400', language: 'Italian' },
  { id: 'i_16', char: 'R', name: 'Erre', exampleWord: 'Rana', exampleImage: '', color: 'bg-fuchsia-400', language: 'Italian' },
  { id: 'i_17', char: 'S', name: 'Esse', exampleWord: 'Sole', exampleImage: '', color: 'bg-sky-400', language: 'Italian' },
  { id: 'i_18', char: 'T', name: 'T', exampleWord: 'Tartaruga', exampleImage: '', color: 'bg-red-600', language: 'Italian' },
  { id: 'i_19', char: 'U', name: 'U', exampleWord: 'Uccello', exampleImage: '', color: 'bg-blue-600', language: 'Italian' },
  { id: 'i_20', char: 'V', name: 'Vu', exampleWord: 'Volpe', exampleImage: '', color: 'bg-green-600', language: 'Italian' },
  { id: 'i_21', char: 'Z', name: 'Zeta', exampleWord: 'Zebra', exampleImage: '', color: 'bg-yellow-600', language: 'Italian' },
];

export const ITALIAN_NUMBERS: AlphabetLetter[] = '0123456789'.split('').map((c, i) => ({
  id: `i_n${i}`, char: c, name: ['Zero', 'Uno', 'Due', 'Tre', 'Quattro', 'Cinque', 'Sei', 'Sette', 'Otto', 'Nove'][i], exampleWord: '', exampleImage: '', color: `bg-${['slate', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal', 'amber'][i % 10]}-400`, language: 'Italian'
}));

export const GERMAN_ALPHABET: AlphabetLetter[] = [
  { id: 'g_1', char: 'A', name: 'Ah', exampleWord: 'Apfel', exampleImage: '', color: 'bg-red-400', language: 'German' },
  { id: 'g_2', char: 'B', name: 'Beh', exampleWord: 'Ball', exampleImage: '', color: 'bg-blue-400', language: 'German' },
  { id: 'g_3', char: 'C', name: 'Ceh', exampleWord: 'Clown', exampleImage: '', color: 'bg-green-400', language: 'German' },
  { id: 'g_4', char: 'D', name: 'Deh', exampleWord: 'Drache', exampleImage: '', color: 'bg-yellow-400', language: 'German' },
  { id: 'g_5', char: 'E', name: 'Eh', exampleWord: 'Elefant', exampleImage: '', color: 'bg-orange-400', language: 'German' },
  { id: 'g_6', char: 'F', name: 'Eff', exampleWord: 'Fisch', exampleImage: '', color: 'bg-purple-400', language: 'German' },
  { id: 'g_7', char: 'G', name: 'Geh', exampleWord: 'Giraffe', exampleImage: '', color: 'bg-pink-400', language: 'German' },
  { id: 'g_8', char: 'H', name: 'Hah', exampleWord: 'Haus', exampleImage: '', color: 'bg-teal-400', language: 'German' },
  { id: 'g_9', char: 'I', name: 'Ih', exampleWord: 'Igel', exampleImage: '', color: 'bg-amber-400', language: 'German' },
  { id: 'g_10', char: 'J', name: 'Jott', exampleWord: 'Jacke', exampleImage: '', color: 'bg-indigo-400', language: 'German' },
  { id: 'g_11', char: 'K', name: 'Kah', exampleWord: 'Katze', exampleImage: '', color: 'bg-emerald-400', language: 'German' },
  { id: 'g_12', char: 'L', name: 'Ell', exampleWord: 'Löwe', exampleImage: '', color: 'bg-rose-400', language: 'German' },
  { id: 'g_13', char: 'M', name: 'Emm', exampleWord: 'Maus', exampleImage: '', color: 'bg-cyan-400', language: 'German' },
  { id: 'g_14', char: 'N', name: 'Enn', exampleWord: 'Nase', exampleImage: '', color: 'bg-violet-400', language: 'German' },
  { id: 'g_15', char: 'O', name: 'Oh', exampleWord: 'Orange', exampleImage: '', color: 'bg-lime-400', language: 'German' },
  { id: 'g_16', char: 'P', name: 'Peh', exampleWord: 'Pinguin', exampleImage: '', color: 'bg-fuchsia-400', language: 'German' },
  { id: 'g_17', char: 'Q', name: 'Kuh', exampleWord: 'Qualle', exampleImage: '', color: 'bg-sky-400', language: 'German' },
  { id: 'g_18', char: 'R', name: 'Err', exampleWord: 'Regenbogen', exampleImage: '', color: 'bg-red-600', language: 'German' },
  { id: 'g_19', char: 'S', name: 'Ess', exampleWord: 'Sonne', exampleImage: '', color: 'bg-blue-600', language: 'German' },
  { id: 'g_20', char: 'T', name: 'Teh', exampleWord: 'Tiger', exampleImage: '', color: 'bg-green-600', language: 'German' },
  { id: 'g_21', char: 'U', name: 'Uh', exampleWord: 'Uhr', exampleImage: '', color: 'bg-yellow-600', language: 'German' },
  { id: 'g_22', char: 'V', name: 'Vau', exampleWord: 'Vogel', exampleImage: '', color: 'bg-orange-600', language: 'German' },
  { id: 'g_23', char: 'W', name: 'Weh', exampleWord: 'Wal', exampleImage: '', color: 'bg-purple-600', language: 'German' },
  { id: 'g_24', char: 'X', name: 'Ix', exampleWord: 'Xylophon', exampleImage: '', color: 'bg-pink-600', language: 'German' },
  { id: 'g_25', char: 'Y', name: 'Ypsilon', exampleWord: 'Yacht', exampleImage: '', color: 'bg-teal-600', language: 'German' },
  { id: 'g_26', char: 'Z', name: 'Zett', exampleWord: 'Zebra', exampleImage: '', color: 'bg-amber-600', language: 'German' },
];

export const GERMAN_NUMBERS: AlphabetLetter[] = '0123456789'.split('').map((c, i) => ({
  id: `g_n${i}`, char: c, name: ['Null', 'Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun'][i], exampleWord: '', exampleImage: '', color: `bg-${['slate', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal', 'amber'][i % 10]}-400`, language: 'German'
}));

export const ALL_ALPHABET: AlphabetLetter[] = [
  ...URDU_ALPHABET, 
  ...URDU_NUMBERS,
  ...ARABIC_ALPHABET,
  ...ARABIC_NUMBERS,
  ...ENGLISH_ALPHABET,
  ...ENGLISH_NUMBERS,
  ...ITALIAN_ALPHABET,
  ...ITALIAN_NUMBERS,
  ...PASHTO_ALPHABET,
  ...PASHTO_NUMBERS,
  ...GERMAN_ALPHABET,
  ...GERMAN_NUMBERS,
];

const generateLevelLetters = (alphabet: AlphabetLetter[], count: number) => {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(alphabet[i % alphabet.length].id);
  }
  return ids;
};

const createLevels = (lang: string, alphabet: AlphabetLetter[], numbers: AlphabetLetter[], prefix: number): Level[] => {
  const alphabetLevels: Level[] = [2, 3, 4, 5, 6, 7, 8, 9].map((size, i) => ({
    id: prefix + i,
    name: `${lang} ${i + 1}: ${size}x${size} Fun`,
    letters: generateLevelLetters(alphabet, size * size - 2),
    gridSize: size,
    difficulty: size < 4 ? 'easy' : size < 7 ? 'medium' : 'hard',
    language: lang as any
  }));

  const numberLevel: Level = {
    id: prefix + 50, // Distinct ID for numbers
    name: `${lang} Numbers: 3x3 Challenge`,
    letters: numbers.map(n => n.id).slice(0, 7), // 7 numbers for 3x3 (9 slots - 2 empty)
    gridSize: 3,
    difficulty: 'easy',
    language: lang as any
  };

  const numberLevelHard: Level = {
    id: prefix + 51,
    name: `${lang} Numbers: 4x4 Master`,
    letters: [...numbers.map(n => n.id), ...numbers.map(n => n.id)].slice(0, 14), // 14 numbers for 4x4
    gridSize: 4,
    difficulty: 'medium',
    language: lang as any
  };

  return [...alphabetLevels, numberLevel, numberLevelHard];
};

export const URDU_LEVELS: Level[] = createLevels('Urdu', URDU_ALPHABET, URDU_NUMBERS, 1);
export const ARABIC_LEVELS: Level[] = createLevels('Arabic', ARABIC_ALPHABET, ARABIC_NUMBERS, 101);
export const ENGLISH_LEVELS: Level[] = createLevels('English', ENGLISH_ALPHABET, ENGLISH_NUMBERS, 201);
export const ITALIAN_LEVELS: Level[] = createLevels('Italian', ITALIAN_ALPHABET, ITALIAN_NUMBERS, 301);
export const PASHTO_LEVELS: Level[] = createLevels('Pashto', PASHTO_ALPHABET, PASHTO_NUMBERS, 401);
export const GERMAN_LEVELS: Level[] = createLevels('German', GERMAN_ALPHABET, GERMAN_NUMBERS, 501);

export const ALL_LEVELS: Level[] = [...URDU_LEVELS, ...ARABIC_LEVELS, ...ENGLISH_LEVELS, ...ITALIAN_LEVELS, ...PASHTO_LEVELS, ...GERMAN_LEVELS];
