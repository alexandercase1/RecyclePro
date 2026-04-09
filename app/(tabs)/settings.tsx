import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------
// Static content
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

type Category = { emoji: string; label: string; searchTerm: string };
const CATEGORIES: Category[] = [
  { emoji: '📄', label: 'Paper', searchTerm: 'paper' },
  { emoji: '🧴', label: 'Plastic', searchTerm: 'plastic' },
  { emoji: '🍶', label: 'Glass', searchTerm: 'glass' },
  { emoji: '🥫', label: 'Metal', searchTerm: 'metal' },
  { emoji: '💻', label: 'Electronics', searchTerm: 'electronics' },
  { emoji: '⚠️', label: 'Hazardous', searchTerm: 'hazardous' },
  { emoji: '🍂', label: 'Organic', searchTerm: 'compost' },
  { emoji: '👕', label: 'Clothing', searchTerm: 'clothing' },
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

// ---------------------------------------------------------------------------
// Accordion card
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
// Screen
// ---------------------------------------------------------------------------

export default function LearnScreen() {
  const tipOfDay = TIPS[getDayOfYear() % TIPS.length];
  const seasonalTip = getSeasonalTip();

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
          <Text style={styles.cardSubtitle}>Tap a category to search</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <View key={cat.label} style={styles.categoryCell}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </View>
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
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  scroll: {
    paddingBottom: 48,
  },

  // Header
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

  // Card base
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

  // Tip of the Day
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

  // Category grid
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
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },

  // Myths
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

  // Seasonal
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

  // Disclaimer
  disclaimer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
    lineHeight: 18,
  },
});
