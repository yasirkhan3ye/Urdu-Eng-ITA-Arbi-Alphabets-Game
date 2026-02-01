
import { AlphabetLetter, Level } from './types';

export const URDU_ALPHABET: AlphabetLetter[] = [
  { id: 'u_1', char: 'ا', name: 'Alif', exampleWord: 'انار', exampleImage: '', color: 'bg-red-400', language: 'Urdu' },
  { id: 'u_2', char: 'ب', name: 'Bay', exampleWord: 'بکری', exampleImage: '', color: 'bg-blue-400', language: 'Urdu' },
  { id: 'u_3', char: 'پ', name: 'Pay', exampleWord: 'پنکھا', exampleImage: '', color: 'bg-green-400', language: 'Urdu' },
  { id: 'u_4', char: 'ت', name: 'Tay', exampleWord: 'تتلی', exampleImage: '', color: 'bg-yellow-400', language: 'Urdu' },
  { id: 'u_5', char: 'ٹ', name: 'Ttay', exampleWord: 'ٹماٹر', exampleImage: '', color: 'bg-orange-400', language: 'Urdu' },
  { id: 'u_6', char: 'ث', name: 'Say', exampleWord: 'ثمر', exampleImage: '', color: 'bg-purple-400', language: 'Urdu' },
  { id: 'u_7', char: 'ج', name: 'Jeem', exampleWord: 'جہاز', exampleImage: '', color: 'bg-pink-400', language: 'Urdu' },
  { id: 'u_8', char: 'چ', name: 'Chay', exampleWord: 'چڑیا', exampleImage: '', color: 'bg-teal-400', language: 'Urdu' },
  { id: 'u_9', char: 'ح', name: 'Hay', exampleWord: 'حلوہ', exampleImage: '', color: 'bg-amber-400', language: 'Urdu' },
  { id: 'u_10', char: 'خ', name: 'Khay', exampleWord: 'خرگوش', exampleImage: '', color: 'bg-indigo-400', language: 'Urdu' },
  { id: 'u_11', char: 'د', name: 'Daal', exampleWord: 'درخت', exampleImage: '', color: 'bg-emerald-400', language: 'Urdu' },
  { id: 'u_12', char: 'ڈ', name: 'Ddaal', exampleWord: 'ڈول', exampleImage: '', color: 'bg-rose-400', language: 'Urdu' },
  { id: 'u_13', char: 'ذ', name: 'Zaal', exampleWord: 'ذخیرہ', exampleImage: '', color: 'bg-cyan-400', language: 'Urdu' },
  { id: 'u_14', char: 'ر', name: 'Ray', exampleWord: 'ریل', exampleImage: '', color: 'bg-violet-400', language: 'Urdu' },
  { id: 'u_15', char: 'ڑ', name: 'Rray', exampleWord: 'پہاڑ', exampleImage: '', color: 'bg-lime-400', language: 'Urdu' },
  { id: 'u_16', char: 'ز', name: 'Zay', exampleWord: 'زرافہ', exampleImage: '', color: 'bg-fuchsia-400', language: 'Urdu' },
  { id: 'u_17', char: 'ژ', name: 'Zhay', exampleWord: 'ژالہ', exampleImage: '', color: 'bg-sky-400', language: 'Urdu' },
  { id: 'u_18', char: 'س', name: 'Seen', exampleWord: 'سیب', exampleImage: '', color: 'bg-red-500', language: 'Urdu' },
  { id: 'u_19', char: 'ش', name: 'Sheen', exampleWord: 'شیر', exampleImage: '', color: 'bg-yellow-500', language: 'Urdu' },
  { id: 'u_20', char: 'ص', name: 'Saad', exampleWord: 'صوفہ', exampleImage: '', color: 'bg-blue-500', language: 'Urdu' },
  { id: 'u_21', char: 'ض', name: 'Zaad', exampleWord: 'ضعیف', exampleImage: '', color: 'bg-green-500', language: 'Urdu' },
  { id: 'u_22', char: 'ط', name: 'Toy', exampleWord: 'طوطا', exampleImage: '', color: 'bg-orange-500', language: 'Urdu' },
  { id: 'u_23', char: 'ظ', name: 'Zoy', exampleWord: 'ظروف', exampleImage: '', color: 'bg-teal-500', language: 'Urdu' },
  { id: 'u_24', char: 'ع', name: 'Ain', exampleWord: 'عینک', exampleImage: '', color: 'bg-purple-500', language: 'Urdu' },
  { id: 'u_25', char: 'غ', name: 'Ghain', exampleWord: 'غبارہ', exampleImage: '', color: 'bg-pink-500', language: 'Urdu' },
];

