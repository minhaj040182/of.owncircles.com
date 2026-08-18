const CATEGORY_ALIASES: Record<string, string[]> = {
  electronics: ['electronics', 'laptop', 'tech', 'gadgets', 'computers', 'audio', 'mobiles', 'tv', 'smartphone'],
  household: ['household', 'home', 'living', 'cleaning', 'appliances', 'furniture'],
  kitchen: ['kitchen', 'kitchen_cooking', 'cooking', 'appliances', 'food', 'cooker', 'refrigerator', 'oven', 'fryer'],
  fitness: ['fitness', 'fitness_health', 'health', 'sports', 'workout', 'treadmill', 'gym'],
  gadgets: ['gadgets', 'home_gadgets', 'smart_tech', 'tech', 'smart_home', 'robot'],
  personal_care: ['personal_care', 'beauty', 'grooming', 'skincare', 'hair', 'shaver'],
  baby_parenting: ['baby_parenting', 'baby', 'parenting', 'kids', 'toys', 'stroller'],
  pet_supplies: ['pet_supplies', 'pets', 'pet', 'dog', 'cat', 'food'],
  home_office: ['home_office', 'office', 'desk_setup', 'work', 'chair', 'desk'],
  travel_outdoor: ['travel_outdoor', 'travel', 'outdoor', 'camping', 'backpack', 'gear'],
  books_stationery: ['books_stationery', 'books', 'stationery', 'reading', 'kindle', 'pen']
};

export function isCategoryMatch(vidCategory: string = '', targetCategory: string = ''): boolean {
  if (!vidCategory || !targetCategory) return false;
  const v = vidCategory.toLowerCase().trim();
  const t = targetCategory.toLowerCase().trim();
  
  if (v === t) return true;

  // Check aliases for targetCategory
  const aliases = CATEGORY_ALIASES[t] || [t];
  if (aliases.some(a => v.includes(a) || a.includes(v))) {
    return true;
  }

  // Check reverse if v is one of the keys
  const vAliases = CATEGORY_ALIASES[v];
  if (vAliases && vAliases.some(a => t.includes(a) || a.includes(t))) {
    return true;
  }

  return false;
}
