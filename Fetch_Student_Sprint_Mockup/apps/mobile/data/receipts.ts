export interface ReceiptItem {
  name: string;
  price: number;
  points: number;
}

export interface Receipt {
  storeName: string;
  items: ReceiptItem[];
  storeColor: string; // For badge color
}

// Target Receipt - Junk Food
const targetReceipt: Receipt = {
  storeName: 'Target',
  storeColor: '#DC2626',
  items: [
    { name: 'Oreos (Family Size)', price: 5.99, points: 5 },
    { name: 'Doritos Cool Ranch', price: 4.49, points: 8 },
    { name: 'Pringles Original', price: 2.99, points: 10 },
    { name: 'Chips Ahoy Cookies', price: 4.29, points: 5 },
    { name: 'Coca-Cola (12-pack)', price: 6.99, points: 7 },
    { name: 'Mountain Dew (2 Liter)', price: 2.49, points: 9 },
    { name: 'Cheetos Flamin Hot', price: 3.99, points: 15 },
    { name: 'Pop-Tarts Frosted Strawberry', price: 4.79, points: 6 },
    { name: 'Reeses Peanut Butter Cups', price: 1.99, points: 5 },
    { name: 'Hostess Twinkies', price: 4.49, points: 4 },
    { name: 'Little Debbie Swiss Rolls', price: 3.29, points: 6 },
    { name: 'Hot Cheetos (Party Size)', price: 5.49, points: 8 },
  ],
};

// Amazon Receipt - Workout Stuff
const amazonReceipt: Receipt = {
  storeName: 'Amazon',
  storeColor: '#FF9900',
  items: [
    { name: 'Lifting Wrist Straps', price: 14.99, points: 12 },
    { name: 'C4 Pre-Workout (30 servings)', price: 29.99, points: 25 },
    { name: 'Optimum Nutrition Whey Protein', price: 54.99, points: 40 },
    { name: 'Quest Protein Chips (Variety Pack)', price: 19.99, points: 18 },
    { name: 'Built Bar Protein Bars (18-pack)', price: 32.99, points: 22 },
    { name: 'Halo Top Ice Cream (8-pack)', price: 36.99, points: 20 },
    { name: 'Muscle Milk Protein Shake (12-pack)', price: 22.99, points: 15 },
    { name: 'Fairlife Core Power Elite', price: 29.99, points: 18 },
    { name: 'Kodiak Protein Pancake Mix', price: 9.99, points: 8 },
    { name: 'Perfect Bar Protein Bars', price: 24.99, points: 16 },
    { name: 'Resistance Bands Set', price: 12.99, points: 10 },
    { name: 'Yasso Frozen Greek Yogurt Bars', price: 5.99, points: 12 },
  ],
};

// Walmart Receipt - Church Food Supply
const walmartReceipt: Receipt = {
  storeName: 'Walmart',
  storeColor: '#0071CE',
  items: [
    { name: 'White Bread (12 loaves)', price: 18.00, points: 35 },
    { name: 'Peanut Butter (6 jars)', price: 24.00, points: 28 },
    { name: 'Strawberry Jelly (6 jars)', price: 18.00, points: 22 },
    { name: 'Deli Turkey (10 lbs)', price: 49.99, points: 45 },
    { name: 'Sliced Cheese (5 packs)', price: 22.50, points: 30 },
    { name: 'Apples (20 lbs)', price: 25.00, points: 40 },
    { name: 'Bananas (30 lbs)', price: 18.00, points: 38 },
    { name: 'Orange Juice (10 bottles)', price: 35.00, points: 42 },
    { name: 'Milk (15 gallons)', price: 52.50, points: 50 },
    { name: 'Eggs (20 dozen)', price: 60.00, points: 55 },
    { name: 'Ground Beef (15 lbs)', price: 67.50, points: 48 },
    { name: 'Pasta (20 boxes)', price: 20.00, points: 32 },
    { name: 'Marinara Sauce (15 jars)', price: 30.00, points: 35 },
    { name: 'Mixed Vegetables (Frozen, 20 bags)', price: 40.00, points: 45 },
    { name: 'Chicken Breast (20 lbs)', price: 80.00, points: 60 },
    { name: 'Rice (50 lbs)', price: 45.00, points: 52 },
    { name: 'Potato Chips (12 bags)', price: 36.00, points: 28 },
    { name: 'Cookies (10 packages)', price: 35.00, points: 30 },
  ],
};

