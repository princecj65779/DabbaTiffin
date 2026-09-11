import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "flipkart_bites_cart";

export const ADD_ONS = [
  { id: "curd", label: "Curd", price: 12 },
  { id: "fruit", label: "Fruit", price: 25 },
  { id: "extra_roti", label: "Extra roti", price: 10 },
];

export function CartProvider({ children }) {
  const [activeDate, setActiveDate] = useState(() => readStoredCart().activeDate);
  const [entries, setEntries] = useState(() => readStoredCart().entries);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ activeDate, entries }));
  }, [activeDate, entries]);

  const setItem = (mealType, dailyMenuItem, forDate) => {
    setActiveDate(forDate);
    setEntries((prev) => {
      const current = prev[forDate] || emptyEntry();
      const nextItems = { ...current.items, [mealType]: dailyMenuItem };
      const nextAddOns = dailyMenuItem ? current.addOns : { ...current.addOns, [mealType]: [] };
      const nextEntry = { items: nextItems, addOns: nextAddOns };
      const next = { ...prev, [forDate]: nextEntry };
      if (!nextItems.breakfast && !nextItems.lunch) delete next[forDate];
      return next;
    });
  };

  const toggleAddOn = (mealType, addOnId, forDate = activeDate) => {
    if (!forDate) return;
    setEntries((prev) => {
      const current = prev[forDate] || emptyEntry();
      if (!current.items[mealType]) return prev;
      const selected = current.addOns[mealType] || [];
      const next = selected.includes(addOnId)
        ? selected.filter((id) => id !== addOnId)
        : [...selected, addOnId];
      return {
        ...prev,
        [forDate]: {
          ...current,
          addOns: { ...current.addOns, [mealType]: next },
        },
      };
    });
  };

  const clear = () => {
    setActiveDate(null);
    setEntries({});
  };

  const selectedDates = useMemo(() => Object.keys(entries).sort(), [entries]);
  const activeEntry = activeDate ? entries[activeDate] || emptyEntry() : emptyEntry();

  const selectedMeals = useMemo(
    () =>
      selectedDates.flatMap((date) =>
        ["breakfast", "lunch"]
          .filter((mealType) => entries[date]?.items[mealType])
          .map((mealType) => ({ date, mealType, item: entries[date].items[mealType], addOns: entries[date].addOns[mealType] || [] }))
      ),
    [entries, selectedDates]
  );

  const subtotal = useMemo(() => selectedMeals.reduce((sum, meal) => sum + Number(meal.item.price || 0), 0), [selectedMeals]);
  const addOnTotal = useMemo(
    () =>
      selectedMeals.reduce(
        (sum, meal) => sum + meal.addOns.reduce((mealSum, id) => mealSum + (ADD_ONS.find((addOn) => addOn.id === id)?.price || 0), 0),
        0
      ),
    [selectedMeals]
  );
  const total = subtotal + addOnTotal;
  const count = selectedMeals.length;

  return (
    <CartContext.Provider
      value={{
        date: activeDate,
        items: activeEntry.items,
        addOns: activeEntry.addOns,
        entries,
        selectedDates,
        selectedMeals,
        setItem,
        toggleAddOn,
        clear,
        getItems: (date) => entries[date]?.items || emptyEntry().items,
        getAddOns: (date) => entries[date]?.addOns || emptyEntry().addOns,
        getCount: (date) => countEntry(entries[date]),
        getSubtotal: (date) => subtotalEntry(entries[date]),
        getAddOnTotal: (date) => addOnTotalEntry(entries[date]),
        getTotal: (date) => totalEntry(entries[date]),
        subtotal,
        addOnTotal,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function emptyEntry() {
  return { items: { breakfast: null, lunch: null }, addOns: { breakfast: [], lunch: [] } };
}

function countEntry(entry) {
  if (!entry) return 0;
  return (entry.items.breakfast ? 1 : 0) + (entry.items.lunch ? 1 : 0);
}

function subtotalEntry(entry) {
  if (!entry) return 0;
  return Number(entry.items.breakfast?.price || 0) + Number(entry.items.lunch?.price || 0);
}

function addOnTotalEntry(entry) {
  if (!entry) return 0;
  return Object.values(entry.addOns)
    .flat()
    .reduce((sum, id) => sum + (ADD_ONS.find((addOn) => addOn.id === id)?.price || 0), 0);
}

function totalEntry(entry) {
  return subtotalEntry(entry) + addOnTotalEntry(entry);
}

function readStoredCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
    return {
      activeDate: typeof parsed.activeDate === "string" ? parsed.activeDate : null,
      entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
    };
  } catch {
    return { activeDate: null, entries: {} };
  }
}
