/* Catalogue: prices, pack sizes and products. Edit here.
   Prices are re-checked on the server (fg-api src/controllers/public/gls-sample-booking/catalog.js), keep both in sync. */
export type ImgKey = "isolate" | "lineup" | "plant" | "whey60" | "bcaa" | "creatine" | "logo" | "eaa" | "yeast" | "gainer" | "concentrate" | "fatburner" | "tea" | "peanut" | "mocha" | "factory" | "certs";
export type Shape = "tub" | "jar" | "bottle" | "sachet" | "bar";
export interface Category { id: string; name: string; line: string; cover: string }
export interface NutTable { title?: string; head: string[]; rows: string[][] }
export interface Product {
  id: string; cat: string; name: string; price: number; pack: string; desc: string;
  img?: ImgKey; wide?: boolean; isNew?: boolean;
  shape?: Shape; color?: string; dark?: boolean; short?: string;
  card: [string, string][]; facts: [string, string][];
  flavours: string[]; flavourLabel?: string;
  variants?: string[]; variantLabel?: string;
  nut?: NutTable[]; lists?: [string, string[]][];
}

const WHEY_F: string[] = ["Mawa Kulfi","Chocolate","Cookies & Cream","Coffee","Belgian Chocolate","Brownie Chocolate"];
const NEWF: [string, string][] = [["Format","Powder"],["Customisable","Protein %, flavour, sweetener"],["Nutrition values","Shared with sample COA"]];
export const CATEGORIES: Category[] = [
  {id:"whey",name:"Whey Protein",line:"Isolate, concentrate, blends and budget whey. Pick the protein level that fits your brand.",cover:"isolate"},
  {id:"plant",name:"Plant & Vegan Protein",line:"Dairy-free proteins for vegan and lactose-intolerant customers.",cover:"plant"},
  {id:"gainer",name:"Mass & Weight Gainer",line:"High-calorie blends for people trying to bulk up.",cover:"gainer"},
  {id:"creatine",name:"Creatine",line:"Strength, performance and power output for gym-goers and athletes.",cover:"creatineMono"},
  {id:"amino",name:"Amino Acids",line:"BCAA, EAA and single aminos for recovery and endurance.",cover:"bcaa"},
  {id:"pre",name:"Pre-Workout & Hydration",line:"Energy, pump and electrolyte drink mixes.",cover:"preworkout"},
  {id:"weight",name:"Weight Management",line:"Low-stimulant fat burners and metabolism support.",cover:"fatburner"},
  {id:"wellness",name:"Vitamins & Wellness",line:"Daily health tablets, capsules and powders.",cover:"multivitamin"},
  {id:"peanut",name:"Peanut Butter",line:"Smooth and crunchy, classic and high-protein, in eleven flavours.",cover:"pbClassic"},
  {id:"beverage",name:"Instant Protein Beverages",line:"Protein tea, coffee and chocolate premixes in single-serve sachets.",cover:"tea"},
  {id:"snacks",name:"Protein Snacks",line:"Ready-to-eat protein for on-the-go customers.",cover:"bar"}
];
export const PRODUCTS: Product[] = [
  /* Whey */
  {id:"isolate",cat:"whey",name:"90% Whey Protein Isolate",img:"isolate",price:249,pack:"50 g sample pouch",
   desc:"Our highest-purity whey. Fast-absorbing, low in carbs and fat, for premium and athlete-focused brands.",
   card:[["Protein","25 g / scoop"],["Energy","113 kcal"]],
   facts:[["Serving","1 scoop (35 g)"],["Protein","25.05 g"],["Energy","113.5 kcal"],["Carbohydrates","5.5 g"],["Added sugar","0 g"],["Total fat","1.92 g"]],flavours:WHEY_F},
  {id:"concentrate",cat:"whey",name:"80% Whey Protein Concentrate",img:"concentrate",price:249,pack:"50 g sample pouch",
   desc:"The everyday bestseller. Creamy taste and great value per gram of protein for mass-market gym brands.",
   card:[["Protein","24 g / scoop"],["Energy","134 kcal"]],
   facts:[["Serving","1 scoop (35 g)"],["Protein","24 g"],["Energy","133.7 kcal"],["Carbohydrates","5.4 g"],["Added sugar","0 g"],["Total fat","1.8 g"]],flavours:WHEY_F},
  {id:"whey60",cat:"whey",name:"60% Whey Protein",img:"whey60",price:249,pack:"50 g sample pouch",
   desc:"An affordable entry-level whey for first-time buyers and price-sensitive markets.",
   card:[["Protein","22 g / scoop"],["Energy","135 kcal"]],
   facts:[["Serving","1 scoop (35 g)"],["Protein","22 g"],["Energy","135 kcal"],["Carbohydrates","8 g"],["Added sugar","0 g"],["Total fat","1.7 g"]],flavours:WHEY_F},
  {id:"whey50",cat:"whey",name:"50% Whey Protein",shape:"tub",color:"#7FB3D5",short:"WHEY 50%",price:249,pack:"50 g sample pouch",
   desc:"Value whey with 18 g protein per scoop. Built for price-led and first-time protein buyers.",
   card:[["Protein","18 g / scoop"],["Serving","35 g scoop"]],
   facts:[["Serving","1 scoop (35 g)"],["Protein content","50%"],["Protein","~18 g per scoop"]],flavours:WHEY_F},
  {id:"wheyblend",cat:"whey",isNew:true,name:"Whey Protein Blend",shape:"tub",color:"#E2D23A",short:"WHEY BLEND",price:249,pack:"50 g sample pouch",
   desc:"Isolate and concentrate blended for a balance of purity, taste and price.",
   card:[["Base","Isolate + concentrate"],["Format","Powder"]],facts:NEWF,flavours:WHEY_F},
  {id:"hydro",cat:"whey",isNew:true,name:"Hydrolyzed Whey Protein",shape:"tub",color:"#2C7BE5",short:"HYDRO WHEY",price:249,pack:"50 g sample pouch",
   desc:"Pre-digested whey for the fastest absorption. A true premium tier for serious athletes.",
   card:[["Base","Hydrolysate"],["Tier","Ultra premium"]],facts:NEWF,flavours:WHEY_F},
  /* Plant */
  {id:"plant",cat:"plant",name:"Plant Protein",img:"plant",price:249,pack:"50 g sample pouch",
   desc:"Dairy-free, cholesterol-free protein for vegan and lactose-intolerant customers.",
   card:[["Protein","25 g / scoop"],["Cholesterol","0 mg"]],
   facts:[["Serving","1 scoop (35 g)"],["Protein","25 g"],["Energy","143.5 kcal"],["Carbohydrates","4.2 g"],["Total sugars","0.7 g"],["Cholesterol","0 mg"]],flavours:WHEY_F},
  {id:"yeast",cat:"plant",name:"Yeast Protein",img:"yeast",price:249,pack:"50 g sample pouch",
   desc:"Next-generation vegan protein with zero sugar and added fibre.",
   card:[["Protein","24 g / scoop"],["Sugar","0 g"]],
   facts:[["Serving","1 scoop (35 g)"],["Protein","24 g"],["Energy","126 kcal"],["Total sugars","0 g"],["Dietary fibre","3.5 g"],["Total fat","0.74 g"]],
   flavours:["Mawa Kulfi","Chocolate","Cookies & Cream","Coffee","Buttermilk","Belgian Chocolate","Brownie Chocolate"]},
  {id:"pea",cat:"plant",isNew:true,name:"Pea Protein Isolate",shape:"tub",color:"#6BAA3A",short:"PEA PROTEIN",price:249,pack:"50 g sample pouch",
   desc:"Single-source pea protein, allergen-friendly and clean-label.",card:[["Source","Yellow pea"],["Format","Powder"]],facts:NEWF,flavours:["Unflavoured","Chocolate","Coffee","Mawa Kulfi"]},
  {id:"soy",cat:"plant",isNew:true,name:"Soy Protein Isolate",shape:"tub",color:"#C9A46A",short:"SOY PROTEIN",price:249,pack:"50 g sample pouch",
   desc:"Complete plant protein at an accessible price point.",card:[["Source","Soy"],["Format","Powder"]],facts:NEWF,flavours:["Unflavoured","Chocolate","Mawa Kulfi"]},
  /* Gainer */
  {id:"gainer",cat:"gainer",name:"Mass Gainer",img:"gainer",price:249,pack:"50 g sample pouch",
   desc:"High-calorie carb and protein blend with a 2:1:1 BCAA recovery blend.",
   card:[["Energy","387 kcal / 100 g"],["Carbs","76.8 g / 100 g"]],
   facts:[["Per","100 g"],["Energy","387 kcal"],["Protein","17.5 g"],["Carbohydrates","76.8 g"],["Added sugar","0 g"],["BCAA blend","2:1:1"]],flavours:WHEY_F},
  {id:"leangainer",cat:"gainer",isNew:true,name:"Lean Mass Gainer",shape:"tub",color:"#B5763F",short:"LEAN GAINER",price:249,pack:"50 g sample pouch",
   desc:"Higher protein, moderate carbs. For customers who want size without excess fat.",card:[["Protein : carb","Higher protein"],["Format","Powder"]],facts:NEWF,flavours:WHEY_F},
  /* Creatine */
  {id:"creatineMono",cat:"creatine",name:"Creatine Monohydrate",img:"creatine",shape:"jar",color:"#F2C230",short:"CREATINE",price:249,pack:"5 g sample jar",
   desc:"The most researched creatine form, for strength and power output.",card:[["Form","Monohydrate"],["Format","Powder"]],
   facts:[["Form","Creatine monohydrate"],["Add-ons","Electrolytes or amino acids on request"]],flavours:["Unflavoured","Lemon"]},
  {id:"creatineMicro",cat:"creatine",name:"Micronized Creatine",img:"creatine",shape:"jar",color:"#F2C230",short:"MICRONIZED",price:249,pack:"5 g sample jar",
   desc:"Finer particles for better mixing and a smoother drink.",card:[["Form","Micronized"],["Mixability","Smooth"]],
   facts:[["Form","Micronized creatine monohydrate"],["Add-ons","Electrolytes or amino acids on request"]],flavours:["Unflavoured","Lemon"]},
  {id:"creatineHcl",cat:"creatine",name:"Creatine HCl",shape:"jar",color:"#F2C230",short:"CREATINE HCL",price:249,pack:"5 g sample jar",
   desc:"Highly soluble creatine with a smaller serving size.",card:[["Form","Hydrochloride"],["Format","Powder"]],
   facts:[["Form","Creatine HCl"],["Add-ons","Electrolytes or amino acids on request"]],flavours:["Unflavoured","Lemon"]},
  {id:"creatineBlend",cat:"creatine",name:"Creatine Performance Blend",img:"creatine",shape:"jar",color:"#F2C230",short:"PERF BLEND",price:249,pack:"5 g sample jar",
   desc:"Creatine with electrolytes and amino acids for a complete performance drink.",card:[["Form","Blend"],["Includes","Electrolytes, aminos"]],
   facts:[["Base","Creatine monohydrate"],["With","Electrolytes, amino acids"]],flavours:["Lemon","Orange"]},
  /* Amino */
  {id:"bcaa",cat:"amino",name:"BCAA",img:"bcaa",shape:"jar",color:"#E67E22",short:"BCAA",price:249,pack:"5 g sample jar",
   desc:"Branched-chain amino acids for muscle recovery, endurance and workout performance.",card:[["Ratios","2:1:1 to 8:1:1"],["Add-ons","Glutamine, electrolytes"]],
   facts:[["2:1:1","Available"],["4:1:1","Available"],["8:1:1","Available"],["With glutamine","Custom"],["Intra-workout hydration","Custom"]],
   variantLabel:"Ratio",variants:["2:1:1","4:1:1","8:1:1"],flavours:["Orange"]},
  {id:"eaa",cat:"amino",name:"EAA",img:"eaa",shape:"jar",color:"#1ABC9C",short:"EAA",price:249,pack:"5 g sample jar",
   desc:"All nine essential amino acids for better recovery and endurance.",card:[["Formulas","2 options"],["Add-ons","Electrolytes"]],
   facts:[["Standard EAA","Available"],["Advanced Athlete EAA","Available"],["With electrolytes","Custom"],["Recovery blend","Custom"]],
   variantLabel:"Formula",variants:["Standard EAA","Advanced Athlete EAA"],flavours:["Orange"]},
  {id:"glutamine",cat:"amino",isNew:true,name:"L-Glutamine",shape:"jar",color:"#E9EEF2",dark:true,short:"GLUTAMINE",price:249,pack:"5 g sample jar",
   desc:"Recovery and gut-support amino acid, unflavoured to stack with anything.",card:[["Format","Powder"],["Taste","Unflavoured"]],facts:NEWF,flavours:["Unflavoured"]},
  {id:"citrulline",cat:"amino",isNew:true,name:"L-Citrulline Malate",shape:"jar",color:"#8E5BD9",short:"CITRULLINE",price:249,pack:"5 g sample jar",
   desc:"For pump and endurance, as a standalone or pre-workout base.",card:[["Ratio","2:1"],["Format","Powder"]],facts:NEWF,flavours:["Unflavoured","Orange"]},
  /* Pre-workout & hydration */
  {id:"preworkout",cat:"pre",isNew:true,name:"Pre-Workout",shape:"jar",color:"#E23A3A",short:"PRE-WORKOUT",price:249,pack:"10 g sample jar",
   desc:"Energy, focus and pump in one scoop.",card:[["Format","Powder"],["Stimulant","Caffeine-based"]],facts:NEWF,flavours:["Mix Fruit","Watermelon","Blue Raspberry"]},
  {id:"stimfree",cat:"pre",isNew:true,name:"Stim-Free Pre-Workout",shape:"jar",color:"#3BB9C4",short:"STIM-FREE PRE",price:249,pack:"10 g sample jar",
   desc:"Pump and endurance without caffeine, for evening trainers.",card:[["Format","Powder"],["Caffeine","None"]],facts:NEWF,flavours:["Mix Fruit","Watermelon"]},
  {id:"electrolyte",cat:"pre",isNew:true,name:"Electrolyte Drink Mix",shape:"sachet",color:"#F28C28",short:"ELECTROLYTES",price:249,pack:"10 g sachet",
   desc:"Fast hydration for training, sport and hot weather.",card:[["Format","Sachets or jar"],["Sugar","Low or zero"]],facts:NEWF,flavours:["Lemon","Orange","Watermelon"]},
  /* Weight */
  {id:"fatburner",cat:"weight",name:"Fat Burner",img:"fatburner",shape:"jar",color:"#2980B9",short:"FAT BURNER",price:249,pack:"10 g sample jar",
   desc:"Low-stimulant, jitter-free formula with L-carnitine, green tea, garcinia and only 25 mg caffeine per serving.",
   card:[["Caffeine","25 mg / serving"],["Energy","15.5 kcal"]],
   facts:[["Serving","6 g"],["L-Carnitine L-Tartrate","1.9 g"],["Caffeine","25 mg"],["Vitamin C, B3, B6, Chromium","50% RDA each"],["Dietary fibre","1.5 g"],["Energy","15.5 kcal"]],flavours:["Blueberry"]},
  {id:"carnitine",cat:"weight",isNew:true,name:"L-Carnitine",shape:"bottle",color:"#16A085",short:"L-CARNITINE",price:249,pack:"5 capsules",
   desc:"Supports fat metabolism and energy, in capsule form.",card:[["Format","Capsules"],["Form","L-Carnitine L-Tartrate"]],facts:[["Format","Capsules"],["Customisable","Dose per capsule, count"]],flavourLabel:"Format",flavours:["Capsules"]},
  {id:"acv",cat:"weight",isNew:true,name:"Apple Cider Vinegar",shape:"bottle",color:"#C0392B",short:"ACV",price:249,pack:"5 effervescent tablets",
   desc:"Effervescent tablets for daily wellness and weight-management routines.",card:[["Format","Effervescent"],["Taste","Apple"]],facts:[["Format","Effervescent tablets"],["Customisable","Flavour, count"]],flavours:["Green Apple"]},
  /* Wellness */
  {id:"multivitamin",cat:"wellness",isNew:true,name:"Multivitamin",shape:"bottle",color:"#F39C12",short:"MULTIVITAMIN",price:249,pack:"5 tablets",
   desc:"Daily vitamins and minerals, in men’s and women’s formulas.",card:[["Format","Tablets"],["Formulas","Men, Women"]],facts:[["Format","Tablets"],["Customisable","Formula, count"]],
   variantLabel:"Formula",variants:["Men","Women"],flavourLabel:"Format",flavours:["Tablets"]},
  {id:"omega",cat:"wellness",isNew:true,name:"Omega-3 Fish Oil",shape:"bottle",color:"#2E86DE",short:"OMEGA-3",price:249,pack:"5 softgels",
   desc:"EPA and DHA for heart, brain and joint health.",card:[["Format","Softgels"],["Source","Fish oil"]],facts:[["Format","Softgels"],["Customisable","EPA/DHA strength, count"]],flavourLabel:"Format",flavours:["Softgels"]},
  {id:"ashwagandha",cat:"wellness",isNew:true,name:"Ashwagandha",shape:"bottle",color:"#7D9D2E",short:"ASHWAGANDHA",price:249,pack:"5 capsules",
   desc:"Traditional adaptogen for stress, sleep and recovery.",card:[["Format","Capsules"],["Extract","Standardised"]],facts:[["Format","Capsules or tablets"],["Customisable","Extract strength, count"]],flavourLabel:"Format",flavours:["Capsules"]},
  {id:"collagen",cat:"wellness",isNew:true,name:"Collagen Peptides",shape:"jar",color:"#F5B7B1",dark:true,short:"COLLAGEN",price:249,pack:"10 g sample jar",
   desc:"For skin, hair, nails and joints. Mixes clear in water.",card:[["Format","Powder"],["Type","Hydrolyzed"]],facts:NEWF,flavours:["Unflavoured","Orange","Mixed Berry"]},
  {id:"biotin",cat:"wellness",isNew:true,name:"Biotin",shape:"bottle",color:"#D35BA3",short:"BIOTIN",price:249,pack:"5 tablets",
   desc:"For healthy hair, skin and nails.",card:[["Format","Tablets"],["Strength","Custom"]],facts:[["Format","Tablets"],["Customisable","Strength, count"]],flavourLabel:"Format",flavours:["Tablets"]},
  /* Peanut butter */
  {id:"pbClassic",cat:"peanut",name:"Peanut Butter",img:"peanut",wide:true,shape:"jar",color:"#D35400",short:"PEANUT BUTTER",price:249,pack:"50 g sample jar",
   desc:"Classic, natural and flavoured peanut butters with no added sugar.",card:[["Protein","9 g / 32 g"],["Added sugar","0 g"]],
   facts:[["Serving","32 g"],["Protein","9 g"],["Energy","199 kcal"],["Dietary fibre","2 g"],["Added sugar","0 g"],["Total fat","14 g"]],
   variantLabel:"Texture",variants:["Smooth","Crunchy"],
   flavours:["Natural","Classic","American Classic","Chocolate","Elaichi","Chocolate Crispy","White Chocolate Crispy","Mango Chia Seeds"]},
  {id:"pbHigh",cat:"peanut",name:"High-Protein Peanut Butter",img:"peanut",wide:true,shape:"jar",color:"#BA4A00",short:"HI-PROTEIN PB",price:249,pack:"50 g sample jar",
   desc:"Extra protein for gym-going customers, in crispy and jaggery flavours.",card:[["Protein","High protein"],["Added sugar","0 g"]],
   facts:[["Base","Peanut butter + added protein"],["Serving","32 g"]],
   flavours:["Chocolate Crispy High Protein","White Chocolate Crispy High Protein","Jaggery High Protein"]},
  /* Beverages */
  {id:"tea",cat:"beverage",name:"Instant Protein Spiced Milk Tea",img:"tea",wide:true,shape:"sachet",color:"#8E583E",short:"PROTEIN TEA",price:249,pack:"15 g sample sachet",
   desc:"Your favourite chai, made convenient. Aromatic spices, creamy taste and protein in every cup.",card:[["Protein","4.6 g / sachet"],["Added sugar","0 g"]],
   facts:[["Serving","1 sachet (14 g)"],["Protein","4.6 g"],["Energy","46.5 kcal"],["Carbohydrates","6.8 g"],["Added sugar","0 g"],["Total fat","0.1 g"]],flavours:["Masala Chai"]},
  {id:"mocha",cat:"beverage",name:"Instant Protein Mocha Coffee",img:"mocha",wide:true,shape:"sachet",color:"#4A2E1B",short:"PROTEIN MOCHA",price:249,pack:"15 g sample sachet",
   desc:"Rich coffee and smooth cocoa in a creamy, protein-boosted mocha premix.",card:[["Protein","4.4 g / sachet"],["Added sugar","0 g"]],
   facts:[["Serving","1 sachet (14 g)"],["Protein","4.4 g"],["Energy","45.3 kcal"],["Carbohydrates","6.2 g"],["Added sugar","0 g"],["Total fat","0.14 g"]],flavours:["Mocha"]},
  {id:"coffee",cat:"beverage",isNew:true,name:"Instant Protein Coffee",shape:"sachet",color:"#6F4E37",short:"PROTEIN COFFEE",price:249,pack:"15 g sample sachet",
   desc:"Classic instant coffee with added protein.",card:[["Format","Sachets"],["Serve","Hot or cold"]],facts:NEWF,flavours:["Classic Coffee","Hazelnut"]},
  {id:"hotchoc",cat:"beverage",isNew:true,name:"Protein Hot Chocolate",shape:"sachet",color:"#5D3A1A",short:"HOT CHOCOLATE",price:249,pack:"15 g sample sachet",
   desc:"Rich cocoa drink with protein, for kids and adults.",card:[["Format","Sachets"],["Serve","Hot milk"]],facts:NEWF,flavours:["Chocolate"]},
  /* Snacks */
  {id:"bar",cat:"snacks",isNew:true,name:"Protein Bar",shape:"bar",color:"#8DC63F",short:"PROTEIN BAR",price:399,pack:"6 bars",
   desc:"Ready-to-eat protein bar for on-the-go customers.",card:[["Format","Bar"],["Pack","6 bars"]],facts:[["Format","Bars"],["Customisable","Protein, coating, flavour"]],flavours:["Chocolate","Peanut Butter","Cookies & Cream"]},
  {id:"oats",cat:"snacks",isNew:true,name:"High-Protein Oats",shape:"jar",color:"#D9B26F",dark:true,short:"PROTEIN OATS",price:349,pack:"400 g sample jar",
   desc:"Breakfast oats with added protein.",card:[["Format","Rolled oats"],["Serve","Milk or water"]],facts:NEWF,flavours:["Chocolate","Mawa Kulfi","Unflavoured"]}
];
export const MAX_PER_ITEM = 3;