// CVS Receipt - Beauty Shopping Spree
const cvsReceipt: Receipt = {
  storeName: 'CVS',
  storeColor: '#CC0000',
  items: [
    { name: 'CoverGirl Foundation', price: 12.99, points: 15 },
    { name: 'Maybelline Mascara (3 tubes)', price: 23.97, points: 18 },
    { name: 'Revlon Lipstick Set (5 colors)', price: 34.95, points: 25 },
    { name: 'L\'Oreal Hair Dye Kit', price: 9.99, points: 12 },
    { name: 'Neutrogena Face Wash', price: 8.49, points: 10 },
    { name: 'Olay Moisturizer', price: 24.99, points: 20 },
    { name: 'Sally Hansen Nail Polish (6 bottles)', price: 29.94, points: 22 },
    { name: 'Essie Nail Polish Remover', price: 6.99, points: 8 },
    { name: 'Garnier Face Masks (10-pack)', price: 12.99, points: 14 },
    { name: 'Dove Body Wash (3 bottles)', price: 17.97, points: 16 },
    { name: 'Bath & Body Works Lotion', price: 14.50, points: 12 },
    { name: 'Philosophy Face Serum', price: 42.00, points: 35 },
    { name: 'Maybelline Eyeshadow Palette', price: 15.99, points: 18 },
    { name: 'NYX Makeup Setting Spray', price: 8.99, points: 10 },
    { name: 'Tweezerman Tweezers', price: 22.99, points: 15 },
    { name: 'Real Techniques Brush Set', price: 19.99, points: 16 },
  ],
};

// 7-Eleven Receipt - Midnight Munchies
const sevenElevenReceipt: Receipt = {
  storeName: '7-Eleven',
  storeColor: '#FF6600',
  items: [
    { name: 'Monster Energy (4 cans)', price: 11.96, points: 20 },
    { name: 'Taquitos (4 pieces)', price: 7.96, points: 15 },
    { name: 'Big Gulp Slurpee', price: 2.49, points: 8 },
    { name: 'Hot Dog with Chili & Cheese', price: 3.99, points: 12 },
    { name: 'Takis Fuego (2 bags)', price: 5.98, points: 18 },
    { name: '5 Hour Energy (3 bottles)', price: 11.97, points: 22 },
    { name: 'Slim Jim (Giant, 5 pack)', price: 7.45, points: 14 },
    { name: 'Sour Gummy Worms', price: 2.99, points: 8 },
    { name: 'Nacho Cheese Doritos', price: 3.49, points: 10 },
    { name: 'Arizona Iced Tea (3 cans)', price: 2.97, points: 9 },
    { name: 'Hostess Donettes', price: 2.79, points: 6 },
    { name: 'Beef Jerky (Teriyaki)', price: 8.99, points: 16 },
    { name: 'Mountain Dew Code Red', price: 2.29, points: 7 },
    { name: 'Pizza Hot Pocket', price: 3.49, points: 10 },
    { name: 'Red Bull (2 cans)', price: 7.98, points: 18 },
    { name: 'Combos Cheddar Cheese', price: 1.99, points: 5 },
  ],
};

export const RECEIPTS = [targetReceipt, amazonReceipt, walmartReceipt, cvsReceipt, sevenElevenReceipt];

// Counter to cycle through receipts
let receiptIndex = 0;

export function getNextReceipt(): Receipt {
  const receipt = RECEIPTS[receiptIndex];
  receiptIndex = (receiptIndex + 1) % RECEIPTS.length;
  return receipt;
}

export function getCurrentReceiptIndex(): number {
  return receiptIndex;
}

export function resetReceiptCycle(): void {
  receiptIndex = 0;
}
