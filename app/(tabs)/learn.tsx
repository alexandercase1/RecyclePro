import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Static content — Tips, Myths, Seasonal
// ---------------------------------------------------------------------------

const TIPS: string[] = [
  'Always rinse food containers before recycling — residue can contaminate an entire load.',
  'Pizza boxes: the top half is usually recyclable, but the greasy bottom goes in the trash.',
  'Plastic bags are NOT curbside recyclable. Return them to grocery store drop-off bins.',
  'Flatten cardboard boxes before placing them at the curb to save space in collection trucks.',
  'Shredded paper cannot be recycled loose — bag it inside a sealed paper bag or check for a local drop-off.',
  'Remove lids from glass jars and recycle them separately — most lids are metal and can go in commingled.',
  'Empty aerosol cans (hairspray, cooking spray) are recyclable curbside once completely used.',
  'Greasy or food-stained paper (napkins, paper plates) goes in the trash, not recycling.',
  'Aluminum foil is recyclable — but scrunch multiple pieces into a ball larger than a golf ball so it doesn\'t jam machinery.',
  'Plastic bottles should be rinsed, caps on, and placed in recycling — the cap is usually the same resin as the bottle.',
  'Styrofoam (polystyrene) is NOT accepted in most curbside programs — check for a local drop-off center.',
  'Electronics contain hazardous materials. Never put phones, batteries, or TVs in your recycling bin.',
  'Batteries — even single-use alkaline — should go to a designated battery drop-off, not the trash or recycling.',
  'Receipts printed on thermal paper cannot be recycled — the coating contaminates paper streams.',
  'Cardboard contaminated with motor oil or paint is not recyclable — cut off clean sections if possible.',
  'Glass recycling rules vary widely by town. Some municipalities require it to be separated from commingled.',
  'Plastic #1 (PET, water bottles) and #2 (HDPE, milk jugs) are the most widely accepted. Check the number stamped on the bottom.',
  'Empty and dry paint cans are recyclable as metal. Latex paint can often be dried out and trashed; oil-based is hazardous waste.',
  'Bubble wrap and plastic film packaging go back to store drop-offs, not curbside bins.',
  'Composting food scraps — fruit peels, coffee grounds, eggshells — keeps organic material out of landfill and reduces methane.',
];

type Myth = { myth: string; reality: string };
const MYTHS: Myth[] = [
  {
    myth: '"Wish-cycling" is harmless',
    reality:
      'Putting items in recycling and hoping they\'ll get sorted is called wish-cycling. Unrecyclable items contaminate entire loads, which can send otherwise-good materials straight to the landfill.',
  },
  {
    myth: 'All plastic is recyclable',
    reality:
      'Only plastics #1 (PET) and #2 (HDPE) are widely accepted curbside. Plastics #3–7 vary greatly by municipality. Check the resin code stamped on the bottom of the container.',
  },
  {
    myth: 'Recycling is always better than trashing',
    reality:
      'A contaminated recycling bin can do more harm than good — it can ruin an entire truckload. When in doubt about an item, it\'s often better to trash it than risk contaminating a batch.',
  },
  {
    myth: 'Small items like bottle caps and straws can\'t be recycled',
    reality:
      'Many facilities can process small plastics when they\'re bundled. Leave caps on plastic bottles and scrunch aluminum foil into a larger ball before placing in the bin.',
  },
];

type SeasonalTip = { months: number[]; tip: string };
const SEASONAL_TIPS: SeasonalTip[] = [
  {
    months: [1, 2],
    tip: 'Post-holiday cardboard overload? Break down all boxes flat before placing at the curb, and spread them across multiple pickup days if your pile is large.',
  },
  {
    months: [3, 4, 5],
    tip: 'Spring yard waste season is starting. Check your calendar tab for leaf and branch collection days — they\'re often separate from regular garbage.',
  },
  {
    months: [6, 7, 8],
    tip: 'BBQ season means extra foil trays and plastic cups. Rinse them before recycling — even a quick rinse helps prevent contamination.',
  },
  {
    months: [9, 10, 11],
    tip: 'Fall leaf season: most towns offer a dedicated yard waste or leaf collection schedule. Check your calendar tab so you don\'t miss the window.',
  },
  {
    months: [12],
    tip: 'Holiday trees can often be chipped or composted. Check your town\'s schedule for tree collection in early January — many pick up trees curbside for a few weeks after the holidays.',
  },
];