/* Full brochure nutrition tables */
const R = "—";
const NUT: Record<string, NutTable[]> = {
  isolate:[{head:["Per 35 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","113.47","378.23","6.57%"],["Total protein (g)","25.05","73.39","40.85%"],["Carbohydrates (g)","5.50","14.69",R],["Added sugar (g)","0","0",R],["Dietary fibre (g)","1.78","5.39",R],["Total fat (g)","1.92","2.96","1.47%"],["Saturated fatty acid (g)","0.66","2.0","3.14%"],["Polyunsaturated fatty acid (g)","0.52","1.57",R],["Monounsaturated fatty acid (g)","1.54","4.66",R],["Trans fatty acid (g)","0.04","0.12",R],["Cholesterol (g)","0.02","0.06",R],["Potassium (mg)","158.8","481.21",R],["Sodium (mg)","135.5","410.60",R]]}],
  concentrate:[{head:["Per 35 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","133.72","382.06","6.60%"],["Protein (g)","24","68.57","40.00%"],["Total carbohydrates (g)","5.38","15.37","2.00%"],["Total sugar (g)","5.3","15.14",R],["Added sugars (g)","0","0",R],["Total fat (g)","1.8","5.14","2.00%"],["Saturated fatty acid (g)","0.62","1.77","3.00%"],["Polyunsaturated fatty acid (g)","0.48","1.37",R],["Monounsaturated fatty acid (g)","0.99","2.83",R],["Trans fat (g)","0","0",R],["Cholesterol (mg)","28","80","9%"],["Potassium (mg)","230","657.14","5%"],["Sodium (mg)","150","428.57","7%"]]}],
  whey60:[{head:["Per 35 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","135","386","6.80%"],["Protein (g)","22","62.9","40.70%"],["Carbohydrate (g)","8","22.9",R],["Total sugars (g)","3.5","10",R],["Added sugars (g)","0","0","0%"],["Total fat (g)","1.7","4.9","2.50%"],["Saturated fat (g)","1.1","3.1","5.00%"],["Trans fat (g)","0","0","0%"],["Sodium (mg)","110","314","5.50%"]]}],
  gainer:[{head:["Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","387.01","22.09%"],["Total protein (g)","17.5","32.40%"],["Carbohydrates (g)","76.8",R],["Added sugar (g)","0",R],["Dietary fibre (g)","1.15",R],["Total fat (g)","1.09","1.52%"],["Saturated fatty acid (g)","0.47","3.17%"],["Polyunsaturated fatty acid (g)","0.38",R],["Monounsaturated fatty acid (g)","0.97",R],["Trans fatty acid (g)","0.07",R],["Cholesterol (g)","0",R],["Potassium (mg)","172.67",R],["Sodium (mg)","138.89",R],["Recovery blend, BCAA 2:1:1","",""],["L-Leucine (mg)","1333",R],["L-Isoleucine (mg)","666",R],["L-Valine (mg)","666",R]]}],
  plant:[{head:["Per 35 g","Per 100 g"],rows:[
    ["Energy (kcal)","143.5","410"],["Protein (g)","25.00","71.43"],["Total carbohydrate (g)","4.20","12.00"],["Total sugars (g)","0.70","2.00"],["Added sugars (g)","0","0"],["Total fat (g)","1.93","5.50"],["Saturated fat (g)","0.35","1.00"],["Trans fat (g)","0","0"],["Cholesterol (mg)","0","0"],["Sodium (mg)","140","400"],["Potassium (mg)","245","700"]]}],
  yeast:[{head:["Per 35 g","Per 100 g"],rows:[
    ["Energy (kcal)","126","360"],["Protein (g)","24.00","68.57"],["Total carbohydrates (g)","2.80","8.00"],["Total sugars (g)","0","0"],["Added sugars (g)","0","0"],["Total fat (g)","0.74","2.10"],["Saturated fat (g)","0.18","0.50"],["Trans fat (g)","0","0"],["Sodium (mg)","70","200"],["Dietary fibre (g)","3.50","10.00"]]}],
  fatburner:[{title:"Nutrition",head:["Per 6 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","15.5","258","0.75%"],["Protein (g)","0","0","0.00%"],["Total carbohydrates (g)","2.75","45.8",R],["Total sugars (g)","0.3","5",R],["Added sugars (g)","0","0","0.00%"],["Dietary fibre (g)","1.5","25",R],["Total fat (g)","0","0","0.00%"],["Sodium (mg)","2.5","42","0.13%"]]},
    {title:"Vitamins, minerals and actives",head:["Per 6 g","Per 100 g","%RDA"],rows:[
    ["Vitamin C (L-Ascorbic acid)","40 mg","666.7 mg","50%"],["Niacinamide (Vitamin B3)","8 mg","1333.3 mg","50%"],["Pyridoxine HCl (Vitamin B6)","0.95 mg","15.8 mg","50%"],["Chromium (as picolinate)","25 mcg","416.7 mcg","50%"],["L-Carnitine L-Tartrate","1.9 g","31.67 g",R],["Psyllium husk","0.5 g","8.33 g",R],["Inulin","450 mg","7.50 g",R],["Taurine","300 mg","5.00 g",R],["Mulberry leaf extract","250 mg","4.17 g",R],["Apple cider vinegar powder","225 mg","3.75 g",R],["Garcinia cambogia extract","200 mg","3.33 g",R],["Barberry root extract","200 mg","3.33 g",R],["Cinnamon extract","190 mg","3.17 g",R],["Green tea extract","150 mg","2.50 g",R],["Grape seed extract","150 mg","2.50 g",R],["Caffeine","25 mg","416.7 mg",R]]}],
  peanut:[{head:["Per 32 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","199","622","10%"],["Protein (g)","9","28","17%"],["Carbohydrate (g)","5","16",R],["Dietary fibre (g)","2","6","5%"],["Total sugar (g)","1","3",R],["Added sugar (g)","0","0",R],["Total fat (g)","14","45","21%"],["Saturated fat (g)","2","7","9%"],["Polyunsaturated fat (g)","5","15",R],["Monounsaturated fat (g)","7","23",R],["Trans fat (g)","0","0",R],["Cholesterol (mg)","0","0",R],["Sodium (mg)","53","165","3%"]]}],
  tea:[{head:["Per 14 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","46.5","332","2.30%"],["Protein (g)","4.6","32.8","8.50%"],["Total carbohydrates (g)","6.8","48.5",R],["Total sugars (g)","5.5","39.3",R],["Added sugars (g)","0","0","0.00%"],["Dietary fibre (g)","0.2","1.5",R],["Total fat (g)","0.1","0.8","0.15%"],["Sodium (mg)","123.6","883","6.20%"]]}],
  mocha:[{head:["Per 14 g","Per 100 g","%RDA"],rows:[
    ["Energy (kcal)","45.3","323.6","2.30%"],["Protein (g)","4.4","31.4","8.10%"],["Total carbohydrates (g)","6.2","44.3",R],["Total sugars (g)","5.2","37.1",R],["Added sugars (g)","0","0","0.00%"],["Dietary fibre (g)","0.2","1.4",R],["Total fat (g)","0.14","1","0.21%"],["Sodium (mg)","117.3","838","5.90%"]]}]
};
const CREATINE_LISTS: [string, string[]][] = [["Product options",["Creatine Monohydrate","Micronized Creatine","Creatine Blends"]],["Custom options",["With electrolytes","With amino acids","Performance blends"]],["Common ingredients",["Creatine Monohydrate","Creatine HCl","Electrolytes","Amino acids"]]];
const LISTS: Record<string, [string, string[]][]> = {
  creatineMono:CREATINE_LISTS, creatineMicro:CREATINE_LISTS, creatineHcl:CREATINE_LISTS, creatineBlend:CREATINE_LISTS,
  bcaa:[["Product options",["BCAA 2:1:1","BCAA 4:1:1","BCAA 8:1:1"]],["Custom options",["With electrolytes","With glutamine","Intra-workout hydration"]],["Supports",["Muscle recovery","Endurance","Workout performance"]]],
  eaa:[["Product options",["Standard EAA formula","Advanced Athlete EAA"]],["Custom options",["With electrolytes","Recovery blends","Endurance amino blends"]]],
  fatburner:[["Functional and performance claims",["Low-stimulant, jitter-free","Prebiotic gut support","Supports fat metabolism","Aids active weight management","Supports healthy blood sugar balance","Promotes sustained energy"]]],
  pbClassic:[["Textures",["Smooth","Crunchy"]]],
  tea:[["Storage",["Store in a cool, dry place away from moisture and strong odours. Keep the container or sachets tightly sealed."]]],
  mocha:[["Storage",["Store in a cool, dry place away from direct sunlight, heat and moisture. Keep the pouch or container tightly sealed after each use."]]]
};
NUT.pbClassic = NUT.peanut;
PRODUCTS.forEach(p => { if (NUT[p.id]) p.nut = NUT[p.id]; if (LISTS[p.id]) p.lists = LISTS[p.id]; });

/* Full combo offer */
export const COMBO = {price:999, parts:[
  {label:"Protein", options:["whey50","whey60","concentrate","isolate"]},
  {label:"Pre-Workout", options:["preworkout"]},
  {label:"Creatine", options:["creatineMono","creatineMicro"]},
  {label:"BCAA", options:["bcaa"]},
  {label:"Mass Gainer", options:["gainer"]}
]};
/* Shipping */
export const FREE_SHIP_MIN = 700, SHIP_FEE = 99;
export const STATES = ["Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];