export const ARABIC_ALPHABET: AlphabetLetter[] = [
  { id: 'a_1', char: 'ا', name: 'Alif', exampleWord: 'أسد', exampleImage: '', color: 'bg-red-500', language: 'Arabic' },
  { id: 'a_2', char: 'ب', name: 'Baa', exampleWord: 'باب', exampleImage: '', color: 'bg-blue-500', language: 'Arabic' },
  { id: 'a_3', char: 'ت', name: 'Taa', exampleWord: 'تفاح', exampleImage: '', color: 'bg-green-500', language: 'Arabic' },
  { id: 'a_4', char: 'ث', name: 'Thaa', exampleWord: 'ثعلب', exampleImage: '', color: 'bg-yellow-500', language: 'Arabic' },
  { id: 'a_5', char: 'ج', name: 'Jeem', exampleWord: 'جمل', exampleImage: '', color: 'bg-orange-500', language: 'Arabic' },
  { id: 'a_6', char: 'ح', name: 'Haa', exampleWord: 'حصان', exampleImage: '', color: 'bg-purple-500', language: 'Arabic' },
  { id: 'a_7', char: 'خ', name: 'Khaa', exampleWord: 'خروف', exampleImage: '', color: 'bg-pink-500', language: 'Arabic' },
  { id: 'a_8', char: 'د', name: 'Daal', exampleWord: 'ديك', exampleImage: '', color: 'bg-teal-500', language: 'Arabic' },
  { id: 'a_9', char: 'ذ', name: 'Dhaal', exampleWord: 'ذرة', exampleImage: '', color: 'bg-amber-500', language: 'Arabic' },
  { id: 'a_10', char: 'ر', name: 'Raa', exampleWord: 'رمان', exampleImage: '', color: 'bg-indigo-500', language: 'Arabic' },
  { id: 'a_11', char: 'ز', name: 'Zay', exampleWord: 'زرافة', exampleImage: '', color: 'bg-emerald-500', language: 'Arabic' },
  { id: 'a_12', char: 'س', name: 'Seen', exampleWord: 'سمكة', exampleImage: '', color: 'bg-rose-500', language: 'Arabic' },
  { id: 'a_13', char: 'ش', name: 'Sheen', exampleWord: 'شمس', exampleImage: '', color: 'bg-cyan-500', language: 'Arabic' },
  { id: 'a_14', char: 'ص', name: 'Saad', exampleWord: 'صقر', exampleImage: '', color: 'bg-violet-500', language: 'Arabic' },
  { id: 'a_15', char: 'ض', name: 'Daad', exampleWord: 'ضفدع', exampleImage: '', color: 'bg-lime-500', language: 'Arabic' },
  { id: 'a_16', char: 'ط', name: 'Taa', exampleWord: 'طائرة', exampleImage: '', color: 'bg-fuchsia-500', language: 'Arabic' },
  { id: 'a_17', char: 'ظ', name: 'Zaa', exampleWord: 'ظرف', exampleImage: '', color: 'bg-sky-500', language: 'Arabic' },
  { id: 'a_18', char: 'ع', name: 'Ain', exampleWord: 'عين', exampleImage: '', color: 'bg-red-600', language: 'Arabic' },
];