// ---------------------------------------------------------------------------
// Category content types
// ---------------------------------------------------------------------------

type AcceptanceLevel = 'curbside' | 'drop-off' | 'varies' | 'trash';

type ResinCode = {
  code: number;
  name: string;
  examples: string;
  acceptance: AcceptanceLevel;
  note: string;
};

type DropOffOption = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
};

type DoItem = { text: string; ok: boolean | 'note' };

type CategoryContent =
  | { type: 'resin'; items: ResinCode[] }
  | { type: 'dropoff'; intro: string; items: DropOffOption[] }
  | { type: 'dolist'; intro?: string; items: DoItem[] };

// ---------------------------------------------------------------------------
// Category content data
// ---------------------------------------------------------------------------

const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  paper: {
    type: 'dolist',
    items: [
      { text: 'Newspapers, magazines, and office paper', ok: true },
      { text: 'Flattened cardboard boxes — break them down before curbing', ok: true },
      { text: 'Paperboard: cereal boxes, tissue boxes, paper towel rolls', ok: true },
      { text: 'Paper bags and envelopes (remove plastic windows)', ok: true },
      { text: 'Greasy pizza box bottoms — top half is usually fine', ok: false },
      { text: 'Shredded paper loose — bag it in a sealed paper bag or find a drop-off', ok: false },
      { text: 'Thermal receipts — the coating makes them unrecyclable', ok: false },
      { text: 'Wax-coated paper, paper plates with food residue', ok: false },
    ],
  },
  plastic: {
    type: 'resin',
    items: [
      { code: 1, name: 'PET', examples: 'Water bottles, soda bottles, salad dressing', acceptance: 'curbside', note: 'Most widely accepted — always rinse.' },
      { code: 2, name: 'HDPE', examples: 'Milk jugs, detergent, shampoo, yogurt tubs', acceptance: 'curbside', note: 'Second most accepted — rinse and replace caps.' },
      { code: 3, name: 'PVC', examples: 'Pipes, vinyl flooring, cables, shower curtains', acceptance: 'trash', note: 'Releases toxic chemicals if incinerated — do not recycle.' },
      { code: 4, name: 'LDPE', examples: 'Plastic bags, cling wrap, bubble wrap, squeezable bottles', acceptance: 'drop-off', note: 'Return to grocery store film-recycling bins.' },
      { code: 5, name: 'PP', examples: 'Yogurt containers, straws, bottle caps, takeout containers', acceptance: 'varies', note: 'Accepted in many programs — check locally.' },
      { code: 6, name: 'PS', examples: 'Styrofoam cups, packaging peanuts, disposable trays', acceptance: 'trash', note: 'Rarely accepted. Some specialty drop-offs exist.' },
      { code: 7, name: 'Other', examples: 'Multi-layer plastic, some water jugs, CDs', acceptance: 'trash', note: 'Mixed or unknown resins — generally not recyclable.' },
    ],
  },
  glass: {
    type: 'dolist',
    items: [
      { text: 'Clear, brown, and green glass bottles and jars', ok: true },
      { text: 'Rinse out food residue before placing in bin', ok: true },
      { text: 'Remove metal lids — recycle them separately in your metal bin', ok: true },
      { text: 'Broken glass — too dangerous for workers, wrap and trash it', ok: false },
      { text: 'Ceramics, Pyrex, or drinking glasses — different melt point, ruins glass batches', ok: false },
      { text: 'Mirrors, window glass, or lightbulbs', ok: false },
      { text: 'Some towns require glass separated from commingled recycling — check locally', ok: 'note' },
    ],
  },
  metal: {
    type: 'dolist',
    items: [
      { text: 'Aluminum cans — rinse, no need to crush', ok: true },
      { text: 'Steel and tin food cans (soup, beans, tomatoes)', ok: true },
      { text: 'Empty aerosol cans — must be completely used up', ok: true },
      { text: 'Aluminum foil — scrunch into a ball larger than a golf ball first', ok: true },
      { text: 'Empty paint cans — dried-out latex paint is fine; oil-based is hazardous', ok: true },
      { text: 'Scrap metal or large metal items — call your DPW or a local scrap yard', ok: false },
      { text: 'Propane tanks — hazardous, see HHW drop-off options', ok: false },
    ],
  },
  electronics: {
    type: 'dropoff',
    intro: 'Electronics contain hazardous materials and must never go in your trash or recycling bin. Drop them off at any of these locations:',
    items: [
      { icon: 'storefront-outline', label: 'Best Buy', detail: 'In-store kiosk accepts phones, tablets, cables, TVs, and most small electronics — no purchase required.' },
      { icon: 'storefront-outline', label: 'Staples', detail: 'Free recycling for computers, printers, monitors, and ink cartridges at all U.S. locations.' },
      { icon: 'logo-apple', label: 'Apple Store', detail: 'Trade-in or free recycling for any Apple device. Apple also accepts other brands through their Renew program.' },
      { icon: 'business-outline', label: 'Municipal E-Waste Events', detail: 'Many towns host free collection days. Check your town\'s website or the Home tab calendar for upcoming events.' },
      { icon: 'cube-outline', label: 'Manufacturer Take-Back', detail: 'Dell, HP, Sony, and many others offer free mail-in or drop-off recycling for their own products.' },
    ],
  },
  hazardous: {
    type: 'dropoff',
    intro: 'Household hazardous waste (HHW) must never be poured down drains, burned, or placed in regular trash. Bring these to a designated drop-off:',
    items: [
      { icon: 'color-palette-outline', label: 'Paints & Solvents', detail: 'Latex paint can be dried out and trashed. Oil-based paint, stains, and varnishes require HHW collection events.' },
      { icon: 'flask-outline', label: 'Pesticides & Herbicides', detail: 'Never pour in drains or soil. HHW drop-off only — check your county\'s scheduled collection dates.' },
      { icon: 'battery-charging-outline', label: 'Batteries', detail: 'Alkaline batteries: many hardware and grocery stores. Lithium/Li-ion: Call2Recycle bins at Home Depot, Lowe\'s, and Staples.' },
      { icon: 'car-outline', label: 'Motor Oil & Antifreeze', detail: 'Auto parts stores (AutoZone, O\'Reilly, Advance Auto) accept used motor oil and antifreeze for free.' },
      { icon: 'water-outline', label: 'Household Cleaners', detail: 'Bring full or partially-used containers to HHW events. Empty, rinsed containers can go in regular recycling.' },
      { icon: 'flame-outline', label: 'Propane Tanks', detail: 'Small camping canisters: check call2recycle.org. Large tanks: return to local propane retailers or HHW events.' },
    ],
  },
  organic: {
    type: 'dolist',
    intro: 'Composting diverts food and yard waste from landfills, where it would generate methane. Check your Home tab calendar for collection days.',
    items: [
      { text: 'Fruit and vegetable scraps', ok: true },
      { text: 'Coffee grounds and unbleached paper filters', ok: true },
      { text: 'Eggshells', ok: true },
      { text: 'Grass clippings, leaves, and yard trimmings', ok: true },
      { text: 'Plain, unbleached paper towels and napkins', ok: true },
      { text: 'Meat, fish, or dairy — attracts pests in backyard compost', ok: false },
      { text: 'Oily or heavily processed foods', ok: false },
      { text: 'Pet waste', ok: false },
    ],
  },
  clothing: {
    type: 'dropoff',
    intro: 'Even worn-out or damaged clothes can be recycled — textiles almost never need to go to landfill.',
    items: [
      { icon: 'heart-outline', label: 'Goodwill / Salvation Army', detail: 'Drop off clothing in wearable condition. Many locations also accept shoes, belts, and bags.' },
      { icon: 'shirt-outline', label: 'H&M Take-Back', detail: 'Accepts any brand in any condition at in-store collection bins. You\'ll receive a discount voucher.' },
      { icon: 'walk-outline', label: 'Nike Reuse-A-Shoe', detail: 'Worn athletic shoes (any brand) are shredded and recycled into sports court surfaces. Drop off at any Nike store.' },
      { icon: 'cube-outline', label: 'ThredUp / Poshmark', detail: 'Request a free mail-in bag to sell or donate gently used items without leaving home.' },
      { icon: 'location-outline', label: 'Municipal Textile Bins', detail: 'Many towns place blue or green textile drop-off containers in parking lots and community centers.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

type Category = { emoji: string; label: string; contentKey: string };
const CATEGORIES: Category[] = [
  { emoji: '📄', label: 'Paper &\nCardboard', contentKey: 'paper' },
  { emoji: '🧴', label: 'Plastic',     contentKey: 'plastic' },
  { emoji: '🍶', label: 'Glass',       contentKey: 'glass' },
  { emoji: '🥫', label: 'Metal',       contentKey: 'metal' },
  { emoji: '💻', label: 'Electronics', contentKey: 'electronics' },
  { emoji: '⚠️', label: 'Hazardous',  contentKey: 'hazardous' },
  { emoji: '🍂', label: 'Organic',     contentKey: 'organic' },
  { emoji: '👕', label: 'Clothing',    contentKey: 'clothing' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getSeasonalTip(): string {
  const month = new Date().getMonth() + 1;
  return (
    SEASONAL_TIPS.find(s => s.months.includes(month))?.tip ??
    'Check your calendar tab for your next scheduled collection day.'
  );
}

const ACCEPTANCE_COLORS: Record<AcceptanceLevel, string> = {
  curbside: '#2E8B57',
  'drop-off': '#D4880A',
  varies: '#3A7BC8',
  trash: '#888',
};

const ACCEPTANCE_LABELS: Record<AcceptanceLevel, string> = {
  curbside: 'Curbside',
  'drop-off': 'Store Drop-Off',
  varies: 'Varies',
  trash: 'Trash',
};

// ---------------------------------------------------------------------------
// Sub-components for sheet content
// ---------------------------------------------------------------------------

function ResinRow({ item }: { item: ResinCode }) {
  const color = ACCEPTANCE_COLORS[item.acceptance];
  return (
    <View style={sheetStyles.resinRow}>
      <View style={[sheetStyles.resinBadge, { backgroundColor: color }]}>
        <Text style={sheetStyles.resinBadgeText}>#{item.code}</Text>
        <Text style={sheetStyles.resinName}>{item.name}</Text>
      </View>
      <View style={sheetStyles.resinInfo}>
        <Text style={sheetStyles.resinExamples}>{item.examples}</Text>
        <Text style={sheetStyles.resinNote}>{item.note}</Text>
      </View>
      <View style={[sheetStyles.resinAcceptBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
        <Text style={[sheetStyles.resinAcceptText, { color }]}>{ACCEPTANCE_LABELS[item.acceptance]}</Text>
      </View>
    </View>
  );
}

function DropOffCard({ item }: { item: DropOffOption }) {
  return (
    <View style={sheetStyles.dropOffCard}>
      <View style={sheetStyles.dropOffIconWrap}>
        <Ionicons name={item.icon} size={22} color="#2E8B57" />
      </View>
      <View style={sheetStyles.dropOffText}>
        <Text style={sheetStyles.dropOffLabel}>{item.label}</Text>
        <Text style={sheetStyles.dropOffDetail}>{item.detail}</Text>
      </View>
    </View>
  );
}

function DoRow({ item }: { item: DoItem }) {
  const icon = item.ok === true ? '✅' : item.ok === false ? '❌' : 'ℹ️';
  return (
    <View style={sheetStyles.doRow}>
      <Text style={sheetStyles.doIcon}>{icon}</Text>
      <Text style={sheetStyles.doText}>{item.text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Myth accordion card
// ---------------------------------------------------------------------------

function MythCard({ myth, reality }: Myth) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.mythCard}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.8}
    >
      <View style={styles.mythHeader}>
        <Text style={styles.mythLabel}>Myth: {myth}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#999"
        />
      </View>
      {open && <Text style={styles.mythReality}>{reality}</Text>}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Sheet content renderer
// ---------------------------------------------------------------------------

function SheetContent({ contentKey }: { contentKey: string }) {
  const content = CATEGORY_CONTENT[contentKey];
  if (!content) return null;

  if (content.type === 'resin') {
    return (
      <View>
        <Text style={sheetStyles.intro}>
          Check the number stamped on the bottom of the container. Rules vary by town — when in doubt, check locally.
        </Text>
        {content.items.map(item => <ResinRow key={item.code} item={item} />)}
        <View style={sheetStyles.legend}>
          {(Object.keys(ACCEPTANCE_COLORS) as AcceptanceLevel[]).map(k => (
            <View key={k} style={sheetStyles.legendItem}>
              <View style={[sheetStyles.legendDot, { backgroundColor: ACCEPTANCE_COLORS[k] }]} />
              <Text style={sheetStyles.legendLabel}>{ACCEPTANCE_LABELS[k]}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (content.type === 'dropoff') {
    return (
      <View>
        <Text style={sheetStyles.intro}>{content.intro}</Text>
        {content.items.map(item => <DropOffCard key={item.label} item={item} />)}
      </View>
    );
  }

  // dolist
  return (
    <View>
      {content.intro ? <Text style={sheetStyles.intro}>{content.intro}</Text> : null}
      {content.items.map((item, i) => <DoRow key={i} item={item} />)}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function LearnScreen() {
  const tipOfDay = TIPS[getDayOfYear() % TIPS.length];
  const seasonalTip = getSeasonalTip();

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const slideAnim = useRef(new Animated.Value(700)).current;

  function openSheet(cat: Category) {
    setActiveCategory(cat);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
  }

  function closeSheet() {
    Animated.timing(slideAnim, {
      toValue: 700,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setActiveCategory(null));
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Learn</Text>
          <Text style={styles.pageSubtitle}>Tips, facts, and recycling guides</Text>
        </View>

        {/* Tip of the Day */}
        <View style={[styles.card, styles.tipCard]}>
          <View style={styles.tipBadge}>
            <Text style={styles.tipBadgeText}>TIP OF THE DAY</Text>
          </View>
          <Text style={styles.tipText}>{tipOfDay}</Text>
        </View>

        {/* What Goes Where */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>WHAT GOES WHERE</Text>
          <Text style={styles.cardSubtitle}>Tap a category to learn more</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.contentKey}
                style={styles.categoryCell}
                onPress={() => openSheet(cat)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Common Myths */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>COMMON MYTHS</Text>
          {MYTHS.map(m => (
            <MythCard key={m.myth} myth={m.myth} reality={m.reality} />
          ))}
        </View>

        {/* Seasonal Tip */}
        <View style={[styles.card, styles.seasonCard]}>
          <View style={styles.seasonHeader}>
            <Ionicons name="leaf-outline" size={18} color="#2E8B57" />
            <Text style={styles.cardTitle}>SEASONAL TIP</Text>
          </View>
          <Text style={styles.seasonText}>{seasonalTip}</Text>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Recycling rules vary by municipality. Always check your local guidelines for the most accurate information.
        </Text>

      </ScrollView>

      {/* Category bottom sheet */}
      <Modal
        visible={!!activeCategory}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        {/* Dimmed backdrop */}
        <TouchableOpacity style={sheetStyles.backdrop} activeOpacity={1} onPress={closeSheet} />

        {/* Sliding panel */}
        <Animated.View style={[sheetStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={sheetStyles.handle} />

          {/* Header */}
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.headerTitle}>
              {activeCategory?.emoji}{'  '}{activeCategory?.label.replace('\n', ' ')}
            </Text>
            <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={28} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={sheetStyles.scroll}
            contentContainerStyle={sheetStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeCategory ? <SheetContent contentKey={activeCategory.contentKey} /> : null}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  scroll: {
    paddingBottom: 48,
  },

  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },

  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 16,
  },

  tipCard: {
    backgroundColor: '#f0faf4',
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  tipBadge: {
    backgroundColor: '#2E8B57',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 15,
    color: '#2d4a35',
    lineHeight: 22,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCell: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  categoryEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },

  mythCard: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 14,
  },
  mythHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  mythLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  mythReality: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginTop: 10,
  },

  seasonCard: {
    backgroundColor: '#f5fbf5',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  seasonText: {
    fontSize: 15,
    color: '#2d4a35',
    lineHeight: 22,
    marginTop: 8,
  },

  disclaimer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
    lineHeight: 18,
  },
});

// ---------------------------------------------------------------------------
// Sheet styles
// ---------------------------------------------------------------------------

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '78%',
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 16,
  },

  // Intro text
  intro: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 18,
  },

  // Resin code rows
  resinRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  resinBadge: {
    width: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flexShrink: 0,
  },
  resinBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
    lineHeight: 16,
  },
  resinName: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  resinInfo: {
    flex: 1,
  },
  resinExamples: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    lineHeight: 18,
    marginBottom: 3,
  },
  resinNote: {
    fontSize: 12,
    color: '#777',
    lineHeight: 17,
  },
  resinAcceptBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  resinAcceptText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666',
  },

  // Drop-off cards
  dropOffCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
  },
  dropOffIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#e8f5ee',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dropOffText: {
    flex: 1,
  },
  dropOffLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  dropOffDetail: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },

  // Do/don't rows
  doRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  doIcon: {
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 0,
  },
  doText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
    flex: 1,
  },
});
