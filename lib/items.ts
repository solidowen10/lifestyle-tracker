// All tap-able items for each category

export type ItemDef = {
  key: string;
  emoji: string;
  label: string;
};

export const PROTEIN_ITEMS: ItemDef[] = [
  { key: "chicken", emoji: "🍗", label: "Chicken" },
  { key: "pork",    emoji: "🥓", label: "Pork" },
  { key: "beef",    emoji: "🥩", label: "Beef" },
  { key: "lamb",    emoji: "🍖", label: "Lamb" },
  { key: "fish",    emoji: "🐟", label: "Fish" },
  { key: "shrimp",  emoji: "🍤", label: "Shrimp" },
  { key: "tofu",    emoji: "🧊", label: "Tofu" },
  { key: "beans",   emoji: "🫘", label: "Beans" },
  { key: "egg",     emoji: "🥚", label: "Egg" },
];

export const CARB_ITEMS: ItemDef[] = [
  { key: "rice",    emoji: "🍚", label: "Rice" },
  { key: "bread",   emoji: "🍞", label: "Bread" },
  { key: "noodle",  emoji: "🍜", label: "Noodles" },
  { key: "potato",  emoji: "🥔", label: "Potato" },
  { key: "fruit",   emoji: "🍎", label: "Fruit" },
  { key: "corn",    emoji: "🌽", label: "Corn" },
  { key: "sweet_potato", emoji: "🍠", label: "Sweet Potato" },
  { key: "oat",     emoji: "🥣", label: "Oats" },
];

export const ALCOHOL_ITEMS: ItemDef[] = [
  { key: "beer",     emoji: "🍺", label: "Beer" },
  { key: "wine",     emoji: "🍷", label: "Wine" },
  { key: "spirits",  emoji: "🥃", label: "Spirits" },
  { key: "cocktail", emoji: "🍸", label: "Cocktail" },
  { key: "sake",     emoji: "🍶", label: "Sake" },
  { key: "cider",    emoji: "🍻", label: "Cider" },
];

export const COFFEE_ITEMS: ItemDef[] = [
  { key: "coffee", emoji: "☕", label: "Coffee" },
  { key: "espresso", emoji: "🫘", label: "Espresso" },
  { key: "matcha",   emoji: "🍵", label: "Matcha" },
];

export const EXERCISE_ITEMS: ItemDef[] = [
  { key: "run",    emoji: "🏃", label: "Run" },
  { key: "gym",    emoji: "🏋️", label: "Gym" },
  { key: "yoga",   emoji: "🧘", label: "Yoga" },
  { key: "swim",   emoji: "🏊", label: "Swim" },
  { key: "cycle",  emoji: "🚴", label: "Cycle" },
  { key: "walk",   emoji: "🚶", label: "Walk" },
  { key: "sport",  emoji: "⚽", label: "Sport" },
  { key: "hiit",   emoji: "🔥", label: "HIIT" },
];

export type Category = "protein" | "carbs" | "alcohol" | "coffee" | "exercise";

export const CATEGORIES: { id: Category; label: string; emoji: string; items: ItemDef[] }[] = [
  { id: "protein",  label: "Protein",  emoji: "🥩", items: PROTEIN_ITEMS },
  { id: "carbs",    label: "Carbs",    emoji: "🌾", items: CARB_ITEMS },
  { id: "alcohol",  label: "Alcohol",  emoji: "🍷", items: ALCOHOL_ITEMS },
  { id: "coffee",   label: "Coffee",   emoji: "☕", items: COFFEE_ITEMS },
  { id: "exercise", label: "Exercise", emoji: "🏃", items: EXERCISE_ITEMS },
];

// Default goals
export const DEFAULT_GOALS: Record<Category, number> = {
  protein:  5,
  carbs:    3,
  alcohol:  1,
  coffee:   2,
  exercise: 1,
};