export const PASHTO_ALPHABET: AlphabetLetter[] = [
  { id: 'p_1', char: 'ا', name: 'Alif', exampleWord: 'اس (Horse)', exampleImage: '', color: 'bg-orange-500', language: 'Pashto' },
  { id: 'p_2', char: 'ب', name: 'Baa', exampleWord: 'بزه (Goat)', exampleImage: '', color: 'bg-amber-600', language: 'Pashto' },
  { id: 'p_3', char: 'پ', name: 'Paa', exampleWord: 'پیل (Elephant)', exampleImage: '', color: 'bg-emerald-500', language: 'Pashto' },
  { id: 'p_4', char: 'ت', name: 'Taa', exampleWord: 'توتکۍ (Swallow)', exampleImage: '', color: 'bg-yellow-500', language: 'Pashto' },
  { id: 'p_5', char: 'ټ', name: 'Ttaa', exampleWord: 'ټوکرۍ (Basket)', exampleImage: '', color: 'bg-orange-600', language: 'Pashto' },
  { id: 'p_6', char: 'ث', name: 'Saa', exampleWord: 'ثواب (Reward)', exampleImage: '', color: 'bg-purple-500', language: 'Pashto' },
  { id: 'p_7', char: 'ج', name: 'Jeem', exampleWord: 'جواري (Corn)', exampleImage: '', color: 'bg-yellow-600', language: 'Pashto' },
  { id: 'p_8', char: 'چ', name: 'Chee', exampleWord: 'چرګ (Rooster)', exampleImage: '', color: 'bg-red-600', language: 'Pashto' },
  { id: 'p_9', char: 'څ', name: 'Tsee', exampleWord: 'څادر (Shawl)', exampleImage: '', color: 'bg-orange-400', language: 'Pashto' },
  { id: 'p_10', char: 'ځ', name: 'Dzee', exampleWord: 'ځاى (Place)', exampleImage: '', color: 'bg-indigo-500', language: 'Pashto' },
  { id: 'p_11', char: 'ح', name: 'Haa', exampleWord: 'حلوه (Sweet)', exampleImage: '', color: 'bg-amber-400', language: 'Pashto' },
  { id: 'p_12', char: 'خ', name: 'Khaa', exampleWord: 'خټکى (Melon)', exampleImage: '', color: 'bg-lime-500', language: 'Pashto' },
  { id: 'p_13', char: 'د', name: 'Daal', exampleWord: 'دوغ (Yogurt)', exampleImage: '', color: 'bg-sky-500', language: 'Pashto' },
  { id: 'p_14', char: 'ډ', name: 'Ddaal', exampleWord: 'ډل (Group)', exampleImage: '', color: 'bg-red-400', language: 'Pashto' },
  { id: 'p_15', char: 'ذ', name: 'Zaal', exampleWord: 'ذخیره (Store)', exampleImage: '', color: 'bg-purple-400', language: 'Pashto' },
  { id: 'p_16', char: 'ر', name: 'Raa', exampleWord: 'ریل (Train)', exampleImage: '', color: 'bg-blue-400', language: 'Pashto' },
  { id: 'p_17', char: 'ړ', name: 'Rre', exampleWord: 'غړدی (Necklace)', exampleImage: '', color: 'bg-pink-400', language: 'Pashto' },
  { id: 'p_18', char: 'ز', name: 'Zay', exampleWord: 'زرافه (Giraffe)', exampleImage: '', color: 'bg-teal-400', language: 'Pashto' },
  { id: 'p_19', char: 'ژ', name: 'Zhe', exampleWord: 'ژاله (Hail)', exampleImage: '', color: 'bg-indigo-400', language: 'Pashto' },
  { id: 'p_20', char: 'ږ', name: 'Gzhe', exampleWord: 'موږک (Mouse)', exampleImage: '', color: 'bg-emerald-400', language: 'Pashto' },
];

export const ENGLISH_ALPHABET: AlphabetLetter[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c, i) => ({
  id: `e_${i}`, char: c, name: c, exampleWord: '', exampleImage: '', color: `bg-${['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal', 'amber', 'indigo', 'emerald', 'rose', 'cyan', 'violet', 'lime', 'fuchsia', 'sky'][i % 17]}-400`, language: 'English'
}));

export const ITALIAN_ALPHABET: AlphabetLetter[] = 'ABCDEFGHILMNOPQRSTUVZ'.split('').map((c, i) => ({
  id: `i_${i}`, char: c, name: c, exampleWord: '', exampleImage: '', color: `bg-${['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal', 'amber', 'indigo', 'emerald', 'rose', 'cyan', 'violet', 'lime', 'fuchsia', 'sky'][i % 17]}-500`, language: 'Italian'
}));

export const ALL_ALPHABET: AlphabetLetter[] = [
  ...URDU_ALPHABET, 
  ...ARABIC_ALPHABET,
  ...ENGLISH_ALPHABET,
  ...ITALIAN_ALPHABET,
  ...PASHTO_ALPHABET,
];

const generateLevelLetters = (alphabet: AlphabetLetter[], count: number) => {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(alphabet[i % alphabet.length].id);
  }
  return ids;
};

const createLevels = (lang: string, alphabet: AlphabetLetter[], prefix: number): Level[] => {
  return [2, 3, 4, 5, 6, 7, 8, 9, 9].map((size, i) => ({
    id: prefix + i,
    name: `${lang} ${i + 1}: ${size}x${size} Fun`,
    letters: generateLevelLetters(alphabet, size * size - 2),
    gridSize: size,
    difficulty: size < 4 ? 'easy' : size < 7 ? 'medium' : 'hard',
    language: lang as any
  }));
};

export const URDU_LEVELS: Level[] = createLevels('Urdu', URDU_ALPHABET, 1);
export const ARABIC_LEVELS: Level[] = createLevels('Arabic', ARABIC_ALPHABET, 101);
export const ENGLISH_LEVELS: Level[] = createLevels('English', ENGLISH_ALPHABET, 201);
export const ITALIAN_LEVELS: Level[] = createLevels('Italian', ITALIAN_ALPHABET, 301);
export const PASHTO_LEVELS: Level[] = createLevels('Pashto', PASHTO_ALPHABET, 401);

export const ALL_LEVELS: Level[] = [...URDU_LEVELS, ...ARABIC_LEVELS, ...ENGLISH_LEVELS, ...ITALIAN_LEVELS, ...PASHTO_LEVELS];
